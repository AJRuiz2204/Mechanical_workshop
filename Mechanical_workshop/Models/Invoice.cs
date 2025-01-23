// Models/Invoice.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mechanical_workshop.Models
{
    public class Invoice
    {
        [Key]
        public int ID { get; set; }

        // Foreign Keys
        [ForeignKey("Vehicle")]
        public int VehicleID { get; set; }

        [ForeignKey("User")]
        public int UserID { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty;

        // Propiedades de navegación
        public Vehicle Vehicle { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
