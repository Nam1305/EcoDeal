using EcoDeal.Api.Models;

namespace EcoDeal.Api.Repositories
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllAsync();
    }
}
