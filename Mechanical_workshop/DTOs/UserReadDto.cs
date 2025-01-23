// Backend: Dtos/UserReadDto.cs
namespace Mechanical_workshop.Dtos
{
    public class UserReadDto
    {
        public int ID { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Profile { get; set; } = string.Empty;
    }
}