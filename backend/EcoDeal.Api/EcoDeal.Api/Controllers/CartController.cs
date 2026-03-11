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
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? int.Parse(userIdClaim) : 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        try
        {
            var cart = await _cartService.GetCartAsync(GetCurrentUserId());
            return Ok(cart);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItemToCart([FromBody] AddCartItemRequest request)
    {
        try
        {
            var cart = await _cartService.AddItemToCartAsync(GetCurrentUserId(), request);
            return Ok(cart);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("items/{cartItemId}")]
    public async Task<IActionResult> UpdateItemQuantity(int cartItemId, [FromBody] UpdateCartItemRequest request)
    {
        try
        {
            var cart = await _cartService.UpdateItemQuantityAsync(GetCurrentUserId(), cartItemId, request.Quantity);
            return Ok(cart);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("items/{cartItemId}")]
    public async Task<IActionResult> RemoveItemFromCart(int cartItemId)
    {
        try
        {
            var cart = await _cartService.RemoveItemFromCartAsync(GetCurrentUserId(), cartItemId);
            return Ok(cart);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        try
        {
            await _cartService.ClearCartAsync(GetCurrentUserId());
            return Ok(new { message = "Cart cleared." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
