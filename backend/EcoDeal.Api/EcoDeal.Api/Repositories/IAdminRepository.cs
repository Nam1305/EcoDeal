using EcoDeal.Api.Models;

namespace EcoDeal.Api.Repositories;

public interface IAdminRepository
{
    Task<int> GetTotalUsersCountAsync();
    Task<int> GetTotalStoresCountAsync();
    Task<int> GetTotalOrdersCountAsync();
    Task<decimal> GetTotalRevenueAsync();
    Task<int> GetPendingStoreApprovalsCountAsync();
    Task<IEnumerable<Store>> GetPendingStoresWithUserAsync();
    Task<IEnumerable<Order>> GetOrdersSinceAsync(DateTime startDate);
    Task<IEnumerable<User>> GetUsersAsync();
}
