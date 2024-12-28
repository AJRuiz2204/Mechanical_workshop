// Dtos/EstimateCreateDto.cs

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Dtos
{
    public class EstimateCreateDto
    {
        [Required]
        public int VehicleID { get; set; }

        [Required]
        public string CustomerNote { get; set; } = string.Empty;

        [Required]
        public string ExtendedDiagnostic { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Subtotal { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Tax { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Total { get; set; }

        // Lista de Partes
        public List<EstimatePartCreateDto> Parts { get; set; } = new List<EstimatePartCreateDto>();

        // Lista de Mano de Obra
        public List<EstimateLaborCreateDto> Labors { get; set; } = new List<EstimateLaborCreateDto>();

        // Lista de Tarifas Planas
        public List<EstimateFlatFeeCreateDto> FlatFees { get; set; } = new List<EstimateFlatFeeCreateDto>();
    }

    // DTO para Partes al Crear Estimate
    public class EstimatePartCreateDto
    {
        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string PartNumber { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal NetPrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ListPrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ExtendedPrice { get; set; }

        public bool Taxable { get; set; }
    }

    // DTO para Mano de Obra al Crear Estimate
    public class EstimateLaborCreateDto
    {
        [Required]
        public string Description { get; set; } = string.Empty;

        [Range(0, int.MaxValue)]
        public int Duration { get; set; } // Duración en horas

        [Range(0, double.MaxValue)]
        public decimal LaborRate { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ExtendedPrice { get; set; }

        public bool Taxable { get; set; }
    }

    // DTO para Tarifas Planas al Crear Estimate
    public class EstimateFlatFeeCreateDto
    {
        [Required]
        public string Description { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal FlatFeePrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ExtendedPrice { get; set; }

        public bool Taxable { get; set; }
    }
}
