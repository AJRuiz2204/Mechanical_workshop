// DTOs/WorkshopSettingsDtos.cs

using System;
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.DTOs
{
    public class WorkshopSettingsReadDto
    {

        public int Id { get; set; }


        public string? WorkshopName { get; set; }


        public string? Address { get; set; }


        public string? PrimaryPhone { get; set; }


        public string? SecondaryPhone { get; set; }


        public string? Fax { get; set; }


        public string? WebsiteUrl { get; set; }


        public string? Disclaimer { get; set; }


        public string? Email { get; set; }


        public DateTime LastUpdated { get; set; }
    }

    public class WorkshopSettingsCreateDto
    {

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


        [Phone]
        [StringLength(50)]
        public string? SecondaryPhone { get; set; }


        [StringLength(50)]
        public string? Fax { get; set; }


        [StringLength(255)]
        public string? WebsiteUrl { get; set; }


        [StringLength(500)]
        public string? Disclaimer { get; set; }


        [StringLength(255)]
        [EmailAddress]
        public string? Email { get; set; }
    }

    public class WorkshopSettingsUpdateDto
    {

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


        [Phone]
        [StringLength(50)]
        public string? SecondaryPhone { get; set; }


        [StringLength(50)]
        public string? Fax { get; set; }


        [StringLength(255)]
        public string? WebsiteUrl { get; set; }


        [StringLength(500)]
        public string? Disclaimer { get; set; }


        [StringLength(255)]
        [EmailAddress]
        public string? Email { get; set; }
    }
}
