using EcoDeal.Api.Models;

namespace EcoDeal.Api.Repositories
{
    public interface IUserRepository
    {
        //Get user by email
        Task<User?> GetByEmailAsync(string email);
        //Create user
        Task<User> CreateAsync(User user);
        //Check if user exists
        Task<bool> ExistsAsync(string email);
        Task<User?> GetByIdAsync(int id);
        Task UpdateAsync(User user);
        Task<User?> GetByResetTokenAsync(string token);
    }
}
