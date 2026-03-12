using EcoDeal.Api.DTOs;

namespace EcoDeal.Api.Services;

public interface IAdminService
{
    Task<AdminStatsDto> GetAdminStatsAsync();
    Task<IEnumerable<AdminStoreDto>> GetPendingStoresAsync();
    Task<bool> ApproveStoreAsync(int storeId);
    Task<bool> RejectStoreAsync(int storeId);
    Task<IEnumerable<UserProfileDto>> GetAllUsersAsync();
}
