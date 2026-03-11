using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EcoDeal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoDeal.Api.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly EcoDealContext _context;

    public OrderRepository(EcoDealContext context)
    {
        _context = context;
    }

    public async Task<Order> CreateOrderAsync(Order order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order?> GetOrderByIdAsync(int orderId)
    {
        return await _context.Orders
            .Include(o => o.OrderDetails)
            .ThenInclude(od => od.Product)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);
    }

    public async Task<Order?> GetOrderBySessionIdAsync(string sessionId)
    {
        return await _context.Orders
            .Include(o => o.OrderDetails)
            .ThenInclude(od => od.Product)
            .FirstOrDefaultAsync(o => o.StripeSessionId == sessionId);
    }

    public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(int userId)
    {
        return await _context.Orders
            .Include(o => o.OrderDetails)
            .ThenInclude(od => od.Product)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    public async Task<Order> UpdateOrderAsync(Order order)
    {
        _context.Orders.Update(order);
        await _context.SaveChangesAsync();
        return order;
    }
}
