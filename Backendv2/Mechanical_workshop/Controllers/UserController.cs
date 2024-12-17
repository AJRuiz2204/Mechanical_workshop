// Backend: Controllers/UsersController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;
using System;
using System.Threading.Tasks;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public UsersController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(UserCreateDto userCreateDto)
        {
            // Validar si el username o email ya existen
            if (await _context.Users.AnyAsync(u => u.Username == userCreateDto.Username))
            {
                return BadRequest(new { Message = "El nombre de usuario ya existe." });
            }

            if (await _context.Users.AnyAsync(u => u.Email == userCreateDto.Email))
            {
                return BadRequest(new { Message = "El correo electrónico ya existe." });
            }

            // Mapear el DTO al modelo User
            var user = _mapper.Map<User>(userCreateDto);

            // Guardar el usuario en la base de datos
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(CreateUser), new { id = user.ID }, user);
        }


        // POST: api/Users/login
        [HttpPost("login")]
        public async Task<ActionResult> Login(UserLoginDto userLoginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == userLoginDto.Username);
            if (user == null)
                return Unauthorized("Usuario no encontrado.");

            if (user.Password != userLoginDto.Password)
                return Unauthorized("Contraseña incorrecta.");

            // Aquí podrías devolver información del usuario sin el token JWT
            var userInfo = new
            {
                user.ID,
                user.Email,
                user.Name,
                user.LastName,
                user.Username,
                user.Profile
            };

            return Ok(userInfo);
        }

        // POST: api/Users/forgot-password
        [HttpPost("forgot-password")]
        public async Task<ActionResult> ForgotPassword(ForgotPasswordDto forgotPasswordDto)
        {
            if (!IsValidEmail(forgotPasswordDto.Email))
                return BadRequest(new { Message = "Formato de correo inválido." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == forgotPasswordDto.Email);
            if (user == null)
                return BadRequest(new { Message = "Email no encontrado." });

            // Generar un código de verificación
            var code = new Random().Next(100000, 999999).ToString();
            user.ResetCode = code;
            user.ResetCodeExpiry = DateTime.Now.AddMinutes(5);

            // Guardar el código en la base de datos
            await _context.SaveChangesAsync();

            // Log del código generado en la consola del servidor
            Console.WriteLine($"Código generado para {user.Email}: {code}");

            // Retornar el código generado
            return Ok(new { Code = code });
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
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == verifyCodeDto.Email);
            if (user == null || user.ResetCode != verifyCodeDto.Code || user.ResetCodeExpiry < DateTime.Now)
            {
                return BadRequest(new { Message = "Código inválido o expirado." }); // JSON
            }

            return Ok(new { Message = "Código verificado correctamente." }); // JSON
        }



        [HttpPost("change-password")]
        public async Task<ActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == changePasswordDto.Email);
            if (user == null)
            {
                return BadRequest(new { Message = "Email no encontrado." });
            }

            // Actualiza la contraseña
            user.Password = changePasswordDto.NewPassword;
            user.ResetCode = string.Empty;
            user.ResetCodeExpiry = null;

            await _context.SaveChangesAsync();

            // Devuelve una respuesta en JSON con información del usuario
            return Ok(new
            {
                Message = "Contraseña cambiada correctamente.",
                User = new
                {
                    user.Email,
                    user.Username
                }
            });
        }

    }
}
