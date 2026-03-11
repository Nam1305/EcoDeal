using System;
using System.IO;
using System.Threading.Tasks;
using EcoDeal.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace EcoDeal.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WebhookController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IOrderService _orderService;

    public WebhookController(IConfiguration configuration, IOrderService orderService)
    {
        _configuration = configuration;
        _orderService = orderService;
    }

    [HttpPost("stripe")]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        
        try
        {
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                _configuration["Stripe:WebhookSecret"]
            );

            if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
            {
                var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
                if (session != null)
                {
                    // Confirm payment internally
                    await _orderService.CreateOrderFromSessionAsync(session.Id);
                }
            }
            else
            {
                Console.WriteLine("Unhandled event type: {0}", stripeEvent.Type);
            }

            return Ok();
        }
        catch (StripeException e)
        {
            return BadRequest(new { message = e.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
