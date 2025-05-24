// Controllers/DiagnosticsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;
using Microsoft.Extensions.Logging;

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
        private readonly ILogger<DiagnosticsController> _logger;

        public DiagnosticsController(AppDbContext context, IMapper mapper, ILogger<DiagnosticsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
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
                _logger.LogError(ex, "Error creating diagnostic");
                return StatusCode(500, new { message = $"Error al crear el diagnóstico: {ex.ToString()}" });
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
                _logger.LogError(ex, "Error retrieving diagnostics");
                return StatusCode(500, new { message = $"Error al obtener los diagnósticos: {ex.ToString()}" });
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
                    _logger.LogWarning("Diagnostic with ID {Id} not found", id);
                    return NotFound(new { message = "Diagnostic not found." });
                }

                var diagnosticReadDto = _mapper.Map<DiagnosticReadDto>(diagnostic);
                return Ok(diagnosticReadDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving diagnostic with ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al obtener el diagnóstico: {ex.ToString()}" });
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
                    _logger.LogWarning("Invalid diagnostic ID: {Id}", id);
                    return BadRequest(new { message = "Invalid ID." });
                }

                var diagnostic = await _context.Diagnostics.FindAsync(id);
                if (diagnostic == null)
                {
                    _logger.LogWarning("Diagnostic to update not found, ID: {Id}", id);
                    return NotFound(new { message = "Diagnostic to update not found." });
                }

                // Map updates from DTO
                _mapper.Map(diagnosticUpdateDto, diagnostic);

                await _context.SaveChangesAsync();
                
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error updating diagnostic with ID: {Id}", id);
                return StatusCode(500, new { message = $"Error updating the diagnostic: {ex.ToString()}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating diagnostic with ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al actualizar el diagnóstico: {ex.ToString()}" });
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
                    _logger.LogWarning("Diagnostic to delete not found, ID: {Id}", id);
                    return NotFound(new { message = "Diagnostic to delete not found." });
                }

                _context.Diagnostics.Remove(diagnostic);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting diagnostic with ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al eliminar el diagnóstico: {ex.ToString()}" });
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
                    _logger.LogWarning("Invalid technician name or lastName parameters");
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
                _logger.LogError(ex, "Error retrieving diagnostics by technician. Name: {Name}, LastName: {LastName}", name, lastName);
                return StatusCode(500, new { message = $"Error al obtener los diagnósticos del técnico: {ex.ToString()}" });
            }
        }
    }
}
