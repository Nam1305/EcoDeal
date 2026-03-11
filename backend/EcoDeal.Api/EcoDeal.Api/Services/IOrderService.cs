using System.Collections.Generic;
using System.Threading.Tasks;
using EcoDeal.Api.DTOs;

namespace EcoDeal.Api.Services;

public interface IOrderService
{
    Task<CheckoutResponse> CreateCheckoutSessionAsync(int userId, CheckoutRequest request);
    Task<OrderDto> CreateOrderFromSessionAsync(string sessionId);
    Task<OrderDto?> GetOrderByIdAsync(int orderId);
    Task<IEnumerable<OrderDto>> GetOrdersByUserIdAsync(int userId);
}
