// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    public class LoginDTO
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest("Username y Password son requeridos.");
        }

        // Buscar el usuario en la base de datos. Asumiendo UserWorkshop
        var user = await _context.UserWorkshops.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (user == null)
        {
            // Usuario no existe
            return Unauthorized("Credenciales inválidas");
        }

        // Aquí deberías verificar la contraseña, comparándola con la versión encriptada en la BD.
        // Este ejemplo asume que la contraseña se guarda en texto plano, lo cual NO es recomendable.
        // Deberías usar hashing.
        if (user.Password != dto.Password)
        {
            return Unauthorized("Credenciales inválidas");
        }

        // Si las credenciales son correctas, retornar un 200 OK.
        // Podrías retornar un token JWT u otra información.
        return Ok(new { message = "Login exitoso", userId = user.ID });
    }
}
