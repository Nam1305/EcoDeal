using System;
using System.Collections.Generic;

namespace EcoDeal.Api.Models;

public partial class User
{
    public int UserId { get; set; }

    public string? FullName { get; set; }

    public string Email { get; set; } = null!;

    public string? PasswordHash { get; set; }

    public string? Role { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Address { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Store> Stores { get; set; } = new List<Store>();

    public virtual Cart? Cart { get; set; }
}
