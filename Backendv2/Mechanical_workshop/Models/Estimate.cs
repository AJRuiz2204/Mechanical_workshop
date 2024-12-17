// Models/Estimate.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mechanical_workshop.Models
{
    public class Estimate
    {
        [Key]
        public int ID { get; set; }

        // Foreign Key
        [ForeignKey("Vehicle")]
        public int VehicleID { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;

        // Propiedad de navegación
        public Vehicle Vehicle { get; set; } = null!;
    }
}
