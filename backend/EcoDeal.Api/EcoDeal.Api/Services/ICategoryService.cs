using EcoDeal.Api.DTOs;

namespace EcoDeal.Api.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
    }
}
