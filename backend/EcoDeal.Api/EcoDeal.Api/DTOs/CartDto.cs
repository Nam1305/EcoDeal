using System.Collections.Generic;

namespace EcoDeal.Api.DTOs;

public class CartDto
{
    public int CartId { get; set; }
    public int UserId { get; set; }
    public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
    public decimal TotalAmount { get; set; }
}

public class CartItemDto
{
    public int CartItemId { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal SubTotal => Price * Quantity;
}

public class AddCartItemRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateCartItemRequest
{
    public int Quantity { get; set; }
}
