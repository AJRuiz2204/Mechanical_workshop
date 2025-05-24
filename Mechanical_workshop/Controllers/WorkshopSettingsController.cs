// Controllers/WorkshopSettingsController.cs

using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.DTOs;
using Mechanical_workshop.Models;
using Microsoft.Extensions.Logging;

namespace Mechanical_workshop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkshopSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<WorkshopSettingsController> _logger;

        public WorkshopSettingsController(AppDbContext context, IMapper mapper, ILogger<WorkshopSettingsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
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
                    _logger.LogWarning("No se encontraron configuraciones del taller");
                    return NotFound(new { message = "Workshop settings not found." });
                }

                return Ok(_mapper.Map<WorkshopSettingsReadDto>(settings));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la configuración del taller");
                return StatusCode(500, new { message = $"Error al obtener la configuración del taller: {ex.Message.ToString()}" });
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

                _logger.LogInformation("Configuración del taller creada con ID: {Id}", workshopSettings.Id);
                return CreatedAtAction(nameof(GetWorkshopSettings), new { id = workshopSettings.Id }, workshopSettingsReadDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la configuración del taller");
                return StatusCode(500, new { message = $"Error al crear la configuración del taller: {ex.Message.ToString()}" });
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
                    _logger.LogWarning("No se encontró configuración del taller con ID: {Id}", id);
                    return NotFound(new { message = "Workshop settings not found." });
                }

                _mapper.Map(workshopSettingsUpdateDto, workshopSettings);
                workshopSettings.LastUpdated = DateTime.UtcNow;

                _context.Entry(workshopSettings).State = EntityState.Modified;

                await _context.SaveChangesAsync();
                _logger.LogInformation("Configuración del taller actualizada con ID: {Id}", id);
                return NoContent();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!WorkshopSettingsExists(id))
                {
                    _logger.LogWarning("Configuración del taller con ID: {Id} no encontrada durante actualización", id);
                    return NotFound(new { message = "Workshop settings not found." });
                }
                else
                {
                    _logger.LogError(ex, "Error de concurrencia al actualizar la configuración del taller con ID: {Id}", id);
                    return StatusCode(500, new { message = $"Error de concurrencia al actualizar la configuración del taller: {ex.Message.ToString()}" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la configuración del taller con ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al actualizar la configuración del taller: {ex.Message.ToString()}" });
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
                    _logger.LogWarning("Intento de eliminar una configuración de taller inexistente con ID: {Id}", id);
                    return NotFound(new { message = "Workshop settings not found." });
                }

                _context.WorkshopSettings.Remove(workshopSettings);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Configuración del taller eliminada con ID: {Id}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la configuración del taller con ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al eliminar la configuración del taller: {ex.Message.ToString()}" });
            }
        }

        private bool WorkshopSettingsExists(int id)
        {
            return _context.WorkshopSettings.Any(e => e.Id == id);
        }
    }
}
