public class Invoice
{
    public int ID { get; set; }
    public int VehicleID { get; set; } // FK a Vehicle.ID
    public int UserID { get; set; } // FK a User.ID
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public required string Status { get; set; }
}