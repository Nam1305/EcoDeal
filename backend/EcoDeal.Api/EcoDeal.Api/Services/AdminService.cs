using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;
using EcoDeal.Api.Repositories;

namespace EcoDeal.Api.Services;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IStoreRepository _storeRepository;
    private readonly IUserRepository _userRepository;

    public AdminService(IAdminRepository adminRepository, IStoreRepository storeRepository, IUserRepository userRepository)
    {
        _adminRepository = adminRepository;
        _storeRepository = storeRepository;
        _userRepository = userRepository;
    }

    public async Task<AdminStatsDto> GetAdminStatsAsync()
    {
        return new AdminStatsDto
        {
            TotalUsers = await _adminRepository.GetTotalUsersCountAsync(),
            TotalStores = await _adminRepository.GetTotalStoresCountAsync(),
            TotalOrders = await _adminRepository.GetTotalOrdersCountAsync(),
            TotalRevenue = await _adminRepository.GetTotalRevenueAsync(),
            PendingStoreApprovals = await _adminRepository.GetPendingStoreApprovalsCountAsync()
        };
    }

    public async Task<IEnumerable<AdminStoreDto>> GetPendingStoresAsync()
    {
        var stores = await _adminRepository.GetPendingStoresWithUserAsync();
        return stores.Select(s => new AdminStoreDto
        {
            StoreId = s.StoreId,
            StoreName = s.StoreName,
            OwnerName = s.User?.FullName ?? "Unknown",
            StoreEmail = s.StoreEmail,
            StorePhone = s.StorePhone,
            IsApproved = s.IsApproved
        });
    }

    public async Task<bool> ApproveStoreAsync(int storeId)
    {
        var store = await _storeRepository.GetByIdAsync(storeId);
        if (store == null) return false;

        store.IsApproved = true;

        if (store.UserId != 0)
        {
            var user = await _userRepository.GetByIdAsync(store.UserId);
            if (user != null && user.Role != "StoreOwner")
            {
                user.Role = "StoreOwner";
                await _userRepository.UpdateAsync(user);
            }
        }

        await _storeRepository.UpdateAsync(store);
        return true;
    }

    public async Task<bool> RejectStoreAsync(int storeId)
    {
        var store = await _storeRepository.GetByIdAsync(storeId);
        if (store == null) return false;

        await _storeRepository.DeleteAsync(storeId);
        return true; 
    }

    public async Task<IEnumerable<UserProfileDto>> GetAllUsersAsync()
    {
        var users = await _adminRepository.GetUsersAsync();
        return users.Select(u => new UserProfileDto
        {
            UserId = u.UserId,
            FullName = u.FullName,
            Email = u.Email,
            PhoneNumber = u.PhoneNumber,
            Address = u.Address,
            Latitude = u.Latitude,
            Longitude = u.Longitude,
            Role = u.Role
        });
    }

    public async Task<IEnumerable<MonthlyGrowthDto>> GetMonthlyGrowthAsync(int months = 6)
    {
        var startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(-months + 1);

        var orders = await _adminRepository.GetOrdersSinceAsync(startDate);

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
