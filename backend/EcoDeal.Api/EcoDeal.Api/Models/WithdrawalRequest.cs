using System;

namespace EcoDeal.Api.Models;

public partial class WithdrawalRequest
{
    public int RequestId { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public string BankName { get; set; } = null!;
    public string AccountNumber { get; set; } = null!;
    public string AccountHolder { get; set; } = null!;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string? AdminNote { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
