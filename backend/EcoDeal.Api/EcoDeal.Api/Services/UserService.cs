using EcoDeal.Api.DTOs;
using EcoDeal.Api.Repositories;

namespace EcoDeal.Api.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserProfileDto?> GetUserProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;

            return new UserProfileDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                Latitude = user.Latitude,
                Longitude = user.Longitude,
                Role = user.Role
            };
        }

        public async Task UpdateUserProfileAsync(int userId, UpdateUserProfileRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return;

            if (request.FullName != null) user.FullName = request.FullName;
            if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber;
            if (request.Address != null) user.Address = request.Address;
            if (request.Latitude.HasValue) user.Latitude = request.Latitude.Value;
            if (request.Longitude.HasValue) user.Longitude = request.Longitude.Value;

            await _userRepository.UpdateAsync(user);
        }
    }
}
