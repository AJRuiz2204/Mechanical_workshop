// Controllers/WorkshopSettingsController.cs

using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.DTOs;
using Mechanical_workshop.Models;

namespace Mechanical_workshop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkshopSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public WorkshopSettingsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }


        [HttpGet]
        public async Task<ActionResult<WorkshopSettingsReadDto>> GetWorkshopSettings()
        {
            var settings = await _context.WorkshopSettings
                .OrderByDescending(ws => ws.LastUpdated)
                .FirstOrDefaultAsync();

            if (settings == null)
            {
                return NotFound(new { message = "Workshop settings not found." });
            }

            return Ok(_mapper.Map<WorkshopSettingsReadDto>(settings));
        }

        [HttpPost]
        public async Task<ActionResult<WorkshopSettingsReadDto>> CreateWorkshopSettings(WorkshopSettingsCreateDto workshopSettingsCreateDto)
        {
            var workshopSettings = _mapper.Map<WorkshopSettings>(workshopSettingsCreateDto);
            workshopSettings.LastUpdated = DateTime.UtcNow;

            _context.WorkshopSettings.Add(workshopSettings);
            await _context.SaveChangesAsync();

            var workshopSettingsReadDto = _mapper.Map<WorkshopSettingsReadDto>(workshopSettings);

            return CreatedAtAction(nameof(GetWorkshopSettings), new { id = workshopSettings.Id }, workshopSettingsReadDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkshopSettings(int id, WorkshopSettingsUpdateDto workshopSettingsUpdateDto)
        {
            var workshopSettings = await _context.WorkshopSettings.FindAsync(id);
            if (workshopSettings == null)
            {
                return NotFound(new { message = "Workshop settings not found." });
            }

            _mapper.Map(workshopSettingsUpdateDto, workshopSettings);
            workshopSettings.LastUpdated = DateTime.UtcNow;

            _context.Entry(workshopSettings).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkshopSettingsExists(id))
                {
                    return NotFound(new { message = "Workshop settings not found." });
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkshopSettings(int id)
        {
            var workshopSettings = await _context.WorkshopSettings.FindAsync(id);
            if (workshopSettings == null)
            {
                return NotFound(new { message = "Workshop settings not found." });
            }

            _context.WorkshopSettings.Remove(workshopSettings);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool WorkshopSettingsExists(int id)
        {
            return _context.WorkshopSettings.Any(e => e.Id == id);
        }
    }
}
