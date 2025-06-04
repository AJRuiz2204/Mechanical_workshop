using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace Mechanical_workshop.Dtos
{
    public class UserWorkshopUpdateDto
    {
        [Required]
        public int Id { get; set; }

        public string? Email { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        public string? Username { get; set; }

        public string? Profile { get; set; }

        public string? Address { get; set; }

        public string? City { get; set; }

        public string? State { get; set; }

        public string? Zip { get; set; }

        [Required]
        [Phone]
        [StringLength(20)]
        public string PrimaryNumber { get; set; } = string.Empty;

        [StringLength(20)]
        public string? SecondaryNumber { get; set; }

        public bool NoTax { get; set; } = false;

        public List<VehicleDto> Vehicles { get; set; } = new();
    }
}
