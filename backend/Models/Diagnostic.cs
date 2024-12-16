public class Diagnostic
{
    public int ID { get; set; }
    public int VehicleID { get; set; }
    public int AssignedTechnicianID { get; set; }
    public required string Reason { get; set; }
    public DateTime? CreatedDate { get; set; }
}