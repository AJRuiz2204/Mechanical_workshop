using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Dtos
{
    public class EstimateCreateDto
    {
        [Required]
        public int VehicleID { get; set; }
        public TechnicianDiagnosticCreateDto? TechnicianDiagnostic { get; set; }
        [Required]
        [StringLength(500)]
        public string CustomerNote { get; set; } = string.Empty;
        [Range(0, double.MaxValue)]
        public decimal Subtotal { get; set; }
        [Range(0, double.MaxValue)]
        public decimal Tax { get; set; }
        [Range(0, double.MaxValue)]
        public decimal Total { get; set; }
        public int? Mileage { get; set; } = 0;
        [Required]
        [StringLength(1000)]
        public string? ExtendedDiagnostic { get; set; } = string.Empty;
        [Required]
        [StringLength(20)]
        public string AuthorizationStatus { get; set; } = "InReview";
        public List<EstimatePartCreateDto> Parts { get; set; } = new List<EstimatePartCreateDto>();
        public List<EstimateLaborCreateDto> Labors { get; set; } = new List<EstimateLaborCreateDto>();
        public List<EstimateFlatFeeCreateDto> FlatFees { get; set; } = new List<EstimateFlatFeeCreateDto>();
    }

    // DTO para crear TechnicianDiagnostic dentro de EstimateCreateDto
    public class TechnicianDiagnosticCreateDto
    {
        public int ID { get; set; }
        
        [Required]
        public int DiagnosticId { get; set; }

        [Required]
        public int Mileage { get; set; }

        [Required]
        [StringLength(1000)]
        public string ExtendedDiagnostic { get; set; } = string.Empty;
    }

    // DTO para Partes al Crear Estimate
    public class EstimatePartCreateDto
    {
        
        // Eliminar o hacer opcional el ID
        // public int ID { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty;

        public string? PartNumber { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue)]
        public decimal Quantity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal NetPrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ListPrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ExtendedPrice { get; set; }

        public bool Taxable { get; set; }
    }

    // DTO para Mano de Obra al Crear Estimate
    public class EstimateLaborCreateDto
    {
        // Eliminar o hacer opcional el ID
        // public int ID { get; set; }
        
        [Required]
        public string Description { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Duration { get; set; }

        [Range(0, double.MaxValue)]
        public decimal LaborRate { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ExtendedPrice { get; set; }

        public bool Taxable { get; set; }
    }

    // DTO para Tarifas Planas al Crear Estimate
    public class EstimateFlatFeeCreateDto
    {
        // Eliminar o hacer opcional el ID
        // public int ID { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal FlatFeePrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ExtendedPrice { get; set; }

        public bool Taxable { get; set; }
    }
}
