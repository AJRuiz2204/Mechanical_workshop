// Models/WorkshopSettings.cs

using System;
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Models
{
    public class WorkshopSettings
    {
    
        [Key]
        public int Id { get; set; }
        [Required]
        [StringLength(255)]
        public string? WorkshopName { get; set; }

    
        [Required]
        [StringLength(255)]
        public string? Address { get; set; }

    
        [Required]
        [Phone]
        [StringLength(50)]
        public string? PrimaryPhone { get; set; }

    
        [StringLength(50)]
        public string? SecondaryPhone { get; set; }

    
        [StringLength(50)]
        public string? Fax { get; set; }

    
        [StringLength(255)]
        public string? WebsiteUrl { get; set; }

    
        [DataType(DataType.DateTime)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd HH:mm:ss}", ApplyFormatInEditMode = true)]
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    
        [StringLength(500)]
        public string? Disclaimer { get; set; } // More descriptive name, "Warning" could be confusing.

    
        [StringLength(255)]
        [EmailAddress]
        public string? Email { get; set; }
    }
}
