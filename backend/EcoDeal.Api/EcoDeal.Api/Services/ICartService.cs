using System.Threading.Tasks;
using EcoDeal.Api.DTOs;

namespace EcoDeal.Api.Services;

public interface ICartService
{
    Task<CartDto> GetCartAsync(int userId);
    Task<CartDto> AddItemToCartAsync(int userId, AddCartItemRequest request);
    Task<CartDto> UpdateItemQuantityAsync(int userId, int cartItemId, int quantity);
    Task<CartDto> RemoveItemFromCartAsync(int userId, int cartItemId);
    Task ClearCartAsync(int userId);
}
