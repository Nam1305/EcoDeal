using EcoDeal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoDeal.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _adminService.GetAdminStatsAsync();
        return Ok(stats);
    }

    [HttpGet("stores/pending")]
    public async Task<IActionResult> GetPendingStores()
    {
        var stores = await _adminService.GetPendingStoresAsync();
        return Ok(stores);
    }

    [HttpPost("stores/{id}/approve")]
    public async Task<IActionResult> ApproveStore(int id)
    {
        var result = await _adminService.ApproveStoreAsync(id);
        if (!result) return NotFound(new { Message = "Store not found." });
        return Ok(new { Message = "Store approved successfully." });
    }

    [HttpPost("stores/{id}/reject")]
    public async Task<IActionResult> RejectStore(int id)
    {
        var result = await _adminService.RejectStoreAsync(id);
        if (!result) return NotFound(new { Message = "Store not found." });
        return Ok(new { Message = "Store rejected." });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(users);
    }
}
