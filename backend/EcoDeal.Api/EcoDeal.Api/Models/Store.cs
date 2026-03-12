using System;
using System.Collections.Generic;

namespace EcoDeal.Api.Models;

public partial class Store
{
    public int StoreId { get; set; }

    public int UserId { get; set; }

    public string? StoreName { get; set; }

    public string? Description { get; set; }

    public string? StoreEmail { get; set; }

    public string? StorePhone { get; set; }

    public string? ImageUrl { get; set; }

    public string? Address { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public bool? IsApproved { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    public virtual User User { get; set; } = null!;
}
