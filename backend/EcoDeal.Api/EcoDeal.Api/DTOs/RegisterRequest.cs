using System.ComponentModel.DataAnnotations;

namespace EcoDeal.Api.DTOs
{
    public class RegisterRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        public string Role { get; set; } = "User"; // Optional, default to User
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
    }
}
