// Backend: Dtos/VerifyCodeDto.cs
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Dtos
{
    public class VerifyCodeDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;
    }
}