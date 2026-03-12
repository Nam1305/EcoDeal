using EcoDeal.Api.DTOs;
using EcoDeal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcoDeal.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetByProductId(int productId)
    {
        var reviews = await _reviewService.GetReviewsByProductIdAsync(productId);
        return Ok(reviews);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> Create(CreateReviewRequest request)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId))
        {
            return Unauthorized();
        }

        var result = await _reviewService.AddReviewAsync(userId, request);
        if (result == null)
        {
            return BadRequest("Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng và đơn hàng đã hoàn thành.");
        }

        return CreatedAtAction(nameof(GetByProductId), new { productId = result.ProductId }, result);
    }
}
