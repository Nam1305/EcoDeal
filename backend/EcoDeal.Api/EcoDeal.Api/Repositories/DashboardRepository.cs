using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoDeal.Api.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly EcoDealContext _context;

    public DashboardRepository(EcoDealContext context)
    {
        _context = context;
    }

    public async Task<DashboardOverviewDto> GetOverviewMetricsAsync(int storeId)
    {
        var activeProductsCount = await _context.Products
            .Where(p => p.StoreId == storeId && p.IsActive == true)
            .CountAsync();

        var storeOrderDetails = _context.OrderDetails
            .Include(od => od.Order)
            .Include(od => od.Product)
            .Where(od => od.Product.StoreId == storeId);

        var totalRevenue = await storeOrderDetails
            .SumAsync(od => (decimal?)((od.Quantity ?? 0) * (od.UnitPrice ?? 0))) ?? 0m;

        var totalOrders = await storeOrderDetails
            .Select(od => od.OrderId)
            .Distinct()
            .CountAsync();

        return new DashboardOverviewDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            ActiveProducts = activeProductsCount
        };
    }

    public async Task<List<RecentOrderDto>> GetRecentOrdersAsync(int storeId, int limit)
    {
        var recentOrders = await _context.OrderDetails
            .Include(od => od.Order)
            .ThenInclude(o => o.User)
            .Include(od => od.Product)
            .Where(od => od.Product.StoreId == storeId)
            .GroupBy(od => od.Order)
            .Select(g => new RecentOrderDto
            {
                OrderId = g.Key.OrderId,
                OrderDate = g.Key.OrderDate,
                CustomerName = g.Key.User.FullName,
                StoreTotalAmount = g.Sum(od => (decimal?)((od.Quantity ?? 0) * (od.UnitPrice ?? 0))) ?? 0m,
                Status = g.Key.Status
            })
            .OrderByDescending(o => o.OrderDate)
            .Take(limit)
            .ToListAsync();

        return recentOrders;
    }

    public async Task<List<TopProductDto>> GetTopProductsAsync(int storeId, int limit)
    {
        var topProducts = await _context.OrderDetails
            .Include(od => od.Product)
            .Where(od => od.Product.StoreId == storeId)
            .GroupBy(od => od.Product)
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                ImageUrl = g.Key.ImageUrl,
                QuantitySold = g.Sum(od => (int?)(od.Quantity ?? 0)) ?? 0,
                Revenue = g.Sum(od => (decimal?)((od.Quantity ?? 0) * (od.UnitPrice ?? 0))) ?? 0m
            })
            .OrderByDescending(p => p.QuantitySold)
            .Take(limit)
            .ToListAsync();

        return topProducts;
    }
}
