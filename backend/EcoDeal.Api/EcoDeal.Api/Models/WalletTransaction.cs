using System;

namespace EcoDeal.Api.Models;

public partial class WalletTransaction
{
    public int TransactionId { get; set; }

    public int WalletId { get; set; }

    public decimal Amount { get; set; }

    public string? Type { get; set; }

    public int? OrderId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Wallet Wallet { get; set; } = null!;
}
