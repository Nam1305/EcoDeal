using EcoDeal.Api.DTOs;

namespace EcoDeal.Api.Services
{
    public interface IStoreService
    {
        Task<IEnumerable<StoreDto>> GetAllStoresAsync();
        Task<StoreDto?> GetStoreByIdAsync(int id);
        Task<PagedResponse<StoreDto>> GetPagedStoresAsync(int pageNumber, int pageSize);
        Task<IEnumerable<StoreDto>> SearchStoresAsync(string name);
        Task<IEnumerable<StoreDto>> GetStoresByApprovalStatusAsync(bool isApproved);
        Task<StoreDto> AddStoreAsync(CreateStoreRequest request, int userId);
        Task UpdateStoreAsync(int id, UpdateStoreRequest request);
        Task DeleteStoreAsync(int id);
        Task<StoreDto?> GetStoreByUserIdAsync(int userId);
        Task<StoreDto> RegisterStoreAsync(StoreRegistrationDto dto, int userId);
        Task<IEnumerable<StoreNearbyDto>> GetNearbyStoresAsync(double lat, double lon, double radiusKm);
    }
}
