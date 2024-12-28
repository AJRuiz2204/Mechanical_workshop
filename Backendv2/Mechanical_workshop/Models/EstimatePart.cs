// Models/EstimatePart.cs

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mechanical_workshop.Models
{
    public class EstimatePart
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string Type { get; set; } = "[PART]";

        [Required]
        [StringLength(100)]
        public string Description { get; set; } = string.Empty;

        [StringLength(50)]
        public string PartNumber { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal NetPrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ListPrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ExtendedPrice { get; set; }

        public bool Taxable { get; set; } = false;

        // Clave Foránea a Estimate
        [Required]
        public int EstimateID { get; set; }

        // Propiedad de navegación a Estimate
        [ForeignKey("EstimateID")]
        public virtual Estimate Estimate { get; set; } = null!;
    }
}
