// DTOs/WorkshopSettingsDtos.cs

using System;
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.DTOs
{
    /// <summary>
    /// Data Transfer Object for reading workshop settings.
    /// </summary>
    public class WorkshopSettingsReadDto
    {
        /// <summary>
        /// Gets or sets the unique identifier for the workshop settings.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the name of the workshop.
        /// </summary>
        public string? WorkshopName { get; set; }

        /// <summary>
        /// Gets or sets the address of the workshop.
        /// </summary>
        public string? Address { get; set; }

        /// <summary>
        /// Gets or sets the primary phone number of the workshop.
        /// </summary>
        public string? PrimaryPhone { get; set; }

        /// <summary>
        /// Gets or sets the secondary phone number of the workshop.
        /// </summary>
        public string? SecondaryPhone { get; set; }

        /// <summary>
        /// Gets or sets the fax number of the workshop.
        /// </summary>
        public string? Fax { get; set; }

        /// <summary>
        /// Gets or sets the website URL of the workshop.
        /// </summary>
        public string? WebsiteUrl { get; set; }

        /// <summary>
        /// Gets or sets the disclaimer or additional notes for the workshop.
        /// </summary>
        public string? Disclaimer { get; set; }

        /// <summary>
        /// Gets or sets the email address of the workshop.
        /// </summary>
        public string? Email { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the workshop settings were last updated.
        /// </summary>
        public DateTime LastUpdated { get; set; }
    }

    /// <summary>
    /// Data Transfer Object for creating new workshop settings.
    /// </summary>
    public class WorkshopSettingsCreateDto
    {
        /// <summary>
        /// Gets or sets the name of the workshop.
        /// </summary>
        [Required]
        [StringLength(255)]
        public string? WorkshopName { get; set; }

        /// <summary>
        /// Gets or sets the address of the workshop.
        /// </summary>
        [Required]
        [StringLength(255)]
        public string? Address { get; set; }

        /// <summary>
        /// Gets or sets the primary phone number of the workshop.
        /// </summary>
        [Required]
        [Phone]
        [StringLength(50)]
        public string? PrimaryPhone { get; set; }

        /// <summary>
        /// Gets or sets the secondary phone number of the workshop.
        /// </summary>
        [Phone]
        [StringLength(50)]
        public string? SecondaryPhone { get; set; }

        /// <summary>
        /// Gets or sets the fax number of the workshop.
        /// </summary>
        [StringLength(50)] // Fax is not necessarily a phone number.
        public string? Fax { get; set; }

        /// <summary>
        /// Gets or sets the website URL of the workshop.
        /// </summary>
        [StringLength(255)]
        public string? WebsiteUrl { get; set; } // More descriptive name.

        /// <summary>
        /// Gets or sets the disclaimer or additional notes for the workshop.
        /// </summary>
        [StringLength(500)]
        public string? Disclaimer { get; set; } // More descriptive name, "Warning" could be confusing.

        /// <summary>
        /// Gets or sets the email address of the workshop.
        /// </summary>
        [StringLength(255)] // Added field for the email address.
        [EmailAddress]
        public string? Email { get; set; }
    }

    /// <summary>
    /// Data Transfer Object for updating existing workshop settings.
    /// </summary>
    public class WorkshopSettingsUpdateDto
    {
        /// <summary>
        /// Gets or sets the name of the workshop.
        /// </summary>
        [Required]
        [StringLength(255)]
        public string? WorkshopName { get; set; }

        /// <summary>
        /// Gets or sets the address of the workshop.
        /// </summary>
        [Required]
        [StringLength(255)]
        public string? Address { get; set; }

        /// <summary>
        /// Gets or sets the primary phone number of the workshop.
        /// </summary>
        [Required]
        [Phone]
        [StringLength(50)]
        public string? PrimaryPhone { get; set; }

        /// <summary>
        /// Gets or sets the secondary phone number of the workshop.
        /// </summary>
        [Phone]
        [StringLength(50)]
        public string? SecondaryPhone { get; set; }

        /// <summary>
        /// Gets or sets the fax number of the workshop.
        /// </summary>
        [StringLength(50)] // Fax is not necessarily a phone number.
        public string? Fax { get; set; }

        /// <summary>
        /// Gets or sets the website URL of the workshop.
        /// </summary>
        [StringLength(255)]
        public string? WebsiteUrl { get; set; } // More descriptive name.

        /// <summary>
        /// Gets or sets the disclaimer or additional notes for the workshop.
        /// </summary>
        [StringLength(500)]
        public string? Disclaimer { get; set; } // More descriptive name, "Warning" could be confusing.

        /// <summary>
        /// Gets or sets the email address of the workshop.
        /// </summary>
        [StringLength(255)] // Added field for the email address.
        [EmailAddress]
        public string? Email { get; set; }
    }
}
