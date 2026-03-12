using System;

namespace EcoDeal.Api.DTOs;

public class ReviewDto
{
    public int ReviewId { get; set; }
    public int ProductId { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public byte Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewRequest
{
    public int ProductId { get; set; }
    public int OrderId { get; set; }
    public byte Rating { get; set; }
    public string? Comment { get; set; }
}
