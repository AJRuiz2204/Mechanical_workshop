// Controllers/UserWorkshopController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class UserWorkshopController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserWorkshopController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> AddUserWorkshop([FromBody] CreateUserWorkshopDTO dto)
    {
        // Validaciones simples
        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            return BadRequest("Email es requerido.");
        }

        if (string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest("Password es requerido.");
        }

        if (string.IsNullOrWhiteSpace(dto.Username))
        {
            return BadRequest("Username es requerido.");
        }

        // Verificar si ya existe un usuario del taller con el mismo Email o mismo Username
        var existingUserByEmail = await _context.UserWorkshops.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existingUserByEmail != null)
        {
            return BadRequest("Ya existe un usuario del taller con ese Email.");
        }

        var existingUserByUsername = await _context.UserWorkshops.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (existingUserByUsername != null)
        {
            return BadRequest("Ya existe un usuario del taller con ese Username.");
        }

        // Mapear el perfil recibido del frontend a "admin"/"technician"
        string profileMapped = dto.Profile switch
        {
            "Administrador" => "admin",
            "Técnico de Mecánica" => "technician",
            _ => "technician" // Por defecto technician si no coincide
        };

        // Crear el nuevo usuario del taller
        var newUserWorkshop = new UserWorkshop
        {
            Email = dto.Email,
            Name = dto.Name,
            LastName = dto.LastName,
            Password = dto.Password, // Se recomienda encriptar la contraseña antes de guardar
            Username = dto.Username,
            Profile = profileMapped
        };

        // Agregar y guardar en la base de datos
        _context.UserWorkshops.Add(newUserWorkshop);
        await _context.SaveChangesAsync();

        // Retornar Created indicando el endpoint para obtener el usuario
        return CreatedAtAction(nameof(GetUserWorkshop), new { id = newUserWorkshop.ID }, newUserWorkshop);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserWorkshop(int id)
    {
        var userWorkshop = await _context.UserWorkshops.FindAsync(id);
        if (userWorkshop == null) return NotFound();

        return Ok(userWorkshop);
    }
}
