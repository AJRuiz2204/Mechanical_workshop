// Controllers/UserController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> AddUser([FromBody] CreateUserDTO dto)
    {
        // Validaciones mínimas
        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            return BadRequest("Email es requerido.");
        }

        if (string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest("Password es requerido.");
        }

        // Verificar si ya existe un usuario con el mismo Email
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existingUser != null)
        {
            return BadRequest("Ya existe un usuario con ese Email.");
        }

        // Crear el nuevo usuario
        var newUser = new User
        {
            Email = dto.Email,
            Name = dto.Name,
            LastName = dto.LastName,
            Password = dto.Password, // Aquí se recomienda encriptar la contraseña antes de asignarla
            NoTax = dto.NoTax,
            Address = dto.Address,
            City = dto.City,
            State = dto.State,
            Zip = dto.Zip,
            Profile = dto.Profile,
        };

        // Agregar y guardar en la base de datos
        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        // Retornar Created indicando el endpoint para obtener el usuario
        return CreatedAtAction(nameof(GetUser), new { id = newUser.ID }, newUser);
    }

    // Endpoint para obtener un usuario por su ID (ejemplo para CreatedAtAction)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        return Ok(user);
    }
}
