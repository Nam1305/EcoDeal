namespace EcoDeal.Api.DTOs;

public class AdminStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalStores { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int PendingStoreApprovals { get; set; }
}

public class AdminStoreDto
{
    public int StoreId { get; set; }
    public string? StoreName { get; set; }
    public string? OwnerName { get; set; }
    public string? StoreEmail { get; set; }
    public string? StorePhone { get; set; }
    public bool? IsApproved { get; set; }
}

public class MonthlyGrowthDto
{
    public string Month { get; set; } = string.Empty;
    public int Orders { get; set; }
    public decimal Revenue { get; set; }
}
