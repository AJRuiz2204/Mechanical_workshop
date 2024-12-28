namespace Mechanical_workshop.Dtos
{
    public class VehicleReadDto
    {
        public int Id { get; set; }
        public string Vin { get; set; } = string.Empty;
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string Engine { get; set; } = string.Empty;
        public string Plate { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;

        // NUEVO: Status
        public string Status { get; set; } = "Visto";

        public int UserWorkshopId { get; set; }
        public UserWorkshopReadDto? UserWorkshop { get; set; }
    }
}
