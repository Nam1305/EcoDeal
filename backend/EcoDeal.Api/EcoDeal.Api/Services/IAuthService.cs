using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;

namespace EcoDeal.Api.Services
{
    public interface IAuthService
    {
        //Register user
        Task<(bool, string)> RegisterAsync(RegisterRequest request);
        //Login user
        Task<AuthResponse?> LoginAsync(LoginRequest request);
        //Forgot password
        Task<(bool success, string message)> ForgotPasswordAsync(string email);
        //Reset password
        Task<(bool success, string message)> ResetPasswordAsync(ResetPasswordRequest request);
    }
}
