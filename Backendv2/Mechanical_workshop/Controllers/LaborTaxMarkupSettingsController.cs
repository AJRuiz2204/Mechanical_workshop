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
            var entity = _mapper.Map<PartLaborSettings>(createDto);
            _context.PartLaborSettings.Add(entity);
            await _context.SaveChangesAsync();
            var readDto = _mapper.Map<LaborTaxMarkupSettingsReadDto>(entity);
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, readDto);
        }

        // GET: api/LaborTaxMarkupSettings/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<LaborTaxMarkupSettingsReadDto>> GetById(int id)
        {
            var entity = await _context.PartLaborSettings.FindAsync(id);
            if (entity == null)
                return NotFound();
            var dto = _mapper.Map<LaborTaxMarkupSettingsReadDto>(entity);
            return Ok(dto);
        }

        // PATCH: api/LaborTaxMarkupSettings/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, [FromBody] JsonPatchDocument<LaborTaxMarkupSettingsUpdateDto> patchDoc)
        {
            if (patchDoc == null)
                return BadRequest("Patch document cannot be null.");
            var entity = await _context.PartLaborSettings.FindAsync(id);
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

        // PUT, DELETE, etc. si deseas
    }

}
