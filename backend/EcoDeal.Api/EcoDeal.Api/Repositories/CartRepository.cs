using System.Linq;
using System.Threading.Tasks;
using EcoDeal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoDeal.Api.Repositories;

public class CartRepository : ICartRepository
{
    private readonly EcoDealContext _context;

    public CartRepository(EcoDealContext context)
    {
        _context = context;
    }

    public async Task<Cart?> GetCartByUserIdAsync(int userId)
    {
        return await _context.Carts
            .Include(c => c.CartItems)
            .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task<Cart> CreateCartAsync(int userId)
    {
        var cart = new Cart { UserId = userId };
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();
        return cart;
    }

    public async Task<CartItem?> GetCartItemAsync(int cartId, int productId)
    {
        return await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.CartId == cartId && ci.ProductId == productId);
    }

    public async Task<CartItem?> GetCartItemByIdAsync(int cartItemId)
    {
        return await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.CartItemId == cartItemId);
    }

    public async Task<CartItem> AddCartItemAsync(CartItem item)
    {
        _context.CartItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<CartItem> UpdateCartItemAsync(CartItem item)
    {
        _context.CartItems.Update(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task RemoveCartItemAsync(CartItem item)
    {
        _context.CartItems.Remove(item);
        await _context.SaveChangesAsync();
    }

    public async Task ClearCartAsync(int cartId)
    {
        var items = await _context.CartItems.Where(ci => ci.CartId == cartId).ToListAsync();
        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync();
    }
}
