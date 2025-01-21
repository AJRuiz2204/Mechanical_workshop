using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mechanical_workshop.Models
{
    public class Vehicle
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(17, MinimumLength = 17, ErrorMessage = "El VIN debe tener 17 caracteres")]
        public string Vin { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Make { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Model { get; set; } = string.Empty;

        [Required]
        [StringLength(4)]
        public string Year { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Engine { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string Plate { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string State { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Visto";

        public int UserWorkshopId { get; set; }

        public UserWorkshop? UserWorkshop { get; set; }
        public ICollection<Diagnostic> Diagnostics { get; set; } = new List<Diagnostic>();
    }
}
