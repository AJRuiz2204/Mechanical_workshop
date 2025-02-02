using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mechanical_workshop.Models
{
    public class SalesReport
    {
        [Key]
        public int SalesReportId { get; set; }

        // StartDate es opcional (puede ser null)
        public DateTime? StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        // Totales generales
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalEstimates { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPartsRevenue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalLaborRevenue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalFlatFeeRevenue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalTaxCollected { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPaymentsCollected { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalOutstanding { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Relación 1:n con los detalles del reporte
        public virtual ICollection<SalesReportDetail> Details { get; set; } = new List<SalesReportDetail>();
    }

    public class SalesReportDetail
    {
        [Key]
        public int SalesReportDetailId { get; set; }

        [Required]
        public int SalesReportId { get; set; }

        [ForeignKey("SalesReportId")]
        public virtual SalesReport SalesReport { get; set; } = null!;

        // Datos del Estimate
        [Required]
        public int EstimateId { get; set; }

        [ForeignKey("EstimateId")]
        public virtual Estimate Estimate { get; set; } = null!;

        [Required]
        public DateTime EstimateDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Tax { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        // Datos de la cuenta por cobrar vinculada al Estimate
        [Column(TypeName = "decimal(18,2)")]
        public decimal OriginalAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal RemainingBalance { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPayments { get; set; }
    }
}
