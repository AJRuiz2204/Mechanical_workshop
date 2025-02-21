// Dtos/VehicleDiagnosticOwnerDto.cs
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Mechanical_workshop.Models;

namespace Mechanical_workshop.Dtos
{
    // DTO que agrupa el vehículo, su owner y la información de todos los diagnósticos
    // (incluye extendedDiagnostic y el TechnicianDiagnostic completo)
    public class VehicleDiagnosticOwnerDto
    {
        [Required]
        public VehicleDto Vehicle { get; set; } = new VehicleDto();

        [Required]
        public UserWorkshopReadDto Owner { get; set; } = new UserWorkshopReadDto();

        public List<DiagnosticInfoDto> Diagnostics { get; set; } = new List<DiagnosticInfoDto>();
    }

    // DTO para representar la información del diagnóstico personalizado,
    // incluyendo el TechnicianDiagnostic completo
    public class DiagnosticInfoDto
    {
        public int DiagnosticId { get; set; }
        public string ReasonForVisit { get; set; } = string.Empty;
        public string AssignedTechnician { get; set; } = string.Empty;
        public List<TechnicianDiagnosticReadDto> TechnicianDiagnostics { get; set; } = new List<TechnicianDiagnosticReadDto>();
    }
}

