using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagnosticsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public DiagnosticsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // POST: api/Diagnostics
        [HttpPost]
        public async Task<ActionResult<DiagnosticReadDto>> CreateDiagnostic(DiagnosticCreateDto diagnosticCreateDto)
        {
            var vehicle = await _context.Vehicles
                .Include(v => v.UserWorkshop)
                .FirstOrDefaultAsync(v => v.Id == diagnosticCreateDto.VehicleId);

            if (vehicle == null)
            {
                return NotFound(new { message = "El vehículo especificado no existe." });
            }

            var diagnostic = _mapper.Map<Diagnostic>(diagnosticCreateDto);
            diagnostic.CreatedAt = DateTime.UtcNow;

            _context.Diagnostics.Add(diagnostic);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<DiagnosticReadDto>(diagnostic);
            return Ok(readDto);
        }

        // GET: api/Diagnostics/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<DiagnosticReadDto>> GetDiagnostic(int id)
        {
            var diagnostic = await _context.Diagnostics
                .Include(d => d.Vehicle)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (diagnostic == null)
            {
                return NotFound(new { message = "No se encontró el diagnóstico." });
            }

            return Ok(_mapper.Map<DiagnosticReadDto>(diagnostic));
        }

        // GET: api/Diagnostics
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DiagnosticReadDto>>> GetDiagnostics()
        {
            var diagnostics = await _context.Diagnostics
                .Include(d => d.Vehicle)
                .ToListAsync();

            return Ok(_mapper.Map<IEnumerable<DiagnosticReadDto>>(diagnostics));
        }
    }

}
