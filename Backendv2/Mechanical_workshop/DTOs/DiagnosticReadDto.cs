using Mechanical_workshop.Dtos;

public class DiagnosticReadDto
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public string ReasonForVisit { get; set; } = string.Empty;

        public VehicleReadDto? Vehicle { get; set; }

        public int? TechDiagnosticId { get; set; }
    }
