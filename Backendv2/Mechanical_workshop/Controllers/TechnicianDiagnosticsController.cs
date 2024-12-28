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
            // Verificar que el Diagnostic exista
            var diagnostic = await _context.Diagnostics
                .Include(d => d.Vehicle)
                .FirstOrDefaultAsync(d => d.Id == dto.DiagnosticId);

            if (diagnostic == null)
                return NotFound(new { message = "No se encontró el diagnóstico (Diagnostic) especificado." });

            // Mapear
            var entity = _mapper.Map<TechnicianDiagnostic>(dto);

            // Opcional: hacer validaciones adicionales
            // Por ejemplo, si mileage < 0, etc.

            _context.TechnicianDiagnostics.Add(entity);
            await _context.SaveChangesAsync();

            // Retornar un readDto con ReasonForVisit y VehicleId
            var readDto = await _context.TechnicianDiagnostics
                .Include(t => t.Diagnostic)
                .Where(t => t.Id == entity.Id)
                .Select(t => new TechnicianDiagnosticReadDto
                {
                    Id = t.Id,
                    DiagnosticId = t.DiagnosticId,
                    ReasonForVisit = t.Diagnostic != null ? t.Diagnostic.ReasonForVisit : "",
                    VehicleId = t.Diagnostic != null ? t.Diagnostic.VehicleId : 0,
                    Mileage = t.Mileage,
                    ExtendedDiagnostic = t.ExtendedDiagnostic
                })
                .FirstOrDefaultAsync();

            return Ok(readDto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TechnicianDiagnosticReadDto>> GetTechnicianDiagnostic(int id)
        {
            var td = await _context.TechnicianDiagnostics
                .Include(t => t.Diagnostic)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (td == null)
            {
                return NotFound(new { message = "No se encontró el TechDiagnostic con ese ID." });
            }

            var readDto = _mapper.Map<TechnicianDiagnosticReadDto>(td);
            return Ok(readDto);
        }


        // PUT api/TechnicianDiagnostics/
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTechnicianDiagnostic(int id, TechnicianDiagnosticCreateDto dto)
        {
            var existingTd = await _context.TechnicianDiagnostics.FindAsync(id);
            if (existingTd == null)
                return NotFound(new { message = "No se encontró el TechDiagnostic a actualizar." });

            // Actualizamos datos
            existingTd.Mileage = dto.Mileage;
            existingTd.ExtendedDiagnostic = dto.ExtendedDiagnostic;

            await _context.SaveChangesAsync();
            return NoContent();
        }


        // GET: api/TechnicianDiagnostics/byDiagnostic/5
        [HttpGet("byDiagnostic/{diagnosticId}")]
        public async Task<ActionResult<TechnicianDiagnosticReadDto>> GetByDiagnosticId(int diagnosticId)
        {
            var techDiag = await _context.TechnicianDiagnostics
                .Include(td => td.Diagnostic)
                .FirstOrDefaultAsync(td => td.DiagnosticId == diagnosticId);

            if (techDiag == null)
            {
                return NotFound(new { message = "No existe un TechnicianDiagnostic para ese DiagnosticId." });
            }

            var readDto = _mapper.Map<TechnicianDiagnosticReadDto>(techDiag);
            return Ok(readDto);
        }

        // DELETE: api/TechnicianDiagnostics/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTechnicianDiagnostic(int id)
        {
            var td = await _context.TechnicianDiagnostics.FindAsync(id);
            if (td == null)
            {
                return NotFound(new { message = "No se encontró el TechDiagnostic a eliminar." });
            }

            _context.TechnicianDiagnostics.Remove(td);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
