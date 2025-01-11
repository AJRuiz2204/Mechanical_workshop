// Models/WorkshopSettings.cs

using System;
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Models
{
    
    /// Represents the settings and information of a mechanical workshop
    public class WorkshopSettings
    {
        
        /// Gets or sets the unique identifier for the workshop settings.
        [Key]
        public int Id { get; set; }

        /// Gets or sets the name of the workshop.
        [Required]
        [StringLength(255)]
        public string? WorkshopName { get; set; }

        
        /// Gets or sets the address of the workshop.
        [Required]
        [StringLength(255)]
        public string? Address { get; set; }

        
        /// Gets or sets the primary phone number of the workshop.
        [Required]
        [Phone]
        [StringLength(50)]
        public string? PrimaryPhone { get; set; }

        
        /// Gets or sets the secondary phone number of the workshop.
        [Phone]
        [StringLength(50)]
        public string? SecondaryPhone { get; set; }

        
        /// Gets or sets the fax number of the workshop.
        [StringLength(50)] // Fax is not necessarily a phone number.
        public string? Fax { get; set; }

        
        /// Gets or sets the website URL of the workshop.
        [StringLength(255)]
        public string? WebsiteUrl { get; set; } // More descriptive name.

        
        /// Gets or sets the date and time when the workshop settings were last updated.
        [DataType(DataType.DateTime)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd HH:mm:ss}", ApplyFormatInEditMode = true)]
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        
        /// Gets or sets the disclaimer or additional notes for the workshop.
        [StringLength(500)]
        public string? Disclaimer { get; set; } // More descriptive name, "Warning" could be confusing.

        
        /// Gets or sets the email address of the workshop.
        [StringLength(255)]
        [EmailAddress]
        public string? Email { get; set; }
    }
}
