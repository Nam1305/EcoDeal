using EcoDeal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EcoDeal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WalletController : ControllerBase
{
    private readonly IWalletService _walletService;

    public WalletController(IWalletService walletService)
    {
        _walletService = walletService;
    }

    [HttpGet]
    public async Task<IActionResult> GetWallet()
    {
        var userId = GetCurrentUserId();
        var wallet = await _walletService.GetWalletByUserIdAsync(userId);
        return Ok(wallet);
    }

    [HttpPost("withdraw")]
    public async Task<IActionResult> RequestWithdrawal([FromBody] decimal amount)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _walletService.RequestWithdrawalAsync(userId, amount);
            return Ok(new { message = "Withdrawal request submitted successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User is not authenticated.");
        return int.Parse(userIdClaim.Value);
    }
}
