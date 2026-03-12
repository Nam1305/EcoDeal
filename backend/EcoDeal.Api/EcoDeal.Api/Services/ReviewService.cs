using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;
using EcoDeal.Api.Repositories;

namespace EcoDeal.Api.Services;

public interface IReviewService
{
    Task<IEnumerable<ReviewDto>> GetReviewsByProductIdAsync(int productId);
    Task<ReviewDto?> AddReviewAsync(int userId, CreateReviewRequest request);
}

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;

    public ReviewService(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<IEnumerable<ReviewDto>> GetReviewsByProductIdAsync(int productId)
    {
        var reviews = await _reviewRepository.GetByProductIdAsync(productId);
        return reviews.Select(MapToDto);
    }

    public async Task<ReviewDto?> AddReviewAsync(int userId, CreateReviewRequest request)
    {
        // Logic check: Has user bought product in this order?
        bool canReview = await _reviewRepository.HasUserBoughtProductAsync(userId, request.ProductId, request.OrderId);
        
        if (!canReview)
        {
            return null; // Or throw custom exception
        }

        var review = new Review
        {
            ProductId = request.ProductId,
            UserId = userId,
            OrderId = request.OrderId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.Now
        };

        var createdReview = await _reviewRepository.AddAsync(review);
        
        // Return DTO (might need to fetch again for User Name if not loaded)
        // For simplicity, we assume we want it populated
        var reviews = await _reviewRepository.GetByProductIdAsync(review.ProductId);
        var newlyCreated = reviews.FirstOrDefault(r => r.ReviewId == createdReview.ReviewId);
        
        return newlyCreated != null ? MapToDto(newlyCreated) : MapToDto(createdReview);
    }

    private ReviewDto MapToDto(Review review)
    {
        return new ReviewDto
        {
            ReviewId = review.ReviewId,
            ProductId = review.ProductId,
            UserId = review.UserId,
            UserFullName = review.User?.FullName ?? "Unknown User",
            OrderId = review.OrderId,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt ?? DateTime.Now
        };
    }
}
