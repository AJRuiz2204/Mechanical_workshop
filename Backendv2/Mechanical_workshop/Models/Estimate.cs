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

        // Clave Foránea a Vehicle
        [Required]
        public int VehicleID { get; set; }

        // Clave Foránea a UserWorkshop (Propietario)
        [Required]
        public int UserWorkshopID { get; set; }

        // Fecha del Estimate
        public DateTime Date { get; set; } = DateTime.UtcNow;

        // Nota del cliente
        [StringLength(500)]
        public string CustomerNote { get; set; } = string.Empty;

        // Información Extendida del Diagnóstico
        [StringLength(2000)]
        public string ExtendedDiagnostic { get; set; } = string.Empty;

        // Subtotal del Estimate
        [Range(0, double.MaxValue)]
        public decimal Subtotal { get; set; }

        // Impuestos aplicables
        [Range(0, double.MaxValue)]
        public decimal Tax { get; set; }

        // Total del Estimate
        [Range(0, double.MaxValue)]
        public decimal Total { get; set; }

        [Required]
        [StringLength(20)]
        public string AuthorizationStatus { get; set; } = "InReview";

        // Propiedad de navegación a Vehicle
        [ForeignKey("VehicleID")]
        public virtual Vehicle Vehicle { get; set; } = null!;

        // Propiedad de navegación a UserWorkshop
        [ForeignKey("UserWorkshopID")]
        public virtual UserWorkshop UserWorkshop { get; set; } = null!;

        // Colección de Partes en el Estimate
        public virtual ICollection<EstimatePart> Parts { get; set; } = new List<EstimatePart>();

        // Colección de Mano de Obra en el Estimate
        public virtual ICollection<EstimateLabor> Labors { get; set; } = new List<EstimateLabor>();

        // Colección de Tarifas Planas en el Estimate
        public virtual ICollection<EstimateFlatFee> FlatFees { get; set; } = new List<EstimateFlatFee>();
    }
}
