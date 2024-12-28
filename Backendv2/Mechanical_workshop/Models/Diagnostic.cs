using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mechanical_workshop.Models
{
    public class Diagnostic
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // Relación con Vehicle
        [Required]
        public int VehicleId { get; set; }
        public Vehicle? Vehicle { get; set; }

        // Opcional si deseas guardar también el UserWorkshopId (a nivel de Diagnóstico)
        // [Required]
        // public int UserWorkshopId { get; set; }
        // public UserWorkshop? UserWorkshop { get; set; }

        [Required]
        [StringLength(100)]
        public string AssignedTechnician { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string ReasonForVisit { get; set; } = string.Empty;

        public ICollection<TechnicianDiagnostic>? TechnicianDiagnostics { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
