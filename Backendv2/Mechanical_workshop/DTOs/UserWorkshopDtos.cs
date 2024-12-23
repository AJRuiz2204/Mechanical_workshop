using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Dtos
{
    public class VehicleDto
    {
        [Required]
        public string Vin { get; set; } = string.Empty;
        [Required]
        public string Make { get; set; } = string.Empty;
        [Required]
        public string Model { get; set; } = string.Empty;
        [Required]
        public string Year { get; set; } = string.Empty;
        [Required]
        public string Engine { get; set; } = string.Empty;
        [Required]
        public string Plate { get; set; } = string.Empty;
        [Required]
        public string State { get; set; } = string.Empty;
    }

    public class UserWorkshopCreateDto
    {
        [Required]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string LastName { get; set; } = string.Empty;
        [Required]
        public string Profile { get; set; } = string.Empty;
        [Required]
        public string Address { get; set; } = string.Empty;
        [Required]
        public string City { get; set; } = string.Empty;
        [Required]
        public string State { get; set; } = string.Empty;
        [Required]
        public string Zip { get; set; } = string.Empty;
        [Required]
        public string PrimaryNumber { get; set; } = string.Empty;
        public string? SecondaryNumber { get; set; }
        [Required]
        public bool NoTax { get; set; }
        [Required]
        public List<VehicleDto> Vehicles { get; set; } = new();
    }

    public class UserWorkshopReadDto
    {
        [Required]
        public int Id { get; set; }
        [Required]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string Username { get; set; } = string.Empty;
        [Required]
        public List<VehicleDto> Vehicles { get; set; } = new();
    }
}
