using EcoDeal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoDeal.Api.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly EcoDealContext _context;

        public CategoryRepository(EcoDealContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _context.Categories.ToListAsync();
        }
    }
}
