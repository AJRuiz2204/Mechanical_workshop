namespace Mechanical_workshop.Dtos
{
    public class VehicleSearchDto
{
    public int Id { get; set; }           // <-- nuevo campo
    public string Vin { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;

    public string OwnerName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

}
