// Backend: Dtos/UserLoginDto.cs
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Dtos
{
    public class UserLoginDto
    {
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string Password { get; set; } = string.Empty;
    }
}