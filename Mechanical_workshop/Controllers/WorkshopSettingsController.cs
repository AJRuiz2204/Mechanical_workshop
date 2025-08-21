// Controllers/WorkshopSettingsController.cs

using Microsoft.AspNetCore.Mvc;
using Mechanical_workshop.DTOs;
using Mechanical_workshop.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace Mechanical_workshop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkshopSettingsController : ControllerBase
    {
        private readonly IWorkshopSettingsService _workshopSettingsService;
        private readonly ILogger<WorkshopSettingsController> _logger;

        public WorkshopSettingsController(IWorkshopSettingsService workshopSettingsService, ILogger<WorkshopSettingsController> logger)
        {
            _workshopSettingsService = workshopSettingsService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<WorkshopSettingsReadDto>> GetWorkshopSettings()
        {
            try
            {
                var settings = await _workshopSettingsService.GetWorkshopSettingsAsync();
                if (settings == null)
                {
                    return NotFound(new { message = "Workshop settings not found." });
                }

                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la configuración del taller");
                return StatusCode(500, new { message = $"Error al obtener la configuración del taller: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<WorkshopSettingsReadDto>> CreateWorkshopSettings(WorkshopSettingsCreateDto workshopSettingsCreateDto)
        {
            try
            {
                var result = await _workshopSettingsService.CreateWorkshopSettingsAsync(workshopSettingsCreateDto);
                return CreatedAtAction(nameof(GetWorkshopSettings), new { }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la configuración del taller");
                return StatusCode(500, new { message = $"Error al crear la configuración del taller: {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkshopSettings(int id, WorkshopSettingsUpdateDto workshopSettingsUpdateDto)
        {
            try
            {
                var success = await _workshopSettingsService.UpdateWorkshopSettingsAsync(id, workshopSettingsUpdateDto);
                if (!success)
                {
                    return NotFound(new { message = "Workshop settings not found." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la configuración del taller con ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al actualizar la configuración del taller: {ex.Message}" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkshopSettings(int id)
        {
            try
            {
                var success = await _workshopSettingsService.DeleteWorkshopSettingsAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "Workshop settings not found." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la configuración del taller con ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al eliminar la configuración del taller: {ex.Message}" });
            }
        }
    }
}
