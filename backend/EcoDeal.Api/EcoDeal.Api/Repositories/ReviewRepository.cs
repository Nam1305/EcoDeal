using EcoDeal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoDeal.Api.Repositories;

public interface IReviewRepository
{
    Task<IEnumerable<Review>> GetByProductIdAsync(int productId);
    Task<Review> AddAsync(Review review);
    Task<bool> HasUserBoughtProductAsync(int userId, int productId, int orderId);
}

public class ReviewRepository : IReviewRepository
{
    private readonly EcoDealContext _context;

    public ReviewRepository(EcoDealContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Review>> GetByProductIdAsync(int productId)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Review> AddAsync(Review review)
    {
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task<bool> HasUserBoughtProductAsync(int userId, int productId, int orderId)
    {
        // Check if the order belongs to the user, is completed/received, AND contains the product
        var validStatuses = new[] { "Completed", "Received" };
        return await _context.Orders
            .Include(o => o.OrderDetails)
            .AnyAsync(o => o.OrderId == orderId && 
                           o.UserId == userId && 
                           validStatuses.Contains(o.Status) && 
                           o.OrderDetails.Any(od => od.ProductId == productId));
    }
}
