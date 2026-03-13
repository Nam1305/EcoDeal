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
    private readonly IWalletService _walletService;

    public OrderService(IOrderRepository orderRepository, ICartRepository cartRepository, IConfiguration configuration, IWalletService walletService)
    {
        _orderRepository = orderRepository;
        _cartRepository = cartRepository;
        _configuration = configuration;
        _walletService = walletService;
    }

    public async Task<CheckoutResponse> CreateCheckoutSessionAsync(int userId, CheckoutRequest request)
    {
        var cart = await _cartRepository.GetCartByUserIdAsync(userId);
        if (cart == null || !cart.CartItems.Any())
            throw new Exception("Cart is empty.");

        // Pre-create Orders, grouped by StoreId
        var groupedItems = cart.CartItems.GroupBy(ci => ci.Product.StoreId);
        string paymentMethod = request.PaymentMethod ?? "Stripe";
        int? firstOrderId = null;

        if (paymentMethod == "COD")
        {
            foreach (var group in groupedItems)
            {
                var storeId = group.Key;
                var items = group.ToList();

                var order = new Order
                {
                    UserId = userId,
                    StoreId = storeId,
                    OrderDate = DateTime.Now,
                    TotalAmount = items.Sum(c => (c.Product.DiscountedPrice ?? c.Product.OriginalPrice ?? 0) * c.Quantity),
                    Status = "Pending",
                    PaymentStatus = "Unpaid",
                    PaymentMethod = "COD",
                    ShippingAddress = request.ShippingAddress,
                    ShippingPhone = request.ShippingPhone,
                    OrderDetails = items.Select(ci => new OrderDetail
                    {
                        ProductId = ci.ProductId,
                        Quantity = ci.Quantity,
                        UnitPrice = ci.Product.DiscountedPrice ?? ci.Product.OriginalPrice ?? 0
                    }).ToList()
                };

                await _orderRepository.CreateOrderAsync(order);
                if (firstOrderId == null) firstOrderId = order.OrderId;
            }

            // Clear cart immediately for COD
            await _cartRepository.ClearCartAsync(cart.CartId);

            return new CheckoutResponse
            {
                IsCod = true,
                OrderId = firstOrderId
            };
        }
        else
        {
            // Stripe flow (Default)
            var lineItems = new List<SessionLineItemOptions>();

            foreach (var item in cart.CartItems)
            {
                long priceInCent = (long)((item.Product.DiscountedPrice ?? item.Product.OriginalPrice ?? 0) * 100);

                lineItems.Add(new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = priceInCent,
                        Currency = "vnd",
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

            foreach (var group in groupedItems)
            {
                var storeId = group.Key;
                var items = group.ToList();

                var order = new Order
                {
                    UserId = userId,
                    StoreId = storeId,
                    OrderDate = DateTime.Now,
                    TotalAmount = items.Sum(c => (c.Product.DiscountedPrice ?? c.Product.OriginalPrice ?? 0) * c.Quantity),
                    Status = "Pending",
                    PaymentStatus = "Unpaid",
                    PaymentMethod = "Stripe",
                    StripeSessionId = session.Id,
                    ShippingAddress = request.ShippingAddress,
                    ShippingPhone = request.ShippingPhone,
                    OrderDetails = items.Select(ci => new OrderDetail
                    {
                        ProductId = ci.ProductId,
                        Quantity = ci.Quantity,
                        UnitPrice = ci.Product.DiscountedPrice ?? ci.Product.OriginalPrice ?? 0
                    }).ToList()
                };

                await _orderRepository.CreateOrderAsync(order);
            }

            return new CheckoutResponse
            {
                SessionId = session.Id,
                SessionUrl = session.Url,
                IsCod = false
            };
        }
    }

    public async Task<OrderDto> CreateOrderFromSessionAsync(string sessionId)
    {
        var orders = await _orderRepository.GetOrdersBySessionIdAsync(sessionId);
        if (!orders.Any()) throw new Exception("Order not found.");

        var firstOrder = orders.First();
        if (firstOrder.PaymentStatus != "Paid")
        {
            // Verify session with Stripe
            var service = new SessionService();
            var session = await service.GetAsync(sessionId);

            if (session.PaymentStatus == "paid")
            {
                foreach (var order in orders)
                {
                    order.Status = "Paid";
                    order.PaymentStatus = "Paid";
                    await _orderRepository.UpdateOrderAsync(order);
                }

                // Clear constraints if any or Clear cart completely here
                var cartToClear = await _cartRepository.GetCartByUserIdAsync(firstOrder.UserId);
                if (cartToClear != null)
                {
                    await _cartRepository.ClearCartAsync(cartToClear.CartId);
                }
            }
        }

        return MapToDto(firstOrder);
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

    public async Task<IEnumerable<OrderDto>> GetOrdersByStoreIdAsync(int storeId)
    {
        var orders = await _orderRepository.GetOrdersByStoreIdAsync(storeId);
        return orders.Select(MapToDto).ToList();
    }

    public async Task UpdateOrderStatusAsync(int orderId, string status, int storeOwnerId)
    {
        var order = await _orderRepository.GetOrderByIdAsync(orderId);
        if (order == null) throw new Exception("Order not found.");
        
        // Simple verification: Store belongs to owner
        if (order.Store?.UserId != storeOwnerId)
            throw new UnauthorizedAccessException("You are not authorized to update this order.");

        order.Status = status;
        await _orderRepository.UpdateOrderAsync(order);
    }

    public async Task CancelOrderAsync(int orderId, int userId)
    {
        var order = await _orderRepository.GetOrderByIdAsync(orderId);
        if (order == null) throw new Exception("Order not found.");
        
        if (order.UserId != userId)
            throw new UnauthorizedAccessException("You are not authorized to cancel this order.");

        if (order.Status != "Pending" && order.Status != "Paid")
            throw new Exception("Only pending or paid orders that haven't been approved can be cancelled.");

        string originalStatus = order.Status;
        order.Status = "Cancelled";
        await _orderRepository.UpdateOrderAsync(order);

        // If order was already paid, refund to virtual wallet
        if (originalStatus == "Paid" && order.TotalAmount.HasValue)
        {
            try
            {
                await _walletService.AddBalanceAsync(order.UserId, order.TotalAmount.Value, "Refund", order.OrderId);
                Console.WriteLine($"[WALLET REFUND] Refunded {order.TotalAmount} to User #{order.UserId} for Order #{order.OrderId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WALLET ERROR] Failed to refund Order #{order.OrderId}: {ex.Message}");
            }
        }
    }

    public async Task MarkOrderAsReceivedAsync(int orderId, int userId)
    {
        var order = await _orderRepository.GetOrderByIdAsync(orderId);
        if (order == null) throw new Exception("Order not found.");
        
        if (order.UserId != userId)
            throw new UnauthorizedAccessException("You are not authorized for this action.");

        if (order.Status != "Approved" && order.Status != "Shipped")
            throw new Exception("Order must be Approved or Shipped to be marked as Received.");

        order.Status = "Received";
        await _orderRepository.UpdateOrderAsync(order);
        
        // Trigger platform payment to StoreOwner (Credit their virtual wallet)
        try
        {
            if (order.StoreId.HasValue && order.TotalAmount.HasValue)
            {
                if (order.Store == null)
                {
                    // Fallback or log if Store navigation property is missing
                    Console.WriteLine($"[WALLET ERROR] Store property is null for Order #{order.OrderId} even after fetch. StoreId: {order.StoreId}");
                    return;
                }
                await _walletService.AddBalanceAsync(order.Store.UserId, order.TotalAmount.Value, "Payout", order.OrderId);
                Console.WriteLine($"[WALLET SUCCESS] Credited {order.TotalAmount} to User #{order.Store.UserId} for Order #{order.OrderId}");
            }
        }
        catch (Exception ex)
        {
            // Log the error but don't fail the whole request since status is already "Received"
            Console.WriteLine($"[WALLET ERROR] Failed to credit payout for Order #{order.OrderId}: {ex.Message}");
        }
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
