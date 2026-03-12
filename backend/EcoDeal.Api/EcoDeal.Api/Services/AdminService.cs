using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoDeal.Api.Services;

public class AdminService : IAdminService
{
    private readonly EcoDealContext _context;

    public AdminService(EcoDealContext context)
    {
        _context = context;
    }

    public async Task<AdminStatsDto> GetAdminStatsAsync()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalStores = await _context.Stores.CountAsync();
        var totalOrders = await _context.Orders.CountAsync();
        var totalRevenue = await _context.Orders
            .Where(o => o.PaymentStatus == "Completed" || o.PaymentStatus == "Paid")
            .SumAsync(o => o.TotalAmount ?? 0);
        
        var pendingApprovals = await _context.Stores.CountAsync(s => s.IsApproved == false);

        return new AdminStatsDto
        {
            TotalUsers = totalUsers,
            TotalStores = totalStores,
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue,
            PendingStoreApprovals = pendingApprovals
        };
    }

    public async Task<IEnumerable<AdminStoreDto>> GetPendingStoresAsync()
    {
        return await _context.Stores
            .Where(s => s.IsApproved == false)
            .Include(s => s.User)
            .Select(s => new AdminStoreDto
            {
                StoreId = s.StoreId,
                StoreName = s.StoreName,
                OwnerName = s.User.FullName,
                StoreEmail = s.StoreEmail,
                StorePhone = s.StorePhone,
                IsApproved = s.IsApproved
            })
            .ToListAsync();
    }

    public async Task<bool> ApproveStoreAsync(int storeId)
    {
        var store = await _context.Stores.Include(s => s.User).FirstOrDefaultAsync(s => s.StoreId == storeId);
        if (store == null) return false;

        store.IsApproved = true;

        if (store.User != null && store.User.Role != "StoreOwner")
        {
            store.User.Role = "StoreOwner";
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectStoreAsync(int storeId)
    {
        var store = await _context.Stores.FindAsync(storeId);
        if (store == null) return false;

        // Xóa yêu cầu đăng ký nếu Reject
        _context.Stores.Remove(store);
        await _context.SaveChangesAsync();
        return true; 
    }

    public async Task<IEnumerable<UserProfileDto>> GetAllUsersAsync()
    {
        return await _context.Users
            .Select(u => new UserProfileDto
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Address = u.Address,
                Latitude = u.Latitude,
                Longitude = u.Longitude,
                Role = u.Role
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<MonthlyGrowthDto>> GetMonthlyGrowthAsync(int months = 6)
    {
        var startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(-months + 1);

        var orders = await _context.Orders
            .Where(o => o.OrderDate >= startDate)
            .ToListAsync();

        var grouped = orders
            .GroupBy(o => new { o.OrderDate!.Value.Year, o.OrderDate.Value.Month })
            .Select(g => new MonthlyGrowthDto
            {
                Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                Orders = g.Count(),
                Revenue = g.Sum(o => o.TotalAmount ?? 0)
            })
            .OrderBy(g => g.Month)
            .ToList();

        // Fill in missing months with zeros
        var result = new List<MonthlyGrowthDto>();
        for (int i = 0; i < months; i++)
        {
            var date = startDate.AddMonths(i);
            var key = $"{date.Year}-{date.Month:D2}";
            var existing = grouped.FirstOrDefault(g => g.Month == key);
            result.Add(existing ?? new MonthlyGrowthDto { Month = key, Orders = 0, Revenue = 0 });
        }

        return result;
    }
}
