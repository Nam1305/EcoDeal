using System;

namespace EcoDeal.Api.DTOs
{
    public class ProductDto
    {
        public int ProductId { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public int StoreId { get; set; }
        public string StoreName { get; set; } = null!;
        public string? ProductName { get; set; }
        public decimal? OriginalPrice { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public DateTime? ExpireDate { get; set; }
        public int? StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public bool? IsActive { get; set; }
    }

    public class CreateProductRequest
    {
        public int CategoryId { get; set; }
        public int StoreId { get; set; }
        public string? ProductName { get; set; }
        public decimal? OriginalPrice { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public DateTime? ExpireDate { get; set; }
        public int? StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateProductRequest
    {
        public int CategoryId { get; set; }
        public int StoreId { get; set; }
        public string? ProductName { get; set; }
        public decimal? OriginalPrice { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public DateTime? ExpireDate { get; set; }
        public int? StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public bool? IsActive { get; set; }
    }

    public class PagedResponse<T>
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}
