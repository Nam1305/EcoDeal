using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;
using EcoDeal.Api.Repositories;
using Microsoft.Extensions.Configuration;
using Stripe.Checkout;

namespace EcoDeal.Api.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly ICartRepository _cartRepository;
    private readonly IConfiguration _configuration;

    public OrderService(IOrderRepository orderRepository, ICartRepository cartRepository, IConfiguration configuration)
    {
        _orderRepository = orderRepository;
        _cartRepository = cartRepository;
        _configuration = configuration;
    }

    public async Task<CheckoutResponse> CreateCheckoutSessionAsync(int userId, CheckoutRequest request)
    {
        var cart = await _cartRepository.GetCartByUserIdAsync(userId);
        if (cart == null || !cart.CartItems.Any())
            throw new Exception("Cart is empty.");

        var lineItems = new List<SessionLineItemOptions>();

        foreach (var item in cart.CartItems)
        {
            long priceInCent = (long)((item.Product.DiscountedPrice ?? item.Product.OriginalPrice ?? 0) * 100);
            
            lineItems.Add(new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    UnitAmount = priceInCent,
                    Currency = "vnd", // Ensure this matches your expected currency
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = item.Product.ProductName,
                    },
                },
                Quantity = item.Quantity.GetValueOrDefault(1),
            });
        }

        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = lineItems,
            Mode = "payment",
            SuccessUrl = request.SuccessUrl + "?session_id={CHECKOUT_SESSION_ID}",
            CancelUrl = request.CancelUrl,
        };

        var service = new SessionService();
        Session session = await service.CreateAsync(options);

        // Pre-create Order as Pending
        var order = new Order
        {
            UserId = userId,
            OrderDate = DateTime.Now,
            TotalAmount = cart.CartItems.Sum(c => (c.Product.DiscountedPrice ?? c.Product.OriginalPrice ?? 0) * c.Quantity),
            Status = "Pending",
            PaymentStatus = "Unpaid",
            PaymentMethod = "Stripe",
            StripeSessionId = session.Id,
            ShippingAddress = request.ShippingAddress,
            ShippingPhone = request.ShippingPhone,
            OrderDetails = cart.CartItems.Select(ci => new OrderDetail
            {
                ProductId = ci.ProductId,
                Quantity = ci.Quantity,
                UnitPrice = ci.Product.DiscountedPrice ?? ci.Product.OriginalPrice ?? 0
            }).ToList()
        };

        await _orderRepository.CreateOrderAsync(order);
        // Do not clear cart yet, wait until webhook or success page confirms payment.

        return new CheckoutResponse
        {
            SessionId = session.Id,
            SessionUrl = session.Url
        };
    }

    public async Task<OrderDto> CreateOrderFromSessionAsync(string sessionId)
    {
        var order = await _orderRepository.GetOrderBySessionIdAsync(sessionId);
        if (order == null) throw new Exception("Order not found.");

        if (order.PaymentStatus != "Paid")
        {
            // Verify session with Stripe
            var service = new SessionService();
            var session = await service.GetAsync(sessionId);

            if (session.PaymentStatus == "paid")
            {
                order.Status = "Paid";
                order.PaymentStatus = "Paid";
                await _orderRepository.UpdateOrderAsync(order);

                // Clear constraints if any or Clear cart completely here
                var cartToClear = await _cartRepository.GetCartByUserIdAsync(order.UserId);
                if (cartToClear != null)
                {
                    await _cartRepository.ClearCartAsync(cartToClear.CartId);
                }
            }
        }

        return MapToDto(order);
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int orderId)
    {
        var order = await _orderRepository.GetOrderByIdAsync(orderId);
        return order == null ? null : MapToDto(order);
    }

    public async Task<IEnumerable<OrderDto>> GetOrdersByUserIdAsync(int userId)
    {
        var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);
        return orders.Select(MapToDto).ToList();
    }

    private OrderDto MapToDto(Order order)
    {
        return new OrderDto
        {
            OrderId = order.OrderId,
            UserId = order.UserId,
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            PaymentStatus = order.PaymentStatus,
            PaymentMethod = order.PaymentMethod,
            ShippingAddress = order.ShippingAddress,
            ShippingPhone = order.ShippingPhone,
            OrderDetails = order.OrderDetails.Select(od => new OrderDetailDto
            {
                OrderDetailId = od.OrderDetailId,
                ProductId = od.ProductId,
                ProductName = od.Product.ProductName,
                Quantity = od.Quantity,
                UnitPrice = od.UnitPrice,
                ImageUrl = od.Product.ImageUrl
            }).ToList()
        };
    }
}
