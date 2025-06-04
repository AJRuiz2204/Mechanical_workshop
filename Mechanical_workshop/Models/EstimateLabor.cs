// Models/EstimateLabor.cs

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mechanical_workshop.Models
{
    public class EstimateLabor
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string Type { get; set; } = "[LABOR]";

        [Required]
        [StringLength(100)]
        public string Description { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Duration { get; set; }

        [Range(0, double.MaxValue)]
        public decimal LaborRate { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ExtendedPrice { get; set; }

        public bool Taxable { get; set; } = false;

        // Clave Foránea a Estimate
        [Required]
        public int EstimateID { get; set; }

        // Propiedad de navegación a Estimate
        [ForeignKey("EstimateID")]
        public virtual Estimate Estimate { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
