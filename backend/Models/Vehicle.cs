public class Vehicle
{
    public int ID { get; set; }
    public required string Vin { get; set; }
    public required string Make { get; set; }
    public required string Model { get; set; }
    public int Year { get; set; }
    public required string Engine { get; set; }
    public required string Plate { get; set; }
    public required string PlateState { get; set; }

    public int OwnerID { get; set; }
    public required User Owner { get; set; }
}