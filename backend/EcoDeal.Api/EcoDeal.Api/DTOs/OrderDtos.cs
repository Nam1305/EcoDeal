using System;
using System.Collections.Generic;

namespace EcoDeal.Api.DTOs;

public class CheckoutRequest
{
    public string? ShippingAddress { get; set; }
    public string? ShippingPhone { get; set; }
    public string? SuccessUrl { get; set; }
    public string? CancelUrl { get; set; }
}

public class CheckoutResponse
{
    public string? SessionId { get; set; }
    public string? SessionUrl { get; set; }
}

public class OrderDto
{
    public int OrderId { get; set; }
    public int UserId { get; set; }
    public DateTime? OrderDate { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? Status { get; set; }
    public string? PaymentStatus { get; set; }
    public string? PaymentMethod { get; set; }
    public string? ShippingAddress { get; set; }
    public string? ShippingPhone { get; set; }
    public List<OrderDetailDto> OrderDetails { get; set; } = new List<OrderDetailDto>();
}

public class OrderDetailDto
{
    public int OrderDetailId { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public int? Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public string? ImageUrl { get; set; }
}
