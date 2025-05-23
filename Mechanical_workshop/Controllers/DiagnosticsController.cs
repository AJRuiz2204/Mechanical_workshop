// Controllers/DiagnosticsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;

namespace Mechanical_workshop.Controllers
{
    /// <summary>
    /// Controller for managing diagnostics.
    /// </summary>
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

        /// <summary>
        /// Creates a new diagnostic.
        /// </summary>
        /// <param name="diagnosticCreateDto">Diagnostic data transfer object.</param>
        /// <returns>The created diagnostic read DTO.</returns>
        [HttpPost]
        public async Task<ActionResult<DiagnosticReadDto>> CreateDiagnostic(DiagnosticCreateDto diagnosticCreateDto)
        {
            try
            {
                // Map DTO to entity
                var diagnostic = _mapper.Map<Diagnostic>(diagnosticCreateDto);

                // Add to database
                _context.Diagnostics.Add(diagnostic);
                await _context.SaveChangesAsync();

                // Reconsulta el diagnóstico para incluir Vehicle y UserWorkshop
                var diagnosticWithRelations = await _context.Diagnostics
                    .Include(d => d.Vehicle)
                        .ThenInclude(v => v.UserWorkshop)
                    .FirstOrDefaultAsync(d => d.Id == diagnostic.Id);

                // Map entity to ReadDto
                var diagnosticReadDto = _mapper.Map<DiagnosticReadDto>(diagnosticWithRelations);

                return CreatedAtAction(nameof(GetDiagnostic), new { id = diagnostic.Id }, diagnosticReadDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al crear el diagnóstico: {ex.Message}" });
            }
        }

        // GET: api/Diagnostics
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DiagnosticReadDto>>> GetDiagnostics()
        {
            try
            {
                var diagnostics = await _context.Diagnostics
                    .Include(d => d.Vehicle)
                        .ThenInclude(v => v.UserWorkshop)
                    .Include(d => d.TechnicianDiagnostics)
                    .ToListAsync();

                var diagnosticReadDtos = _mapper.Map<IEnumerable<DiagnosticReadDto>>(diagnostics);
                return Ok(diagnosticReadDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener los diagnósticos: {ex.Message}" });
            }
        }

        // GET: api/Diagnostics/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DiagnosticReadDto>> GetDiagnostic(int id)
        {
            try
            {
                var diagnostic = await _context.Diagnostics
                    .Include(d => d.Vehicle)
                        .ThenInclude(v => v.UserWorkshop)
                    .Include(d => d.TechnicianDiagnostics)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (diagnostic == null)
                {
                    return NotFound(new { message = "Diagnostic not found." });
                }

                var diagnosticReadDto = _mapper.Map<DiagnosticReadDto>(diagnostic);
                return Ok(diagnosticReadDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener el diagnóstico: {ex.Message}" });
            }
        }

        // PUT: api/Diagnostics/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDiagnostic(int id, DiagnosticCreateDto diagnosticUpdateDto)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new { message = "Invalid ID." });
                }

                var diagnostic = await _context.Diagnostics.FindAsync(id);
                if (diagnostic == null)
                {
                    return NotFound(new { message = "Diagnostic to update not found." });
                }

                // Map updates from DTO
                _mapper.Map(diagnosticUpdateDto, diagnostic);

                await _context.SaveChangesAsync();
                
                return NoContent();
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, new { message = "Error updating the diagnostic." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al actualizar el diagnóstico: {ex.Message}" });
            }
        }

        // DELETE: api/Diagnostics/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDiagnostic(int id)
        {
            try
            {
                var diagnostic = await _context.Diagnostics.FindAsync(id);
                if (diagnostic == null)
                {
                    return NotFound(new { message = "Diagnostic to delete not found." });
                }

                _context.Diagnostics.Remove(diagnostic);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al eliminar el diagnóstico: {ex.Message}" });
            }
        }

        // GET: api/Diagnostics/byTechnician?name=John&lastName=Doe
        [HttpGet("byTechnician")]
        public async Task<ActionResult<IEnumerable<DiagnosticReadDto>>> GetDiagnosticsByTechnician([FromQuery] string name, [FromQuery] string lastName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(lastName))
                {
                    return BadRequest(new { message = "Query parameters 'name' and 'lastName' are required." });
                }

                var fullName = $"{name} {lastName}";

                var diagnostics = await _context.Diagnostics
                    .Where(d => d.AssignedTechnician == fullName)
                    .Include(d => d.Vehicle)
                        .ThenInclude(v => v.UserWorkshop)
                    .Include(d => d.TechnicianDiagnostics)
                    .ToListAsync();

                var diagnosticReadDtos = _mapper.Map<IEnumerable<DiagnosticReadDto>>(diagnostics);

                return Ok(diagnosticReadDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener los diagnósticos del técnico: {ex.Message}" });
            }
        }
    }
}
