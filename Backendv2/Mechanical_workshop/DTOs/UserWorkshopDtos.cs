using System.ComponentModel.DataAnnotations;
using Mechanical_workshop.Models;

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
     
        public string Status { get; set; } = "Visto";
        // Foreign Key
        public int UserWorkshopId { get; set; }

        // Navigation Property
        public List<VehicleDto> Vehicles { get; set; } = new();

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

    // Para crear un TechnicianDiagnostic
    public class TechnicianDiagnosticCreateDto
    {
        [Required]
        public int DiagnosticId { get; set; }

        [Required]
        public int Mileage { get; set; }

        [Required]
        [StringLength(1000)]
        public string ExtendedDiagnostic { get; set; } = string.Empty;
    }

    // Para leer un TechnicianDiagnostic (con ReasonForVisit)
    public class TechnicianDiagnosticReadDto
    {
        public int Id { get; set; }

        // Info del Diagnostic
        public int DiagnosticId { get; set; }
        public string ReasonForVisit { get; set; } = string.Empty;

        public int Mileage { get; set; }
        public string ExtendedDiagnostic { get; set; } = string.Empty;

        // Opcional: Si quieres mostrar el VehicleId, etc.
        public int VehicleId { get; set; }
    }
}
