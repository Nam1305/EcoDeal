using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;
using EcoDeal.Api.Repositories;

namespace EcoDeal.Api.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
        {
            var products = await _productRepository.GetAllAsync();
            return products.Select(MapToDto);
        }

        public async Task<IEnumerable<ProductDto>> GetCheapestProductsAsync(int count)
        {
            var products = await _productRepository.GetCheapestProductsAsync(count);
            return products.Select(MapToDto);
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            return product == null ? null : MapToDto(product);
        }

        public async Task<PagedResponse<ProductDto>> GetPagedProductsAsync(int pageNumber, int pageSize)
        {
            var (items, totalCount) = await _productRepository.GetPagedAsync(pageNumber, pageSize);
            return new PagedResponse<ProductDto>
            {
                Items = items.Select(MapToDto),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<PagedResponse<ProductDto>> GetPagedHotDealsAsync(int pageNumber, int pageSize)
        {
            var (items, totalCount) = await _productRepository.GetPagedHotDealsAsync(pageNumber, pageSize);
            return new PagedResponse<ProductDto>
            {
                Items = items.Select(MapToDto),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductRequest request)
        {
            var product = new Product
            {
                CategoryId = request.CategoryId,
                StoreId = request.StoreId,
                ProductName = request.ProductName,
                OriginalPrice = request.OriginalPrice,
                DiscountedPrice = request.DiscountedPrice,
                ExpireDate = request.ExpireDate,
                StockQuantity = request.StockQuantity,
                ImageUrl = request.ImageUrl,
                IsActive = true
            };

            var createdProduct = await _productRepository.AddAsync(product);
            // Re-fetch to get included entities for DTO mapping
            var result = await _productRepository.GetByIdAsync(createdProduct.ProductId);
            return MapToDto(result!);
        }

        public async Task UpdateProductAsync(int id, UpdateProductRequest request)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return;

            product.CategoryId = request.CategoryId;
            product.StoreId = request.StoreId;
            product.ProductName = request.ProductName;
            product.OriginalPrice = request.OriginalPrice;
            product.DiscountedPrice = request.DiscountedPrice;
            product.ExpireDate = request.ExpireDate;
            product.StockQuantity = request.StockQuantity;
            product.ImageUrl = request.ImageUrl;
            product.IsActive = request.IsActive;

            await _productRepository.UpdateAsync(product);
        }

        public async Task<IEnumerable<ProductDto>> SearchProductsByNameAsync(string name)
        {
            var products = await _productRepository.SearchByNameAsync(name);
            return products.Select(MapToDto);
        }

        public async Task<IEnumerable<ProductDto>> GetProductsByStoreIdAsync(int storeId)
        {
            var products = await _productRepository.GetByStoreIdAsync(storeId);
            return products.Select(MapToDto);
        }

        public async Task<IEnumerable<ProductDto>> GetProductsByCategoryIdAsync(int categoryId)
        {
            var products = await _productRepository.GetByCategoryIdAsync(categoryId);
            return products.Select(MapToDto);
        }

        public async Task DeleteProductAsync(int id)
        {
            await _productRepository.DeleteAsync(id);
        }

        private ProductDto MapToDto(Product product)
        {
            return new ProductDto
            {
                ProductId = product.ProductId,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.CategoryName ?? "Unknown",
                StoreId = product.StoreId,
                StoreName = product.Store?.StoreName ?? "Unknown",
                ProductName = product.ProductName,
                OriginalPrice = product.OriginalPrice,
                DiscountedPrice = product.DiscountedPrice,
                ExpireDate = product.ExpireDate,
                StockQuantity = product.StockQuantity,
                ImageUrl = product.ImageUrl,
                IsActive = product.IsActive
            };
        }
    }
}
