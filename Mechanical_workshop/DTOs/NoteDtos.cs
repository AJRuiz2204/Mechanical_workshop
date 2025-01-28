
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Dtos
{
    public class NoteDto
    {
        public class NoteCreateDto
        {
            [Required]
            [StringLength(2000)]
            public string Content { get; set; } = string.Empty;

            [Required]
            public int TechnicianDiagnosticId { get; set; }
        }

        public class NoteReadDto
        {
            public int Id { get; set; }
            public string Content { get; set; } = string.Empty;
            public DateTime CreatedAt { get; set; }
            public DateTime? UpdatedAt { get; set; }
            public int TechnicianDiagnosticId { get; set; }
        }

        public class NoteUpdateDto
        {
            [Required]
            [StringLength(2000)]
            public string Content { get; set; } = string.Empty;
        }
    }
}