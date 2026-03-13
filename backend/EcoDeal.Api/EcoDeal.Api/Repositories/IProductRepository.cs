using EcoDeal.Api.Models;

namespace EcoDeal.Api.Repositories
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllAsync();
        Task<IEnumerable<Product>> GetCheapestProductsAsync(int count);
        Task<Product?> GetByIdAsync(int id);
        Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedHotDealsAsync(int pageNumber, int pageSize);
        Task<Product> AddAsync(Product product);
        Task<IEnumerable<Product>> SearchByNameAsync(string name);
        Task<IEnumerable<Product>> GetByStoreIdAsync(int storeId);
        Task<IEnumerable<Product>> GetByCategoryIdAsync(int categoryId);
        Task UpdateAsync(Product product);
        Task DeleteAsync(int id);
    }
}
