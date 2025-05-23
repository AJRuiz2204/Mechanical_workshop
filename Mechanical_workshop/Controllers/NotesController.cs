using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;
using static Mechanical_workshop.Dtos.NoteDto;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public NotesController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
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
                return StatusCode(500, new { message = $"Error al obtener las notas del diagnóstico: {ex.Message}" });
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
                    return NotFound(new { message = "No notes found for Technician Diagnostic ID." });
                }

                return Ok(_mapper.Map<IEnumerable<NoteReadDto>>(notes));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener las notas del diagnóstico técnico: {ex.Message}" });
            }
        }


        // GET: api/notes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<NoteReadDto>> GetNote(int id)
        {
            try
            {
                var note = await _context.Notes.FindAsync(id);
                if (note == null) return NotFound();

                return Ok(_mapper.Map<NoteReadDto>(note));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener la nota: {ex.Message}" });
            }
        }

        // POST: api/notes
        [HttpPost]
        public async Task<ActionResult<NoteReadDto>> CreateNote(NoteCreateDto dto)
        {
            try
            {
                var diagnostic = await _context.Diagnostics.FindAsync(dto.DiagnosticId);
                if (diagnostic == null) return BadRequest("Invalid Diagnostic ID");

                var note = _mapper.Map<Note>(dto);
                _context.Notes.Add(note);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetNote),
                    new { id = note.Id },
                    _mapper.Map<NoteReadDto>(note));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al crear la nota: {ex.Message}" });
            }
        }

        // PUT: api/notes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, NoteUpdateDto dto)
        {
            try
            {
                var note = await _context.Notes.FindAsync(id);
                if (note == null) return NotFound();

                _mapper.Map(dto, note);
                note.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al actualizar la nota: {ex.Message}" });
            }
        }

        // DELETE: api/notes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            try
            {
                var note = await _context.Notes.FindAsync(id);
                if (note == null) return NotFound();

                _context.Notes.Remove(note);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al eliminar la nota: {ex.Message}" });
            }
        }
    }
}