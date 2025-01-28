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

        // GET: api/notes/techniciandiagnostic/5
        [HttpGet("techniciandiagnostic/{techDiagId}")]
        public async Task<ActionResult<IEnumerable<NoteReadDto>>> GetNotesByTechDiag(int techDiagId)
        {
            var notes = await _context.Notes
                .Where(n => n.TechnicianDiagnosticId == techDiagId)
                .ToListAsync();

            return Ok(_mapper.Map<IEnumerable<NoteReadDto>>(notes));
        }

        // GET: api/notes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<NoteReadDto>> GetNote(int id)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null) return NotFound();

            return Ok(_mapper.Map<NoteReadDto>(note));
        }

        // POST: api/notes
        [HttpPost]
        public async Task<ActionResult<NoteReadDto>> CreateNote(NoteCreateDto dto)
        {
            // Validate TechnicianDiagnostic exists
            var techDiag = await _context.TechnicianDiagnostics.FindAsync(dto.TechnicianDiagnosticId);
            if (techDiag == null) return BadRequest("Invalid Technician Diagnostic ID");

            var note = _mapper.Map<Note>(dto);
            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNote),
                new { id = note.Id },
                _mapper.Map<NoteReadDto>(note));
        }

        // PUT: api/notes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, NoteUpdateDto dto)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null) return NotFound();

            _mapper.Map(dto, note);
            note.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/notes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null) return NotFound();

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}