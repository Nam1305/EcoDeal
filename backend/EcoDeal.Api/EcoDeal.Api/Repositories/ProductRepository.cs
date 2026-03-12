using EcoDeal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoDeal.Api.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly EcoDealContext _context;

        public ProductRepository(EcoDealContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Store)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetCheapestProductsAsync(int count)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Store)
                .Where(p => p.IsActive == true)
                .OrderBy(p => p.DiscountedPrice ?? p.OriginalPrice)
                .Take(count)
                .ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Store)
                .FirstOrDefaultAsync(p => p.ProductId == id);
        }

        public async Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Store);

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedHotDealsAsync(int pageNumber, int pageSize)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Store)
                .Where(p => p.IsActive == true && p.DiscountedPrice != null && p.DiscountedPrice < p.OriginalPrice)
                .OrderByDescending(p => p.OriginalPrice - p.DiscountedPrice);

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<Product> AddAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task UpdateAsync(Product product)
        {
            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Product>> SearchByNameAsync(string name)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Store)
                .Where(p => p.ProductName != null && p.ProductName.Contains(name) && p.IsActive == true)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetByStoreIdAsync(int storeId)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Where(p => p.StoreId == storeId && p.IsActive == true)
                .ToListAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
        }

        
    }
}
