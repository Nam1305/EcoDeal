using EcoDeal.Api.DTOs;

namespace EcoDeal.Api.Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllProductsAsync();
        Task<IEnumerable<ProductDto>> GetCheapestProductsAsync(int count);
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<PagedResponse<ProductDto>> GetPagedProductsAsync(int pageNumber, int pageSize);
        Task<ProductDto> CreateProductAsync(CreateProductRequest request);
        Task<IEnumerable<ProductDto>> SearchProductsByNameAsync(string name);
        Task<IEnumerable<ProductDto>> GetProductsByStoreIdAsync(int storeId);
        Task UpdateProductAsync(int id, UpdateProductRequest request);
        Task DeleteProductAsync(int id);
    }
}
