using System;
using System.Collections.Generic;

namespace EcoDeal.Api.DTOs;

public class WalletDto
{
    public int WalletId { get; set; }
    public int UserId { get; set; }
    public decimal Balance { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<WalletTransactionDto> Transactions { get; set; } = new();
}

public class WalletTransactionDto
{
    public int TransactionId { get; set; }
    public decimal Amount { get; set; }
    public string Type { get; set; } = null!;
    public int? OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}
