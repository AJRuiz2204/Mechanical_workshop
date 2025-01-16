using System;
using System.Collections.Generic;

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

        // Estado de Autorización (InReview, Authorized, Denied, etc.)
        public string AuthorizationStatus { get; set; } = "InReview";

        // Información del Vehículo
        public VehicleDto Vehicle { get; set; } = null!;

        // Información del Propietario
        public UserWorkshopReadDto Owner { get; set; } = null!;

        // Relación con TechnicianDiagnostic
        public TechnicianDiagnosticReadDto? TechnicianDiagnostic { get; set; }

        // Lista de Partes
        public List<EstimatePartReadDto> Parts { get; set; } = new List<EstimatePartReadDto>();

        // Lista de Mano de Obra
        public List<EstimateLaborReadDto> Labors { get; set; } = new List<EstimateLaborReadDto>();

        // Lista de Tarifas Planas
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
