using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Dtos
{
    public class DiagnosticCreateDto
    {
        [Required]
        public int VehicleId { get; set; }

        [Required]
        [StringLength(100)]
        public string AssignedTechnician { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string ReasonForVisit { get; set; } = string.Empty;
    }
}
