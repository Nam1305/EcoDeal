namespace EcoDeal.Api.DTOs;

public class StoreNearbyDto : StoreDto
{
    public double Distance { get; set; }
    public string EstimatedTravelTime { get; set; } = null!;
}
