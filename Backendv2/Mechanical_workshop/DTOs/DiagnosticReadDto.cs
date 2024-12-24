public class DiagnosticReadDto
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public string AssignedTechnician { get; set; } = string.Empty;
    public string ReasonForVisit { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

}
