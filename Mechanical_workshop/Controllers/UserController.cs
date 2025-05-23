using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        private readonly ILogger<UsersController> _logger;

        public UsersController(AppDbContext context, IMapper mapper, IConfiguration config, ILogger<UsersController> logger)
        {
            _context = context;
            _mapper = mapper;
            _config = config;
            _logger = logger;
        }

        // 🔹 POST: api/Users/register (Crear usuario)
        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(UserCreateDto userCreateDto)
        {
            try
            {
                _logger.LogInformation("Register endpoint llamado.");

                if (await _context.Users.AnyAsync(u => u.Username == userCreateDto.Username))
                    return BadRequest(new { Message = "Username already exists." });

                if (await _context.Users.AnyAsync(u => u.Email == userCreateDto.Email))
                    return BadRequest(new { Message = "Email already exists." });

                var user = _mapper.Map<User>(userCreateDto);
                user.Password = BCrypt.Net.BCrypt.HashPassword(userCreateDto.Password);

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(Register), new { id = user.ID }, user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante el registro de usuario");
                return StatusCode(500, new { message = $"Error al registrar el usuario: {ex.Message}" });
            }
        }

        // 🔹 POST: api/Users/login (Autenticación y generación de JWT)
        [HttpPost("login")]
        public async Task<ActionResult> Login(UserLoginDto userLoginDto)
        {
            try
            {
                _logger.LogInformation("Login endpoint llamado.");

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == userLoginDto.Username);
                if (user == null)
                    return Unauthorized(new { Message = "User not found." });

                if (!BCrypt.Net.BCrypt.Verify(userLoginDto.Password, user.Password))
                    return Unauthorized(new { Message = "Incorrect password." });

                var token = GenerateJwtToken(user);
                return Ok(new
                {
                    Token = token,
                    User = new
                    {
                        user.ID,
                        user.Email,
                        user.Name,
                        user.LastName,
                        user.Username,
                        user.Profile
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante el inicio de sesión");
                return StatusCode(500, new { message = $"Error al iniciar sesión: {ex.Message}" });
            }
        }

        // 🔹 Método para generar JWT (ahora usa Profile en lugar de Role)
        private string GenerateJwtToken(User user)
        {
            try
            {
                var jwtSettings = _config.GetSection("JwtSettings");
                var secretKey = jwtSettings["Secret"];

                if (string.IsNullOrEmpty(secretKey))
                {
                    throw new InvalidOperationException("JWT Secret Key is missing in appsettings.json");
                }

                var key = Encoding.UTF8.GetBytes(secretKey);

                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Profile)
                };

                var token = new JwtSecurityToken(
                    issuer: jwtSettings["Issuer"],
                    audience: jwtSettings["Audience"],
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["TokenExpirationMinutes"])),
                    signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar token JWT");
                throw;
            }
        }


        // 🔹 GET: api/Users/profile (Obtener perfil del usuario autenticado)
        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult> GetProfile()
        {
            try
            {
                _logger.LogInformation("GetProfile endpoint llamado.");

                var username = User.Identity.Name;
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

                if (user == null)
                    return NotFound(new { Message = "User not found." });

                return Ok(new
                {
                    user.ID,
                    user.Email,
                    user.Name,
                    user.LastName,
                    user.Username,
                    user.Profile
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el perfil del usuario");
                return StatusCode(500, new { message = $"Error al obtener el perfil: {ex.Message}" });
            }
        }

        // POST: api/Users/forgot-password
        [HttpPost("forgot-password")]
        public async Task<ActionResult> ForgotPassword(ForgotPasswordDto forgotPasswordDto)
        {
            try
            {
                if (!IsValidEmail(forgotPasswordDto.Email))
                    return BadRequest(new { Message = "Invalid email format." });

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == forgotPasswordDto.Email);
                if (user == null)
                    return BadRequest(new { Message = "Email not found." });

                var code = new Random().Next(100000, 999999).ToString();
                user.ResetCode = code;
                user.ResetCodeExpiry = DateTime.Now.AddMinutes(5);

                await _context.SaveChangesAsync();

                Console.WriteLine($"Generated code for {user.Email}: {code}");

                return Ok(new { Code = code });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar la solicitud de contraseña olvidada");
                return StatusCode(500, new { message = $"Error al procesar la solicitud: {ex.Message}" });
            }
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        [HttpPost("verify-code")]
        public async Task<ActionResult> VerifyCode(VerifyCodeDto verifyCodeDto)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == verifyCodeDto.Email);
                if (user == null || user.ResetCode != verifyCodeDto.Code || user.ResetCodeExpiry < DateTime.Now)
                {
                    return BadRequest(new { Message = "Invalid or expired code." });
                }

                return Ok(new { Message = "Code verified successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar el código");
                return StatusCode(500, new { message = $"Error al verificar el código: {ex.Message}" });
            }
        }

        // 🔹 GET: api/Users/admin (Solo accesible para admins)
        [HttpGet("admin")]
        [Authorize(Roles = "Administrator")]
        public IActionResult GetAdminData()
        {
            try
            {
                _logger.LogInformation("GetAdminData endpoint llamado.");
                return Ok(new { Message = "This is protected admin data" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al acceder a datos de administrador");
                return StatusCode(500, new { message = $"Error al acceder a datos de administrador: {ex.Message}" });
            }
        }
    }
}
