using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace Mechanical_workshop.Dtos
{
    public class UserWorkshopUpdateDto
    {
        [Required]
        public int Id { get; set; }

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

        
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Profile { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string State { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Zip { get; set; } = string.Empty;

        [Required]
        [Phone]
        [StringLength(20)]
        public string PrimaryNumber { get; set; } = string.Empty;

        [Phone]
        [StringLength(20)]
        public string? SecondaryNumber { get; set; }

        public bool NoTax { get; set; } = false;

        public List<VehicleDto> Vehicles { get; set; } = new();
    }
}
