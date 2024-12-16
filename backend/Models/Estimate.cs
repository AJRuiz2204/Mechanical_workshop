public class Estimate
{
    public int ID { get; set; }
    public int VehicleID { get; set; } // FK a Vehicle.ID
    public required string Description { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
}