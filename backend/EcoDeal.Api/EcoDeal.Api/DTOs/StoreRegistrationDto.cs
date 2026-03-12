namespace EcoDeal.Api.DTOs;

public class StoreRegistrationDto
{
    public string StoreName { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? StoreEmail { get; set; }
    public string? StorePhone { get; set; }
    public string? StoreAddress { get; set; }
    public string? ImageUrl { get; set; }
}
