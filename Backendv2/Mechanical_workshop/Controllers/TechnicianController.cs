// Backend: Controllers/TechnicianController.cs
using AutoMapper;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TechnicianController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public TechnicianController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TechnicianDtos>>> GetTechnicians()
        {
            var technicians = await _context.Users
                .Where(u => u.Profile == "Technician")
                .ToListAsync();

            var technicianDtos = _mapper.Map<IEnumerable<TechnicianDtos>>(technicians);

            return Ok(technicianDtos);
        }
    }
}
