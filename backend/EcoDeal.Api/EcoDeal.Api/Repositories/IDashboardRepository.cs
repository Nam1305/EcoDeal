using EcoDeal.Api.DTOs;

namespace EcoDeal.Api.Repositories;

public interface IDashboardRepository
{
    Task<DashboardOverviewDto> GetOverviewMetricsAsync(int storeId);
    Task<List<RecentOrderDto>> GetRecentOrdersAsync(int storeId, int limit);
    Task<List<TopProductDto>> GetTopProductsAsync(int storeId, int limit);
}
