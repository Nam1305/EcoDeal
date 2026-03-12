using EcoDeal.Api.DTOs;

namespace EcoDeal.Api.Services;

public interface IWithdrawalService
{
    Task CreateRequestAsync(int userId, WithdrawalRequestDto dto);
    Task<IEnumerable<WithdrawalResponseDto>> GetUserRequestsAsync(int userId);
    Task<IEnumerable<WithdrawalResponseDto>> GetAllRequestsAsync(string? status);
    Task ApproveAsync(int requestId, string? note);
    Task RejectAsync(int requestId, string? note);
}
