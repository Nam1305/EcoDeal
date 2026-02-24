using System;
using System.Collections.Generic;

namespace EcoDeal.Api.Models;

public partial class Store
{
    public int StoreId { get; set; }

    public int UserId { get; set; }

    public string? StoreName { get; set; }

    public string? Address { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public bool? IsApproved { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual User User { get; set; } = null!;
}
