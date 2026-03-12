using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using EcoDeal.Api.DTOs;
using EcoDeal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoDeal.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "StoreOwner")]
public class StoreOrderController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IStoreService _storeService;

    public StoreOrderController(IOrderService orderService, IStoreService storeService)
    {
        _orderService = orderService;
        _storeService = storeService;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? int.Parse(userIdClaim) : 0;
    }

    private async Task<int> GetCurrentStoreId()
    {
        var userId = GetCurrentUserId();
        var store = await _storeService.GetStoreByUserIdAsync(userId);
        if (store == null) throw new Exception("Store not found for this user.");
        return store.StoreId;
    }

    [HttpGet]
    public async Task<IActionResult> GetStoreOrders()
    {
        try
        {
            var userId = GetCurrentUserId();
            var store = await _storeService.GetStoreByUserIdAsync(userId);
            
            if (store == null)
            {
                return NotFound(new { message = "Store profile not found for this account. Please create a store first." });
            }

            var orders = await _orderService.GetOrdersByStoreIdAsync(store.StoreId);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
    {
        try
        {
            var userId = GetCurrentUserId();
            // Validate that the user has a store first
            var store = await _storeService.GetStoreByUserIdAsync(userId);
            if (store == null) return NotFound(new { message = "Store not found." });

            await _orderService.UpdateOrderStatusAsync(id, status, userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
