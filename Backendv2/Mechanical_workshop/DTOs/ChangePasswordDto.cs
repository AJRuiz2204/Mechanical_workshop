// Backend: Dtos/ChangePasswordDto.cs
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Dtos
{
    public class ChangePasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string NewPassword { get; set; } = string.Empty;
    }
}