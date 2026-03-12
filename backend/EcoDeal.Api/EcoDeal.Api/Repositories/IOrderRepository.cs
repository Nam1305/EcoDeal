using System.Collections.Generic;
using System.Threading.Tasks;
using EcoDeal.Api.Models;

namespace EcoDeal.Api.Repositories;

public interface IOrderRepository
{
    Task<Order> CreateOrderAsync(Order order);
    Task<Order?> GetOrderByIdAsync(int orderId);
    Task<IEnumerable<Order>> GetOrdersBySessionIdAsync(string sessionId);
    Task<IEnumerable<Order>> GetOrdersByUserIdAsync(int userId);
    Task<IEnumerable<Order>> GetOrdersByStoreIdAsync(int storeId);
    Task<Order> UpdateOrderAsync(Order order);
}
