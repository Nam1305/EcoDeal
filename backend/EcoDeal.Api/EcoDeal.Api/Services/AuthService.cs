using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;
using EcoDeal.Api.Repositories;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace EcoDeal.Api.Services
{
    public class AuthService : IAuthService
    {
        //Inject IUserRepository and IConfiguration
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        //Constructor
        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        //Register user
        public async Task<(bool, string)> RegisterAsync(RegisterRequest request)
        {
            // 1. Check if user exists
            var existingUser = await _userRepository.ExistsAsync(request.Email);
            if (existingUser)
            {
                return (false, "Email already in use.");
            }

            // 2. Hash password
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 3. Create user entity
            var user = new User
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                FullName = request.FullName,
                Role = request.Role,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address
            };

            // 4. Save to DB
            await _userRepository.CreateAsync(user);

            return (true, "User registered successfully.");
        }

        //Login user
        public async Task<AuthResponse?> LoginAsync(LoginRequest request)
        {
            //lấy user theo email 
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                //không có user hoặc password sai thì return null
                return null;
            }

            // Generate JWT Token
            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Token = token,
                UserId = user.UserId,
                FullName = user.FullName ?? "User",
                Role = user.Role ?? "User"
            };
        }

        //Forgot password
        public async Task<(bool success, string message)> ForgotPasswordAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                // For security reasons, don't reveal if the email exists
                return (true, "If an account exists with this email, a reset link has been sent.");
            }

            // Generate token
            string token = Guid.NewGuid().ToString();
            user.ResetToken = token;
            user.ResetTokenExpires = DateTime.UtcNow.AddHours(1);

            await _userRepository.UpdateAsync(user);

            // Print reset link to console (Demo mode)
            var resetLink = $"http://localhost:5173/reset-password/{token}";
            Console.WriteLine("====================================================");
            Console.WriteLine($"RESET PASSWORD LINK FOR {email}:");
            Console.WriteLine(resetLink);
            Console.WriteLine("====================================================");

            return (true, "If an account exists with this email, a reset link has been sent.");
        }

        //Reset password
        public async Task<(bool success, string message)> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _userRepository.GetByResetTokenAsync(request.Token);
            if (user == null || user.ResetTokenExpires < DateTime.UtcNow)
            {
                return (false, "Invalid or expired reset token.");
            }

            // Hash new password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            
            // Clear token
            user.ResetToken = null;
            user.ResetTokenExpires = null;

            await _userRepository.UpdateAsync(user);

            return (true, "Password has been reset successfully.");
        }

        //Generate JWT Token
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName ?? ""),
                new Claim(ClaimTypes.Role, user.Role ?? "User")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
