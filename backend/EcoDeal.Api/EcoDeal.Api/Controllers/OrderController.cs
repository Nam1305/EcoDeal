using System;
using System.Security.Claims;
using System.Threading.Tasks;
using EcoDeal.Api.DTOs;
using EcoDeal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoDeal.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? int.Parse(userIdClaim) : 0;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
    {
        try
        {
            var response = await _orderService.CreateCheckoutSessionAsync(GetCurrentUserId(), request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        try
        {
            var orders = await _orderService.GetOrdersByUserIdAsync(GetCurrentUserId());
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderById(int id)
    {
        try
        {
            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null || order.UserId != GetCurrentUserId())
            {
                // Simple authorization to only view own orders unless Admin
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "Admin" && order?.UserId != GetCurrentUserId())
                    return Unauthorized();
            }

            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmPayment([FromBody] CheckoutResponse request)
    {
        // Simple polling endpoint to confirm payment manually via frontend sync if webhook is not working locally
        try
        {
            if (string.IsNullOrEmpty(request.SessionId))
                return BadRequest(new { message = "SessionId is required." });
                
            var order = await _orderService.CreateOrderFromSessionAsync(request.SessionId);
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        try
        {
            await _orderService.CancelOrderAsync(id, GetCurrentUserId());
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/receive")]
    public async Task<IActionResult> MarkAsReceived(int id)
    {
        try
        {
            await _orderService.MarkOrderAsReceivedAsync(id, GetCurrentUserId());
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
