// DTOs/CreateUserDTO.cs
public class CreateUserDTO
{
    public required string Email { get; set; }
    public required string Name { get; set; }
    public required string LastName { get; set; }
    public required string Password { get; set; }
    public bool NoTax { get; set; }
    public required string Address { get; set; }
    public required string City { get; set; }
    public required string State { get; set; }
    public required string Zip { get; set; }
    public required string Profile { get; set; }  // Ejemplo: "Administrador" o "Técnico de Mecánica"
}
