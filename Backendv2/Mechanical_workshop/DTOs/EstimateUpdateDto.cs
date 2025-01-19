using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Dtos
{
    public class EstimateUpdateDto
    {
        [Required]
        public int ID { get; set; }

        [Required]
        [StringLength(500)]
        public string CustomerNote { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Subtotal { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Tax { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Total { get; set; }

        [Required]
        [StringLength(20)]
        public string AuthorizationStatus { get; set; } = "InReview";

        public List<EstimatePartCreateDto> Parts { get; set; } = new List<EstimatePartCreateDto>();
        public List<EstimateLaborCreateDto> Labors { get; set; } = new List<EstimateLaborCreateDto>();
        public List<EstimateFlatFeeCreateDto> FlatFees { get; set; } = new List<EstimateFlatFeeCreateDto>();
        public TechnicianDiagnosticCreateDto? TechnicianDiagnostic { get; set; }
    }
}
