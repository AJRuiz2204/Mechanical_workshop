using Mechanical_workshop.Dtos;

public class DiagnosticReadDto
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public string ReasonForVisit { get; set; } = string.Empty;

    public VehicleReadDto? Vehicle { get; set; }

    public int? TechDiagnosticId { get; set; }
    
    // Nueva propiedad para incluir la información del owner
    public UserWorkshopReadDto? UserWorkshop { get; set; }

    // Nueva propiedad para incluir AssignedTechnician
    public string AssignedTechnician { get; set; } = string.Empty;
}
