namespace Mechanical_workshop.Dtos
{
    public class VehicleDto
    {
        public string Vin { get; set; } = string.Empty;
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string Engine { get; set; } = string.Empty;
        public string Plate { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
    }

    public class UserWorkshopCreateDto
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Profile { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Zip { get; set; } = string.Empty;
        public string PrimaryNumber { get; set; } = string.Empty;
        public string? SecondaryNumber { get; set; }
        public bool NoTax { get; set; }
        public List<VehicleDto> Vehicles { get; set; } = new();
    }

    public class UserWorkshopReadDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public List<VehicleDto> Vehicles { get; set; } = new();
    }
}
