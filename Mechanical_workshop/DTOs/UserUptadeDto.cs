// Dtos/UserUpdateDto.cs
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Dtos
{
    public class UserUpdateDto
    {
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Password { get; set; }

        [Required]
        [StringLength(50)]
        public string Profile { get; set; } = string.Empty; // "admin" o "technician"
    }
}