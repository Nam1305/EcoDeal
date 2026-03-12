using EcoDeal.Api.Models;
using EcoDeal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcoDeal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WithdrawalController : ControllerBase
{
    private readonly IWithdrawalService _withdrawalService;

    public WithdrawalController(IWithdrawalService withdrawalService)
    {
        _withdrawalService = withdrawalService;
    }

    // POST: api/Withdrawal — User submits a request
    [HttpPost]
    public async Task<IActionResult> RequestWithdrawal([FromBody] WithdrawalRequestDto dto)
    {
        try
        {
            var userId = GetUserId();
            await _withdrawalService.CreateRequestAsync(userId, dto);
            return Ok(new { message = "Yêu cầu rút tiền đã được gửi. Admin sẽ xử lý trong vòng 1-2 ngày làm việc." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET: api/Withdrawal/my — Get current user's requests
    [HttpGet("my")]
    public async Task<IActionResult> GetMyRequests()
    {
        var userId = GetUserId();
        var requests = await _withdrawalService.GetUserRequestsAsync(userId);
        return Ok(requests);
    }

    // GET: api/Withdrawal/all — Admin: get all requests
    [Authorize(Roles = "Admin")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllRequests([FromQuery] string? status = null)
    {
        var requests = await _withdrawalService.GetAllRequestsAsync(status);
        return Ok(requests);
    }

    // POST: api/Withdrawal/{id}/approve — Admin approves
    [Authorize(Roles = "Admin")]
    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(int id, [FromBody] AdminActionDto dto)
    {
        try
        {
            await _withdrawalService.ApproveAsync(id, dto.Note);
            return Ok(new { message = "Đã duyệt yêu cầu rút tiền thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/Withdrawal/{id}/reject — Admin rejects
    [Authorize(Roles = "Admin")]
    [HttpPost("{id}/reject")]
    public async Task<IActionResult> Reject(int id, [FromBody] AdminActionDto dto)
    {
        try
        {
            await _withdrawalService.RejectAsync(id, dto.Note);
            return Ok(new { message = "Đã từ chối yêu cầu rút tiền." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null) throw new UnauthorizedAccessException();
        return int.Parse(claim.Value);
    }
}

// DTOs within the controller file for simplicity
public class WithdrawalRequestDto
{
    public decimal Amount { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountHolder { get; set; } = string.Empty;
}

public class AdminActionDto
{
    public string? Note { get; set; }
}
