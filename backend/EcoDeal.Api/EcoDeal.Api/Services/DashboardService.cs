using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;
using EcoDeal.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EcoDeal.Api.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepository;
    private readonly EcoDealContext _context;

    public DashboardService(IDashboardRepository dashboardRepository, EcoDealContext context)
    {
        _dashboardRepository = dashboardRepository;
        _context = context;
    }

    private async Task<int?> GetStoreIdByUserIdAsync(int userId)
    {
        var store = await _context.Stores.FirstOrDefaultAsync(s => s.UserId == userId);
        return store?.StoreId;
    }

    public async Task<DashboardOverviewDto> GetOverviewMetricsAsync(int userId)
    {
        var storeId = await GetStoreIdByUserIdAsync(userId);
        if (storeId == null) return new DashboardOverviewDto();
        return await _dashboardRepository.GetOverviewMetricsAsync(storeId.Value);
    }

    public async Task<List<RecentOrderDto>> GetRecentOrdersAsync(int userId, int limit = 5)
    {
        var storeId = await GetStoreIdByUserIdAsync(userId);
        if (storeId == null) return new List<RecentOrderDto>();
        return await _dashboardRepository.GetRecentOrdersAsync(storeId.Value, limit);
    }

    public async Task<List<TopProductDto>> GetTopProductsAsync(int userId, int limit = 5)
    {
        var storeId = await GetStoreIdByUserIdAsync(userId);
        if (storeId == null) return new List<TopProductDto>();
        return await _dashboardRepository.GetTopProductsAsync(storeId.Value, limit);
    }
}
