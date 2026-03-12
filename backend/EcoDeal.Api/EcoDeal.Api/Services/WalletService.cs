using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EcoDeal.Api.Services;

public class WalletService : IWalletService
{
    private readonly EcoDealContext _context;

    public WalletService(EcoDealContext context)
    {
        _context = context;
    }

    public async Task<WalletDto> GetWalletByUserIdAsync(int userId)
    {
        var wallet = await _context.Wallets
            .Include(w => w.WalletTransactions)
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wallet == null)
        {
            // Create wallet if it doesn't exist
            wallet = new Wallet
            {
                UserId = userId,
                Balance = 0,
                UpdatedAt = DateTime.Now
            };
            _context.Wallets.Add(wallet);
            await _context.SaveChangesAsync();
        }

        return MapToDto(wallet);
    }

    public async Task AddBalanceAsync(int userId, decimal amount, string transactionType = "Payout", int? orderId = null)
    {
        var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        
        if (wallet == null)
        {
            wallet = new Wallet
            {
                UserId = userId,
                Balance = 0,
                UpdatedAt = DateTime.Now
            };
            _context.Wallets.Add(wallet);
            await _context.SaveChangesAsync(); // Ensure WalletId is generated
        }

        wallet.Balance += amount;
        wallet.UpdatedAt = DateTime.Now;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.WalletId,
            Amount = amount,
            Type = transactionType,
            OrderId = orderId,
            CreatedAt = DateTime.Now
        };

        _context.WalletTransactions.Add(transaction);
        await _context.SaveChangesAsync();
    }

    public async Task RequestWithdrawalAsync(int userId, decimal amount)
    {
        var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        
        if (wallet == null || wallet.Balance < amount)
            throw new Exception("Insufficient balance.");

        wallet.Balance -= amount;
        wallet.UpdatedAt = DateTime.Now;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.WalletId,
            Amount = -amount, // Negative for withdrawal
            Type = "Withdraw",
            CreatedAt = DateTime.Now
        };

        _context.WalletTransactions.Add(transaction);
        await _context.SaveChangesAsync();
    }

    private WalletDto MapToDto(Wallet wallet)
    {
        return new WalletDto
        {
            WalletId = wallet.WalletId,
            UserId = wallet.UserId,
            Balance = wallet.Balance ?? 0,
            UpdatedAt = wallet.UpdatedAt ?? DateTime.Now,
            Transactions = wallet.WalletTransactions
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new WalletTransactionDto
                {
                    TransactionId = t.TransactionId,
                    Amount = t.Amount,
                    Type = t.Type ?? "Unknown",
                    OrderId = t.OrderId,
                    CreatedAt = t.CreatedAt ?? DateTime.Now
                }).ToList()
        };
    }
}
