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
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener la configuración del taller: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<WorkshopSettingsReadDto>> CreateWorkshopSettings(WorkshopSettingsCreateDto workshopSettingsCreateDto)
        {
            try
            {
                var workshopSettings = _mapper.Map<WorkshopSettings>(workshopSettingsCreateDto);
                workshopSettings.LastUpdated = DateTime.UtcNow;

                _context.WorkshopSettings.Add(workshopSettings);
                await _context.SaveChangesAsync();

                var workshopSettingsReadDto = _mapper.Map<WorkshopSettingsReadDto>(workshopSettings);

                return CreatedAtAction(nameof(GetWorkshopSettings), new { id = workshopSettings.Id }, workshopSettingsReadDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al crear la configuración del taller: {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkshopSettings(int id, WorkshopSettingsUpdateDto workshopSettingsUpdateDto)
        {
            try
            {
                var workshopSettings = await _context.WorkshopSettings.FindAsync(id);
                if (workshopSettings == null)
                {
                    return NotFound(new { message = "Workshop settings not found." });
                }

                _mapper.Map(workshopSettingsUpdateDto, workshopSettings);
                workshopSettings.LastUpdated = DateTime.UtcNow;

                _context.Entry(workshopSettings).State = EntityState.Modified;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkshopSettingsExists(id))
                {
                    return NotFound(new { message = "Workshop settings not found." });
                }
                else
                {
                    return StatusCode(500, new { message = "Error de concurrencia al actualizar la configuración del taller." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al actualizar la configuración del taller: {ex.Message}" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkshopSettings(int id)
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al eliminar la configuración del taller: {ex.Message}" });
            }
        }

        private bool WorkshopSettingsExists(int id)
        {
            return _context.WorkshopSettings.Any(e => e.Id == id);
        }
    }
}
