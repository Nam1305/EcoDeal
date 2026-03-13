using EcoDeal.Api.Models;

namespace EcoDeal.Api.Repositories
{
    public interface IStoreRepository
    {
        Task<IEnumerable<Store>> GetAllAsync();
        Task<Store?> GetByIdAsync(int id);
        Task<(IEnumerable<Store> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<IEnumerable<Store>> SearchByNameAsync(string name);
        Task<IEnumerable<Store>> GetByApprovalStatusAsync(bool isApproved);
        Task<IEnumerable<Store>> SearchNearbyAsync(double minLat, double maxLat, double minLon, double maxLon);
        Task<Store> AddAsync(Store store);
        Task UpdateAsync(Store store);
        Task DeleteAsync(int id);
    }
}
