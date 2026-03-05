using EcoDeal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcoDeal.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "StoreOwner")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    private int GetCurrentUserId()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdString, out int userId))
        {
            return userId;
        }
        throw new UnauthorizedAccessException("User ID is missing or invalid in token.");
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverviewMetrics()
    {
        try
        {
            int userId = GetCurrentUserId();
            var metrics = await _dashboardService.GetOverviewMetricsAsync(userId);
            return Ok(metrics);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("recent-orders")]
    public async Task<IActionResult> GetRecentOrders([FromQuery] int limit = 5)
    {
        try
        {
            int userId = GetCurrentUserId();
            var orders = await _dashboardService.GetRecentOrdersAsync(userId, limit);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("top-products")]
    public async Task<IActionResult> GetTopProducts([FromQuery] int limit = 5)
    {
        try
        {
            int userId = GetCurrentUserId();
            var products = await _dashboardService.GetTopProductsAsync(userId, limit);
            return Ok(products);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
