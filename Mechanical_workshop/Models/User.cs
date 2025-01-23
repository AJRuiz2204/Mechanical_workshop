// Backend: Models/User.cs
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Models
{
    public class User
    {
        [Key]
        public int ID { get; set; }

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

        [Required]
        [StringLength(255)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Profile { get; set; } = string.Empty;

        public string ResetCode { get; set; } = string.Empty;
        public DateTime? ResetCodeExpiry { get; set; }
    }
}