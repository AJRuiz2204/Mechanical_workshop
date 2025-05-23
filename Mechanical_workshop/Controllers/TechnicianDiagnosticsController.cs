// Controllers/TechnicianDiagnosticsController.cs

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
    public class TechnicianDiagnosticsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public TechnicianDiagnosticsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // POST: api/TechnicianDiagnostics
        [HttpPost]
        public async Task<ActionResult<TechnicianDiagnosticReadDto>> CreateTechnicianDiagnostic(TechnicianDiagnosticCreateDto dto)
        {
            try
            {
                var diagnostic = await _context.Diagnostics.FindAsync(dto.DiagnosticId);
                if (diagnostic == null)
                    return NotFound(new { message = "Diagnostic not found." });

                var entity = _mapper.Map<TechnicianDiagnostic>(dto);
                _context.TechnicianDiagnostics.Add(entity);
                await _context.SaveChangesAsync();

                var notes = await _context.Notes.Where(n => n.DiagnosticId == entity.DiagnosticId && n.TechnicianDiagnosticId == null).ToListAsync();
                foreach (var note in notes)
                {
                    note.TechnicianDiagnosticId = entity.Id;
                }
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetTechnicianDiagnostic), new { id = entity.Id }, _mapper.Map<TechnicianDiagnosticReadDto>(entity));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al crear el diagnóstico del técnico: {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTechnicianDiagnostic(int id, TechnicianDiagnosticCreateDto dto)
        {
            try
            {
                var existingTd = await _context.TechnicianDiagnostics.FindAsync(id);
                if (existingTd == null)
                    return NotFound(new { message = "Technician Diagnostic to update was not found." });

                existingTd.Mileage = dto.Mileage;
                existingTd.ExtendedDiagnostic = dto.ExtendedDiagnostic;

                await _context.SaveChangesAsync();

                var notes = await _context.Notes.Where(n => n.DiagnosticId == existingTd.DiagnosticId && n.TechnicianDiagnosticId == null).ToListAsync();
                foreach (var note in notes)
                {
                    note.TechnicianDiagnosticId = existingTd.Id;
                }
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al actualizar el diagnóstico del técnico: {ex.Message}" });
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
                    return NotFound(new { message = "Technician Diagnostic with that ID was not found." });
                }

                var readDto = _mapper.Map<TechnicianDiagnosticReadDto>(td);
                return Ok(readDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener el diagnóstico del técnico: {ex.Message}" });
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
                    return NotFound(new { message = "There is no TechnicianDiagnostic for that DiagnosticId." });
                }

                var readDto = _mapper.Map<TechnicianDiagnosticReadDto>(techDiag);
                return Ok(readDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener el diagnóstico por ID de diagnóstico: {ex.Message}" });
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

                if (td == null) return NotFound();

                _context.TechnicianDiagnostics.Remove(td);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al eliminar el diagnóstico del técnico: {ex.Message}" });
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
                    return NotFound(new { message = $"No Technician Diagnostic found for Vehicle ID {vehicleId}." });
                }
                var readDto = _mapper.Map<TechnicianDiagnosticReadDto>(techDiag);
                return Ok(readDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener el diagnóstico por ID de vehículo: {ex.Message}" });
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
                return StatusCode(500, new { message = $"Error al obtener los diagnósticos por IDs: {ex.Message}" });
            }
        }
    }
}