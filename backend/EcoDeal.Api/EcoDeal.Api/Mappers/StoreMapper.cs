using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;

namespace EcoDeal.Api.Mappers;

public static class StoreMapper
{
    public static StoreDto MapToDto(this Store store)
    {
        return new StoreDto
        {
            StoreId = store.StoreId,
            UserId = store.UserId,
            StoreName = store.StoreName,
            Description = store.Description,
            StoreEmail = store.StoreEmail,
            StorePhone = store.StorePhone,
            ImageUrl = store.ImageUrl,
            Address = store.Address,
            Latitude = store.Latitude,
            Longitude = store.Longitude,
            IsApproved = store.IsApproved,
            OwnerName = store.User?.FullName ?? "Unknown"
        };
    }

    public static StoreNearbyDto MapToNearbyDto(this Store store, double distance, string estimatedTravelTime)
    {
        var baseDto = store.MapToDto();
        return new StoreNearbyDto
        {
            StoreId = baseDto.StoreId,
            UserId = baseDto.UserId,
            StoreName = baseDto.StoreName,
            Description = baseDto.Description,
            StoreEmail = baseDto.StoreEmail,
            StorePhone = baseDto.StorePhone,
            ImageUrl = baseDto.ImageUrl,
            Address = baseDto.Address,
            Latitude = baseDto.Latitude,
            Longitude = baseDto.Longitude,
            IsApproved = baseDto.IsApproved,
            OwnerName = baseDto.OwnerName,
            Distance = Math.Round(distance, 2),
            EstimatedTravelTime = estimatedTravelTime
        };
    }
}
