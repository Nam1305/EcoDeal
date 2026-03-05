using EcoDeal.Api.DTOs;

namespace EcoDeal.Api.Services;

public interface IDashboardService
{
    Task<DashboardOverviewDto> GetOverviewMetricsAsync(int userId);
    Task<List<RecentOrderDto>> GetRecentOrdersAsync(int userId, int limit = 5);
    Task<List<TopProductDto>> GetTopProductsAsync(int userId, int limit = 5);
}
