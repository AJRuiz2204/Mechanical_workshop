// Controllers/UsersController.cs
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
            // Validate if the username or email already exists
            if (await _context.Users.AnyAsync(u => u.Username == userCreateDto.Username))
            {
                return BadRequest(new { Message = "Username already exists." });
            }

            if (await _context.Users.AnyAsync(u => u.Email == userCreateDto.Email))
            {
                return BadRequest(new { Message = "Email already exists." });
            }

            // Map the DTO to the User model
            var user = _mapper.Map<User>(userCreateDto);

            // Save the user to the database
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
                return Unauthorized("User not found.");

            if (user.Password != userLoginDto.Password)
                return Unauthorized("Incorrect password.");

            // Here you could return user information without the JWT token
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
                return BadRequest(new { Message = "Invalid email format." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == forgotPasswordDto.Email);
            if (user == null)
                return BadRequest(new { Message = "Email not found." });

            // Generate a verification code
            var code = new Random().Next(100000, 999999).ToString();
            user.ResetCode = code;
            user.ResetCodeExpiry = DateTime.Now.AddMinutes(5);

            // Save the code to the database
            await _context.SaveChangesAsync();

            // Log the generated code in the server console
            Console.WriteLine($"Generated code for {user.Email}: {code}");

            // Return the generated code
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
                return BadRequest(new { Message = "Invalid or expired code." }); // JSON
            }

            return Ok(new { Message = "Code verified successfully." }); // JSON
        }



        [HttpPost("change-password")]
        public async Task<ActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == changePasswordDto.Email);
            if (user == null)
            {
                return BadRequest(new { Message = "Email not found." });
            }

            // Update the password
            user.Password = changePasswordDto.NewPassword;
            user.ResetCode = string.Empty;
            user.ResetCodeExpiry = null;

            await _context.SaveChangesAsync();

            // Return a JSON response with user information
            return Ok(new
            {
                Message = "Password changed successfully.",
                User = new
                {
                    user.Email,
                    user.Username
                }
            });
        }

    }
}
