using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Dtos
{
    public class EstimateFullDto
    {
        // Información Básica del Estimate
        public int ID { get; set; }
        public DateTime Date { get; set; }
        public string CustomerNote { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public int Mileage { get; set; } = 0;
        
        [StringLength(1000)]
        public string? ExtendedDiagnostic { get; set; } = string.Empty;
        public string AuthorizationStatus { get; set; } = "InReview";
        public VehicleDto Vehicle { get; set; } = null!;
        public UserWorkshopReadDto Owner { get; set; } = null!;
        public TechnicianDiagnosticReadDto? TechnicianDiagnostic { get; set; }
        public List<EstimatePartReadDto> Parts { get; set; } = new List<EstimatePartReadDto>();
        public List<EstimateLaborReadDto> Labors { get; set; } = new List<EstimateLaborReadDto>();
        public List<EstimateFlatFeeReadDto> FlatFees { get; set; } = new List<EstimateFlatFeeReadDto>();
    }

    // DTO para Partes del Estimate
    public class EstimatePartReadDto
    {
        public int ID { get; set; }
        public string Type { get; set; } = "[PART]";
        public string Description { get; set; } = string.Empty;
        public string PartNumber { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal NetPrice { get; set; }
        public decimal ListPrice { get; set; }
        public decimal ExtendedPrice { get; set; }
        public bool Taxable { get; set; }
    }

    // DTO para Mano de Obra del Estimate
    public class EstimateLaborReadDto
    {
        public int ID { get; set; }
        public string Type { get; set; } = "[LABOR]";
        public string Description { get; set; } = string.Empty;
        public int Duration { get; set; }
        public decimal LaborRate { get; set; }
        public decimal ExtendedPrice { get; set; }
        public bool Taxable { get; set; }
    }

    // DTO para Tarifas Planas del Estimate
    public class EstimateFlatFeeReadDto
    {
        public int ID { get; set; }
        public string Type { get; set; } = "[FLATFEE]";
        public string Description { get; set; } = string.Empty;
        public decimal FlatFeePrice { get; set; }
        public decimal ExtendedPrice { get; set; }
        public bool Taxable { get; set; }
    }
}
