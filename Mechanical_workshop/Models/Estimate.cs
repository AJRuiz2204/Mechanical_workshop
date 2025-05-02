// Models/Estimate.cs

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mechanical_workshop.Models
{
    public class Estimate
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int VehicleID { get; set; }

        [Required]
        public int UserWorkshopID { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [StringLength(500)]
        public string CustomerNote { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Subtotal { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Tax { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Total { get; set; }

        [Required]
        [StringLength(20)]
        public string AuthorizationStatus { get; set; } = "InReview";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Clave foránea para TechnicianDiagnostic
        public int? TechnicianDiagnosticID { get; set; }

        public int? Mileage { get; set; }

        [ForeignKey("VehicleID")]
        public virtual Vehicle Vehicle { get; set; } = null!;

        [ForeignKey("UserWorkshopID")]
        public virtual UserWorkshop UserWorkshop { get; set; } = null!;

        [ForeignKey("TechnicianDiagnosticID")]
        public virtual TechnicianDiagnostic? TechnicianDiagnostic { get; set; }

        [NotMapped]
        public string TechnicianExtendedDiagnostic => TechnicianDiagnostic?.ExtendedDiagnostic ?? string.Empty;

        public virtual List<EstimatePart> Parts { get; set; } = new();

        public virtual List<EstimateLabor> Labors { get; set; } = new();

        public virtual List<EstimateFlatFee> FlatFees { get; set; } = new();

        // Relación 1:1 con AccountReceivable
        public virtual AccountReceivable? AccountReceivable { get; set; }
    }
}
