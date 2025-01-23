// Models/Report.cs
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Models
{
    public class Report
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(100)]
        public string Author { get; set; } = string.Empty;
    }
}
