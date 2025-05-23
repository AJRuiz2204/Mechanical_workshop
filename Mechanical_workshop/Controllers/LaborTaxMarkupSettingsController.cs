using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.JsonPatch;
using AutoMapper;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Mechanical_workshop.Data;
using Mechanical_workshop.Models;
using Mechanical_workshop.DTOs;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LaborTaxMarkupSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public LaborTaxMarkupSettingsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // POST: api/LaborTaxMarkupSettings
        [HttpPost]
        public async Task<ActionResult<LaborTaxMarkupSettingsReadDto>> Create(LaborTaxMarkupSettingsCreateDto createDto)
        {
            try
            {
                var entity = _mapper.Map<LaborTaxMarkupSettings>(createDto);
                _context.LaborTaxMarkupSettings.Add(entity);
                await _context.SaveChangesAsync();
                var readDto = _mapper.Map<LaborTaxMarkupSettingsReadDto>(entity);
                return CreatedAtAction(nameof(GetById), new { id = entity.Id }, readDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al crear la configuración: {ex.Message}" });
            }
        }

        // GET: api/LaborTaxMarkupSettings/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<LaborTaxMarkupSettingsReadDto>> GetById(int id)
        {
            try
            {
                var entity = await _context.LaborTaxMarkupSettings.FindAsync(id);
                if (entity == null)
                    return NotFound();
                var dto = _mapper.Map<LaborTaxMarkupSettingsReadDto>(entity);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener la configuración: {ex.Message}" });
            }
        }

        // PATCH: api/LaborTaxMarkupSettings/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, [FromBody] JsonPatchDocument<LaborTaxMarkupSettingsUpdateDto> patchDoc)
        {
            try
            {
                if (patchDoc == null)
                    return BadRequest("Patch document cannot be null.");
                var entity = await _context.LaborTaxMarkupSettings.FindAsync(id);
                if (entity == null)
                    return NotFound();
                var updateDto = _mapper.Map<LaborTaxMarkupSettingsUpdateDto>(entity);
                patchDoc.ApplyTo(updateDto);
                if (!TryValidateModel(updateDto))
                    return ValidationProblem(ModelState);
                _mapper.Map(updateDto, entity);
                _context.Entry(entity).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al actualizar la configuración: {ex.Message}" });
            }
        }
    }
}
