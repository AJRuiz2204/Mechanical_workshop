// Controllers/TechnicianDiagnosticsController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;
using Microsoft.Extensions.Logging;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TechnicianDiagnosticsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<TechnicianDiagnosticsController> _logger;

        public TechnicianDiagnosticsController(AppDbContext context, IMapper mapper, ILogger<TechnicianDiagnosticsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // POST: api/TechnicianDiagnostics
        [HttpPost]
        public async Task<ActionResult<TechnicianDiagnosticReadDto>> CreateTechnicianDiagnostic(TechnicianDiagnosticCreateDto dto)
        {
            try
            {
                var diagnostic = await _context.Diagnostics.FindAsync(dto.DiagnosticId);
                if (diagnostic == null)
                {
                    _logger.LogWarning("Diagnóstico no encontrado con ID: {DiagnosticId}", dto.DiagnosticId);
                    return NotFound(new { message = "Diagnostic not found." });
                }

                var entity = _mapper.Map<TechnicianDiagnostic>(dto);
                _context.TechnicianDiagnostics.Add(entity);
                await _context.SaveChangesAsync();

                var notes = await _context.Notes.Where(n => n.DiagnosticId == entity.DiagnosticId && n.TechnicianDiagnosticId == null).ToListAsync();
                foreach (var note in notes)
                {
                    note.TechnicianDiagnosticId = entity.Id;
                }
                await _context.SaveChangesAsync();

                _logger.LogInformation("Diagnóstico técnico creado con ID: {Id}", entity.Id);
                return CreatedAtAction(nameof(GetTechnicianDiagnostic), new { id = entity.Id }, _mapper.Map<TechnicianDiagnosticReadDto>(entity));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el diagnóstico del técnico");
                return StatusCode(500, new { message = $"Error al crear el diagnóstico del técnico: {ex.Message.ToString()}" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTechnicianDiagnostic(int id, TechnicianDiagnosticCreateDto dto)
        {
            try
            {
                var existingTd = await _context.TechnicianDiagnostics.FindAsync(id);
                if (existingTd == null)
                {
                    _logger.LogWarning("Diagnóstico técnico no encontrado con ID: {Id}", id);
                    return NotFound(new { message = "Technician Diagnostic to update was not found." });
                }

                existingTd.Mileage = dto.Mileage;
                existingTd.ExtendedDiagnostic = dto.ExtendedDiagnostic;

                await _context.SaveChangesAsync();

                var notes = await _context.Notes.Where(n => n.DiagnosticId == existingTd.DiagnosticId && n.TechnicianDiagnosticId == null).ToListAsync();
                foreach (var note in notes)
                {
                    note.TechnicianDiagnosticId = existingTd.Id;
                }
                await _context.SaveChangesAsync();

                _logger.LogInformation("Diagnóstico técnico actualizado con ID: {Id}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el diagnóstico del técnico con ID {Id}", id);
                return StatusCode(500, new { message = $"Error al actualizar el diagnóstico del técnico: {ex.Message.ToString()}" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TechnicianDiagnosticReadDto>> GetTechnicianDiagnostic(int id)
        {
            try
            {
                var td = await _context.TechnicianDiagnostics
                    .Include(t => t.Diagnostic)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (td == null)
                {
                    _logger.LogWarning("Diagnóstico técnico no encontrado con ID: {Id}", id);
                    return NotFound(new { message = "Technician Diagnostic with that ID was not found." });
                }

                var readDto = _mapper.Map<TechnicianDiagnosticReadDto>(td);
                return Ok(readDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el diagnóstico del técnico con ID {Id}", id);
                return StatusCode(500, new { message = $"Error al obtener el diagnóstico del técnico: {ex.Message.ToString()}" });
            }
        }

        // GET: api/TechnicianDiagnostics/byDiagnostic/5
        [HttpGet("byDiagnostic/{diagnosticId}")]
        public async Task<ActionResult<TechnicianDiagnosticReadDto>> GetByDiagnosticId(int diagnosticId)
        {
            try
            {
                var techDiag = await _context.TechnicianDiagnostics
                    .Include(td => td.Diagnostic)
                    .FirstOrDefaultAsync(td => td.DiagnosticId == diagnosticId);

                if (techDiag == null)
                {
                    _logger.LogWarning("No hay diagnóstico técnico para el diagnóstico ID: {DiagnosticId}", diagnosticId);
                    return NotFound(new { message = "There is no TechnicianDiagnostic for that DiagnosticId." });
                }

                var readDto = _mapper.Map<TechnicianDiagnosticReadDto>(techDiag);
                return Ok(readDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el diagnóstico por ID de diagnóstico: {DiagnosticId}", diagnosticId);
                return StatusCode(500, new { message = $"Error al obtener el diagnóstico por ID de diagnóstico: {ex.Message.ToString()}" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTechnicianDiagnostic(int id)
        {
            try
            {
                var td = await _context.TechnicianDiagnostics
                    .Include(td => td.Notes)
                    .FirstOrDefaultAsync(td => td.Id == id);

                if (td == null)
                {
                    _logger.LogWarning("Intento de eliminar un diagnóstico técnico inexistente con ID: {Id}", id);
                    return NotFound();
                }

                _context.TechnicianDiagnostics.Remove(td);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Diagnóstico técnico eliminado con ID: {Id}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar el diagnóstico del técnico con ID {Id}", id);
                return StatusCode(500, new { message = $"Error al eliminar el diagnóstico del técnico: {ex.Message.ToString()}" });
            }
        }

        // GET: api/TechnicianDiagnostics/vehicle/{vehicleId}
        [HttpGet("vehicle/{vehicleId}")]
        public async Task<ActionResult<TechnicianDiagnosticReadDto>> GetDiagnosticByVehicleId(int vehicleId)
        {
            try
            {
                var techDiag = await _context.TechnicianDiagnostics
                    .Include(td => td.Diagnostic)
                    .FirstOrDefaultAsync(td => td.Diagnostic.VehicleId == vehicleId);
                if (techDiag == null)
                {
                    _logger.LogWarning("No se encontró diagnóstico técnico para el vehículo ID: {VehicleId}", vehicleId);
                    return NotFound(new { message = $"No Technician Diagnostic found for Vehicle ID {vehicleId}." });
                }
                var readDto = _mapper.Map<TechnicianDiagnosticReadDto>(techDiag);
                return Ok(readDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el diagnóstico por ID de vehículo: {VehicleId}", vehicleId);
                return StatusCode(500, new { message = $"Error al obtener el diagnóstico por ID de vehículo: {ex.Message.ToString()}" });
            }
        }

        [HttpGet("byDiagnostics")]
        public async Task<ActionResult<IEnumerable<TechnicianDiagnosticReadDto>>> GetByDiagnosticIds(
            [FromQuery] List<int> diagnosticIds)
        {
            try
            {
                var techDiags = await _context.TechnicianDiagnostics
                    .Include(td => td.Diagnostic)
                    .Where(td => diagnosticIds.Contains(td.DiagnosticId))
                    .ToListAsync();

                return Ok(_mapper.Map<IEnumerable<TechnicianDiagnosticReadDto>>(techDiags));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los diagnósticos por IDs: {@DiagnosticIds}", diagnosticIds);
                return StatusCode(500, new { message = $"Error al obtener los diagnósticos por IDs: {ex.Message.ToString()}" });
            }
        }
    }
}