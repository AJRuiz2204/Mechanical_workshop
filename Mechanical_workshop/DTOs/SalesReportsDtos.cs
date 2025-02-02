using System;
using System.Collections.Generic;

namespace Mechanical_workshop.Dtos
{
    public class SalesReportDto
    {
        public int SalesReportId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public decimal TotalEstimates { get; set; }
        public decimal TotalPartsRevenue { get; set; }
        public decimal TotalLaborRevenue { get; set; }
        public decimal TotalFlatFeeRevenue { get; set; }
        public decimal TotalTaxCollected { get; set; }
        public decimal TotalPaymentsCollected { get; set; }
        public decimal TotalOutstanding { get; set; }

        public DateTime CreatedDate { get; set; }

        public List<SalesReportDetailDto> Details { get; set; } = new List<SalesReportDetailDto>();
    }

    public class SalesReportDetailDto
    {
        public int SalesReportDetailId { get; set; }
        public int EstimateId { get; set; }
        public DateTime EstimateDate { get; set; }
        public decimal? Subtotal { get; set; }
        public decimal? Tax { get; set; }
        public decimal? Total { get; set; }
        public decimal? OriginalAmount { get; set; }
        public decimal? RemainingBalance { get; set; }
        public decimal? TotalPayments { get; set; }
        public EstimateFullDto? Estimate { get; set; }
    }
}
