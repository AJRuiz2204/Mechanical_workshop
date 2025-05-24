using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;
using static Mechanical_workshop.Dtos.NoteDto;
using Microsoft.Extensions.Logging;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<NotesController> _logger;

        public NotesController(AppDbContext context, IMapper mapper, ILogger<NotesController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/notes/diagnostic/5
        [HttpGet("diagnostic/{diagId}")]
        public async Task<ActionResult<IEnumerable<NoteReadDto>>> GetNotesByDiagnostic(int diagId)
        {
            try
            {
                var notes = await _context.Notes
                    .Where(n => n.DiagnosticId == diagId)
                    .ToListAsync();

                return Ok(_mapper.Map<IEnumerable<NoteReadDto>>(notes));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las notas del diagnóstico con ID {DiagId}", diagId);
                return StatusCode(500, new { message = $"Error al obtener las notas del diagnóstico: {ex.Message.ToString()}" });
            }
        }

        [HttpGet("techniciandiagnostic/{techDiagId}")]
        public async Task<ActionResult<IEnumerable<NoteReadDto>>> GetNotesByTechDiag(int techDiagId)
        {
            try
            {
                var notes = await _context.Notes
                    .Where(n => n.TechnicianDiagnosticId == techDiagId || n.DiagnosticId ==
                                (_context.TechnicianDiagnostics.Where(td => td.Id == techDiagId)
                                .Select(td => td.DiagnosticId)
                                .FirstOrDefault()))
                    .ToListAsync();

                if (!notes.Any())
                {
                    _logger.LogWarning("No se encontraron notas para el diagnóstico técnico ID {TechDiagId}", techDiagId);
                    return NotFound(new { message = "No notes found for Technician Diagnostic ID." });
                }

                return Ok(_mapper.Map<IEnumerable<NoteReadDto>>(notes));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las notas del diagnóstico técnico con ID {TechDiagId}", techDiagId);
                return StatusCode(500, new { message = $"Error al obtener las notas del diagnóstico técnico: {ex.Message.ToString()}" });
            }
        }


        // GET: api/notes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<NoteReadDto>> GetNote(int id)
        {
            try
            {
                var note = await _context.Notes.FindAsync(id);
                if (note == null) 
                {
                    _logger.LogWarning("Nota con ID {Id} no encontrada", id);
                    return NotFound();
                }

                return Ok(_mapper.Map<NoteReadDto>(note));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la nota con ID {Id}", id);
                return StatusCode(500, new { message = $"Error al obtener la nota: {ex.Message.ToString()}" });
            }
        }

        // POST: api/notes
        [HttpPost]
        public async Task<ActionResult<NoteReadDto>> CreateNote(NoteCreateDto dto)
        {
            try
            {
                var diagnostic = await _context.Diagnostics.FindAsync(dto.DiagnosticId);
                if (diagnostic == null)
                {
                    _logger.LogWarning("Intento de crear nota con ID de diagnóstico inválido: {DiagnosticId}", dto.DiagnosticId);
                    return BadRequest("Invalid Diagnostic ID");
                }

                var note = _mapper.Map<Note>(dto);
                _context.Notes.Add(note);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Nota creada con ID {Id} para diagnóstico {DiagnosticId}", note.Id, dto.DiagnosticId);
                return CreatedAtAction(nameof(GetNote),
                    new { id = note.Id },
                    _mapper.Map<NoteReadDto>(note));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la nota");
                return StatusCode(500, new { message = $"Error al crear la nota: {ex.Message.ToString()}" });
            }
        }

        // PUT: api/notes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, NoteUpdateDto dto)
        {
            try
            {
                var note = await _context.Notes.FindAsync(id);
                if (note == null)
                {
                    _logger.LogWarning("Intento de actualizar nota inexistente con ID {Id}", id);
                    return NotFound();
                }

                _mapper.Map(dto, note);
                note.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                _logger.LogInformation("Nota con ID {Id} actualizada correctamente", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la nota con ID {Id}", id);
                return StatusCode(500, new { message = $"Error al actualizar la nota: {ex.Message.ToString()}" });
            }
        }

        // DELETE: api/notes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            try
            {
                var note = await _context.Notes.FindAsync(id);
                if (note == null)
                {
                    _logger.LogWarning("Intento de eliminar nota inexistente con ID {Id}", id);
                    return NotFound();
                }

                _context.Notes.Remove(note);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Nota con ID {Id} eliminada correctamente", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la nota con ID {Id}", id);
                return StatusCode(500, new { message = $"Error al eliminar la nota: {ex.Message.ToString()}" });
            }
        }
    }
}