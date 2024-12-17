// Backend: Dtos/ForgotPasswordDto.cs
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Dtos
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}