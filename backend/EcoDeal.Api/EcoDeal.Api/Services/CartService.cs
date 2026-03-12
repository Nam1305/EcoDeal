using System;
using System.Linq;
using System.Threading.Tasks;
using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;
using EcoDeal.Api.Repositories;

namespace EcoDeal.Api.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;

    public CartService(ICartRepository cartRepository, IProductRepository productRepository)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
    }

    public async Task<CartDto> GetCartAsync(int userId)
    {
        var cart = await _cartRepository.GetCartByUserIdAsync(userId) ?? await _cartRepository.CreateCartAsync(userId);
        return MapToDto(cart);
    }

    public async Task<CartDto> AddItemToCartAsync(int userId, AddCartItemRequest request)
    {
        var cart = await _cartRepository.GetCartByUserIdAsync(userId) ?? await _cartRepository.CreateCartAsync(userId);
        var product = await _productRepository.GetByIdAsync(request.ProductId);
        
        if (product == null || !product.IsActive.GetValueOrDefault(false))
            throw new Exception("Product not found or inactive.");

        if (product.Store != null && product.Store.UserId == userId)
            throw new Exception("You cannot buy your own products.");

        if (product.StockQuantity < request.Quantity)
            throw new Exception("Not enough stock.");

        var existingItem = await _cartRepository.GetCartItemAsync(cart.CartId, request.ProductId);

        if (existingItem != null)
        {
            existingItem.Quantity += request.Quantity;
            if (product.StockQuantity < existingItem.Quantity)
                throw new Exception("Not enough stock for totally requested quantity.");
            await _cartRepository.UpdateCartItemAsync(existingItem);
        }
        else
        {
            var newItem = new CartItem
            {
                CartId = cart.CartId,
                ProductId = request.ProductId,
                Quantity = request.Quantity
            };
            await _cartRepository.AddCartItemAsync(newItem);
        }

        return MapToDto(await _cartRepository.GetCartByUserIdAsync(userId));
    }

    public async Task<CartDto> UpdateItemQuantityAsync(int userId, int cartItemId, int quantity)
    {
        var cart = await _cartRepository.GetCartByUserIdAsync(userId);
        if (cart == null) throw new Exception("Cart not found.");

        var item = await _cartRepository.GetCartItemByIdAsync(cartItemId);
        if (item == null || item.CartId != cart.CartId) throw new Exception("Cart item not found.");

        if (quantity <= 0)
        {
            await _cartRepository.RemoveCartItemAsync(item);
        }
        else
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product == null) throw new Exception("Product not found.");
            if (product.StockQuantity < quantity) throw new Exception("Not enough stock.");
            
            item.Quantity = quantity;
            await _cartRepository.UpdateCartItemAsync(item);
        }

        return MapToDto(await _cartRepository.GetCartByUserIdAsync(userId));
    }

    public async Task<CartDto> RemoveItemFromCartAsync(int userId, int cartItemId)
    {
        var cart = await _cartRepository.GetCartByUserIdAsync(userId);
        if (cart == null) throw new Exception("Cart not found.");

        var item = await _cartRepository.GetCartItemByIdAsync(cartItemId);
        if (item != null && item.CartId == cart.CartId)
        {
            await _cartRepository.RemoveCartItemAsync(item);
        }

        return MapToDto(await _cartRepository.GetCartByUserIdAsync(userId));
    }

    public async Task ClearCartAsync(int userId)
    {
        var cart = await _cartRepository.GetCartByUserIdAsync(userId);
        if (cart != null)
        {
            await _cartRepository.ClearCartAsync(cart.CartId);
        }
    }

    private CartDto MapToDto(Cart? cart)
    {
        if (cart == null) return new CartDto();

        var dto = new CartDto
        {
            CartId = cart.CartId,
            UserId = cart.UserId,
            Items = cart.CartItems.Select(ci => new CartItemDto
            {
                CartItemId = ci.CartItemId,
                ProductId = ci.ProductId,
                ProductName = ci.Product.ProductName,
                Price = ci.Product.DiscountedPrice ?? ci.Product.OriginalPrice ?? 0,
                ImageUrl = ci.Product.ImageUrl,
                Quantity = ci.Quantity ?? 1
            }).ToList()
        };

        dto.TotalAmount = dto.Items.Sum(i => i.SubTotal);
        return dto;
    }
}
