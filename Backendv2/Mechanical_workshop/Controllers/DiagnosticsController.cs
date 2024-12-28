// Controllers/DiagnosticsController.cs
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
            // Mapear DTO a entidad
            var diagnostic = _mapper.Map<Diagnostic>(diagnosticCreateDto);

            // Agregar a la base de datos
            _context.Diagnostics.Add(diagnostic);
            await _context.SaveChangesAsync();

            // Mapear entidad a ReadDto
            var diagnosticReadDto = _mapper.Map<DiagnosticReadDto>(diagnostic);

            return CreatedAtAction(nameof(GetDiagnostic), new { id = diagnostic.Id }, diagnosticReadDto);
        }

        // GET: api/Diagnostics
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DiagnosticReadDto>>> GetDiagnostics()
        {
            var diagnostics = await _context.Diagnostics
                .Include(d => d.Vehicle)
                .Include(d => d.TechnicianDiagnostics)
                .ToListAsync();

            var diagnosticReadDtos = _mapper.Map<IEnumerable<DiagnosticReadDto>>(diagnostics);
            return Ok(diagnosticReadDtos);
        }

        // GET: api/Diagnostics/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DiagnosticReadDto>> GetDiagnostic(int id)
        {
            var diagnostic = await _context.Diagnostics
                .Include(d => d.Vehicle)
                .Include(d => d.TechnicianDiagnostics)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (diagnostic == null)
            {
                return NotFound(new { message = "No se encontró el diagnóstico." });
            }

            var diagnosticReadDto = _mapper.Map<DiagnosticReadDto>(diagnostic);
            return Ok(diagnosticReadDto);
        }

        // PUT: api/Diagnostics/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDiagnostic(int id, DiagnosticCreateDto diagnosticUpdateDto)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "ID inválido." });
            }

            var diagnostic = await _context.Diagnostics.FindAsync(id);
            if (diagnostic == null)
            {
                return NotFound(new { message = "No se encontró el diagnóstico a actualizar." });
            }

            // Mapear las actualizaciones desde el DTO
            _mapper.Map(diagnosticUpdateDto, diagnostic);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, new { message = "Error al actualizar el diagnóstico." });
            }

            return NoContent();
        }

        // DELETE: api/Diagnostics/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDiagnostic(int id)
        {
            var diagnostic = await _context.Diagnostics.FindAsync(id);
            if (diagnostic == null)
            {
                return NotFound(new { message = "No se encontró el diagnóstico a eliminar." });
            }

            _context.Diagnostics.Remove(diagnostic);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
