using System.Threading.Tasks;
using EcoDeal.Api.Models;

namespace EcoDeal.Api.Repositories;

public interface ICartRepository
{
    Task<Cart?> GetCartByUserIdAsync(int userId);
    Task<Cart> CreateCartAsync(int userId);
    Task<CartItem?> GetCartItemAsync(int cartId, int productId);
    Task<CartItem?> GetCartItemByIdAsync(int cartItemId);
    Task<CartItem> AddCartItemAsync(CartItem item);
    Task<CartItem> UpdateCartItemAsync(CartItem item);
    Task RemoveCartItemAsync(CartItem item);
    Task ClearCartAsync(int cartId);
}
