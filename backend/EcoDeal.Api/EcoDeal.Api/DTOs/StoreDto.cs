using System;

namespace EcoDeal.Api.DTOs
{
    public class StoreDto
    {
        public int StoreId { get; set; }
        public int UserId { get; set; }
        public string? StoreName { get; set; }
        public string? Address { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public bool? IsApproved { get; set; }
        public string OwnerName { get; set; } = null!;
    }

    public class CreateStoreRequest
    {
        public string StoreName { get; set; } = null!;
        public string Address { get; set; } = null!;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }

    public class UpdateStoreRequest
    {
        public string? StoreName { get; set; }
        public string? Address { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public bool? IsApproved { get; set; }
    }
}
