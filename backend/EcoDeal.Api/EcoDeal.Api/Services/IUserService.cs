using EcoDeal.Api.DTOs;

namespace EcoDeal.Api.Services
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetUserProfileAsync(int userId);
        Task UpdateUserProfileAsync(int userId, UpdateUserProfileRequest request);
    }
}
