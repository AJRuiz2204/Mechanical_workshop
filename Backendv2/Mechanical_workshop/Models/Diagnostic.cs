using System;
using System.Collections.Generic;
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
        [ForeignKey("Vehicle")]
        public int VehicleId { get; set; }
        public Vehicle? Vehicle { get; set; }

        [Required]
        [StringLength(100)]
        public string AssignedTechnician { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string ReasonForVisit { get; set; } = string.Empty;

        public ICollection<TechnicianDiagnostic>? TechnicianDiagnostics { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public TechnicianDiagnostic? TechnicianDiagnostic { get; set; }
    }
}
