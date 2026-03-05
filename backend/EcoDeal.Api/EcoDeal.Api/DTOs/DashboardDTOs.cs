namespace EcoDeal.Api.DTOs;

public class DashboardOverviewDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public int ActiveProducts { get; set; }
}

public class RecentOrderDto
{
    public int OrderId { get; set; }
    public DateTime? OrderDate { get; set; }
    public string? CustomerName { get; set; }
    public decimal StoreTotalAmount { get; set; }
    public string? Status { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? ImageUrl { get; set; }
    public int QuantitySold { get; set; }
    public decimal Revenue { get; set; }
}
