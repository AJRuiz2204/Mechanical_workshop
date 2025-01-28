using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mechanical_workshop.Models
{
    public class TechnicianDiagnostic
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Diagnostic")]
        public int DiagnosticId { get; set; }
        public Diagnostic? Diagnostic { get; set; }

        [Required]
        public int Mileage { get; set; }

        [Required]
        [StringLength(1000)]
        public string ExtendedDiagnostic { get; set; } = string.Empty;
        public List<Note> Notes { get; set; } = new List<Note>();
    }
}
