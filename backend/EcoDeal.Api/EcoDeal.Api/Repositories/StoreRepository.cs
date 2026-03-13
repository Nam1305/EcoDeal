using EcoDeal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoDeal.Api.Repositories
{
    public class StoreRepository : IStoreRepository
    {
        private readonly EcoDealContext _context;

        public StoreRepository(EcoDealContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Store>> GetAllAsync()
        {
            return await _context.Stores
                .Include(s => s.User)
                .ToListAsync();
        }

        public async Task<Store?> GetByIdAsync(int id)
        {
            return await _context.Stores
                .Include(s => s.User)
                .Include(s => s.Products)
                .FirstOrDefaultAsync(s => s.StoreId == id);
        }

        public async Task<(IEnumerable<Store> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.Stores
                .Include(s => s.User);

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<IEnumerable<Store>> SearchByNameAsync(string name)
        {
            return await _context.Stores
                .Include(s => s.User)
                .Where(s => s.StoreName != null && s.StoreName.Contains(name))
                .ToListAsync();
        }

        public async Task<IEnumerable<Store>> GetByApprovalStatusAsync(bool isApproved)
        {
            return await _context.Stores
                .Include(s => s.User)
                .Where(s => s.IsApproved == isApproved)
                .ToListAsync();
        }

        public async Task<IEnumerable<Store>> SearchNearbyAsync(double minLat, double maxLat, double minLon, double maxLon)
        {
            // Database-level filtering using bounding box
            return await _context.Stores
                .Include(s => s.User)
                .Where(s => s.IsApproved == true 
                       && s.Latitude >= (decimal)minLat && s.Latitude <= (decimal)maxLat
                       && s.Longitude >= (decimal)minLon && s.Longitude <= (decimal)maxLon)
                .ToListAsync();
        }

        public async Task<Store> AddAsync(Store store)
        {
            _context.Stores.Add(store);
            await _context.SaveChangesAsync();
            return store;
        }

        public async Task UpdateAsync(Store store)
        {
            _context.Entry(store).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var store = await _context.Stores.FindAsync(id);
            if (store != null)
            {
                _context.Stores.Remove(store);
                await _context.SaveChangesAsync();
            }
        }
    }
}
