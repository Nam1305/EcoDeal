using System;

namespace EcoDeal.Api.DTOs;

public class WithdrawalRequestDto
{
    public decimal Amount { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountHolder { get; set; } = string.Empty;
}

public class WithdrawalResponseDto
{
    public int RequestId { get; set; }
    public decimal Amount { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountHolder { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? UserFullName { get; set; }
    public string? UserEmail { get; set; }
}

public class AdminWithdrawalActionDto
{
    public string? Note { get; set; }
}
