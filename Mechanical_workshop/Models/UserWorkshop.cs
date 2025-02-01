// Models/UserWorkshop.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.Collections.Generic;

namespace Mechanical_workshop.Models
{
    public class UserWorkshop
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Profile { get; set; } = string.Empty;

        [StringLength(100)]
        public string? ResetCode { get; set; }

        public DateTime? ResetCodeExpiration { get; set; }

        [Required]
        [StringLength(200)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string State { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Zip { get; set; } = string.Empty;

        [Required]
        [Phone]
        [StringLength(20)]
        public string PrimaryNumber { get; set; } = string.Empty;

        [Phone]
        [StringLength(20)]
        public string? SecondaryNumber { get; set; }

        public bool NoTax { get; set; } = false;

        // Relación con Vehicles
        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
        
        // Nueva relación con cuentas por cobrar
        public virtual ICollection<AccountReceivable> AccountsReceivable { get; set; } = new List<AccountReceivable>();
    }
}