using Mechanical_workshop.Dtos;

public class DiagnosticReadDto
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public string ReasonForVisit { get; set; } = string.Empty;
    public VehicleReadDto? Vehicle { get; set; }
    public int? TechDiagnosticId { get; set; }
    public UserWorkshopReadDto? UserWorkshop { get; set; }
    public string AssignedTechnician { get; set; } = string.Empty;
    public string? AccountReceivableStatus { get; set; }
}
