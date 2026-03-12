using EcoDeal.Api.Controllers;
using EcoDeal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoDeal.Api.Services;

public class WithdrawalResponseDto
{
    public int RequestId { get; set; }
    public decimal Amount { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountHolder { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? UserFullName { get; set; }
    public string? UserEmail { get; set; }
}

public interface IWithdrawalService
{
    Task CreateRequestAsync(int userId, WithdrawalRequestDto dto);
    Task<IEnumerable<WithdrawalResponseDto>> GetUserRequestsAsync(int userId);
    Task<IEnumerable<WithdrawalResponseDto>> GetAllRequestsAsync(string? status);
    Task ApproveAsync(int requestId, string? note);
    Task RejectAsync(int requestId, string? note);
}

public class WithdrawalService : IWithdrawalService
{
    private readonly EcoDealContext _context;
    private readonly IWalletService _walletService;

    public WithdrawalService(EcoDealContext context, IWalletService walletService)
    {
        _context = context;
        _walletService = walletService;
    }

    public async Task CreateRequestAsync(int userId, WithdrawalRequestDto dto)
    {
        if (dto.Amount <= 0)
            throw new Exception("Số tiền rút phải lớn hơn 0.");

        // Check wallet balance
        var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wallet == null || wallet.Balance < dto.Amount)
            throw new Exception("Số dư trong ví không đủ để thực hiện yêu cầu này.");

        // Check for existing pending request
        var hasPending = await _context.WithdrawalRequests
            .AnyAsync(r => r.UserId == userId && r.Status == "Pending");
        if (hasPending)
            throw new Exception("Bạn đã có một yêu cầu rút tiền đang chờ xử lý. Vui lòng chờ Admin xử lý trước khi tạo yêu cầu mới.");

        // Hold the amount (deduct from available balance, but mark as "pending" in wallet)
        // We don't deduct yet — we deduct only when Admin approves.
        var request = new WithdrawalRequest
        {
            UserId = userId,
            Amount = dto.Amount,
            BankName = dto.BankName,
            AccountNumber = dto.AccountNumber,
            AccountHolder = dto.AccountHolder,
            Status = "Pending",
            CreatedAt = DateTime.Now
        };

        _context.WithdrawalRequests.Add(request);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<WithdrawalResponseDto>> GetUserRequestsAsync(int userId)
    {
        return await _context.WithdrawalRequests
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => MapToDto(r, null, null))
            .ToListAsync();
    }

    public async Task<IEnumerable<WithdrawalResponseDto>> GetAllRequestsAsync(string? status)
    {
        var query = _context.WithdrawalRequests
            .Include(r => r.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(r => r.Status == status);

        return await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => MapToDto(r, r.User.FullName, r.User.Email))
            .ToListAsync();
    }

    public async Task ApproveAsync(int requestId, string? note)
    {
        var request = await _context.WithdrawalRequests
            .FirstOrDefaultAsync(r => r.RequestId == requestId);

        if (request == null)
            throw new Exception("Không tìm thấy yêu cầu rút tiền.");

        if (request.Status != "Pending")
            throw new Exception("Yêu cầu này đã được xử lý rồi.");

        // Deduct from wallet
        var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == request.UserId);
        if (wallet == null || wallet.Balance < request.Amount)
            throw new Exception("Số dư ví người dùng không đủ để hoàn tất yêu cầu này.");

        wallet.Balance -= request.Amount;
        wallet.UpdatedAt = DateTime.Now;

        // Record the wallet transaction
        _context.WalletTransactions.Add(new WalletTransaction
        {
            WalletId = wallet.WalletId,
            Amount = -request.Amount,
            Type = "Withdrawal",
            CreatedAt = DateTime.Now
        });

        // Update request status
        request.Status = "Approved";
        request.AdminNote = note;
        request.ProcessedAt = DateTime.Now;

        await _context.SaveChangesAsync();
    }

    public async Task RejectAsync(int requestId, string? note)
    {
        var request = await _context.WithdrawalRequests
            .FirstOrDefaultAsync(r => r.RequestId == requestId);

        if (request == null)
            throw new Exception("Không tìm thấy yêu cầu rút tiền.");

        if (request.Status != "Pending")
            throw new Exception("Yêu cầu này đã được xử lý rồi.");

        // No wallet deduction for rejection — money stays in wallet
        request.Status = "Rejected";
        request.AdminNote = note;
        request.ProcessedAt = DateTime.Now;

        await _context.SaveChangesAsync();
    }

    private static WithdrawalResponseDto MapToDto(WithdrawalRequest r, string? fullName, string? email)
    {
        return new WithdrawalResponseDto
        {
            RequestId = r.RequestId,
            Amount = r.Amount,
            BankName = r.BankName,
            AccountNumber = r.AccountNumber,
            AccountHolder = r.AccountHolder,
            Status = r.Status,
            AdminNote = r.AdminNote,
            CreatedAt = r.CreatedAt,
            ProcessedAt = r.ProcessedAt,
            UserFullName = fullName,
            UserEmail = email
        };
    }
}
