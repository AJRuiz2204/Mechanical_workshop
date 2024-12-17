// Models/Diagnostic.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mechanical_workshop.Models
{
    public class Diagnostic
    {
        [Key]
        public int ID { get; set; }

        // Foreign Keys
        [ForeignKey("Vehicle")]
        public int VehicleID { get; set; }

        [ForeignKey("AssignedTechnician")]
        public int AssignedTechnicianID { get; set; }

        [Required]
        [StringLength(500)]
        public string Reason { get; set; } = string.Empty;

        public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;

        // Propiedades de navegación
        public Vehicle Vehicle { get; set; } = null!;
        public User AssignedTechnician { get; set; } = null!;
    }
}
