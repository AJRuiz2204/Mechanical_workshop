// Models/AccountReceivable.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mechanical_workshop.Models
{
    public class AccountReceivable
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EstimateId { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal OriginalAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Balance { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedDate { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending";

        // Relaciones
        [ForeignKey("EstimateId")]
        public virtual Estimate Estimate { get; set; } = null!;

        [ForeignKey("CustomerId")]
        public virtual UserWorkshop Customer { get; set; } = null!;

        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }

    public class Payment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AccountReceivableId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(20)]
        public required string Method { get; set; }

        [StringLength(500)]
        public string TransactionReference { get; set; } = string.Empty;

        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;

        [ForeignKey("AccountReceivableId")]
        public virtual AccountReceivable AccountReceivable { get; set; } = null!;

        [NotMapped]
        public Estimate? Estimate => AccountReceivable?.Estimate;
    }
}