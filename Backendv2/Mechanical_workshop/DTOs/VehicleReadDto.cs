using System.ComponentModel.DataAnnotations;

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

        // FK para saber a qué taller pertenece
        public int UserWorkshopId { get; set; }

        // Detalles del dueño (taller)
        public UserWorkshopReadDto? UserWorkshop { get; set; }
    }

    
   
}
