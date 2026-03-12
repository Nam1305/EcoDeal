using EcoDeal.Api.DTOs;
using System.Threading.Tasks;

namespace EcoDeal.Api.Services;

public interface IWalletService
{
    Task<WalletDto> GetWalletByUserIdAsync(int userId);
    Task AddBalanceAsync(int userId, decimal amount, string transactionType = "Payout", int? orderId = null);
    Task RequestWithdrawalAsync(int userId, decimal amount);
}
