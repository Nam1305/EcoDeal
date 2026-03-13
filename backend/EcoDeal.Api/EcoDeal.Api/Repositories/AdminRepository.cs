using EcoDeal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoDeal.Api.Repositories;

public class AdminRepository : IAdminRepository
{
    private readonly EcoDealContext _context;

    public AdminRepository(EcoDealContext context)
    {
        _context = context;
    }

    public async Task<int> GetTotalUsersCountAsync()
    {
        return await _context.Users.CountAsync();
    }

    public async Task<int> GetTotalStoresCountAsync()
    {
        return await _context.Stores.CountAsync();
    }

    public async Task<int> GetTotalOrdersCountAsync()
    {
        return await _context.Orders.CountAsync();
    }

    public async Task<decimal> GetTotalRevenueAsync()
    {
        return await _context.Orders
            .Where(o => o.PaymentStatus == "Completed" || o.PaymentStatus == "Paid")
            .SumAsync(o => o.TotalAmount ?? 0);
    }

    public async Task<int> GetPendingStoreApprovalsCountAsync()
    {
        return await _context.Stores.CountAsync(s => s.IsApproved == false);
    }

    public async Task<IEnumerable<Store>> GetPendingStoresWithUserAsync()
    {
        return await _context.Stores
            .Where(s => s.IsApproved == false)
            .Include(s => s.User)
            .ToListAsync();
    }

    public async Task<IEnumerable<Order>> GetOrdersSinceAsync(DateTime startDate)
    {
        return await _context.Orders
            .Where(o => o.OrderDate >= startDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetUsersAsync()
    {
        return await _context.Users.ToListAsync();
    }
}
