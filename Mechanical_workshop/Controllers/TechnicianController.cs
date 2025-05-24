// Backend: Controllers/TechnicianController.cs
using AutoMapper;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TechnicianController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<TechnicianController> _logger;

        public TechnicianController(AppDbContext context, IMapper mapper, ILogger<TechnicianController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TechnicianDtos>>> GetTechnicians()
        {
            try
            {
                var technicians = await _context.Users
                    .Where(u => u.Profile == "Technician")
                    .ToListAsync();

                var technicianDtos = _mapper.Map<IEnumerable<TechnicianDtos>>(technicians);

                return Ok(technicianDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los técnicos");
                return StatusCode(500, new { message = $"Error al obtener los técnicos: {ex.Message.ToString()}" });
            }
        }
    }
}
