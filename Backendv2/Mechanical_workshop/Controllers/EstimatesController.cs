using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EstimatesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public EstimatesController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Estimates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstimateFullDto>>> GetEstimates()
        {
            var estimates = await _context.Estimates
                .Include(e => e.Vehicle)
                    .ThenInclude(v => v.UserWorkshop)
                .Include(e => e.TechnicianDiagnostic)
                    .ThenInclude(td => td.Diagnostic)
                .Include(e => e.Parts)
                .Include(e => e.Labors)
                .Include(e => e.FlatFees)
                .ToListAsync();

            var estimateDtos = _mapper.Map<IEnumerable<EstimateFullDto>>(estimates);
            return Ok(estimateDtos);
        }

        // GET: api/Estimates/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EstimateFullDto>> GetEstimate(int id)
        {
            var estimate = await _context.Estimates
                .Include(e => e.Vehicle)
                    .ThenInclude(v => v.UserWorkshop)
                .Include(e => e.TechnicianDiagnostic)
                    .ThenInclude(td => td.Diagnostic)
                .Include(e => e.Parts)
                .Include(e => e.Labors)
                .Include(e => e.FlatFees)
                .FirstOrDefaultAsync(e => e.ID == id);

            if (estimate == null)
            {
                return NotFound(new { message = $"Estimate with ID {id} not found." });
            }

            var estimateDto = _mapper.Map<EstimateFullDto>(estimate);
            return Ok(estimateDto);
        }

        // POST: api/Estimates
        [HttpPost]
        public async Task<ActionResult<EstimateFullDto>> CreateEstimate(EstimateCreateDto estimateCreateDto)
        {
            // Verificar la existencia del vehículo
            var vehicle = await _context.Vehicles
                .Include(v => v.UserWorkshop)
                .FirstOrDefaultAsync(v => v.Id == estimateCreateDto.VehicleID);

            if (vehicle == null)
            {
                return BadRequest(new { message = "Invalid Vehicle ID." });
            }

            // Mapear el DTO a la entidad Estimate
            var estimate = _mapper.Map<Estimate>(estimateCreateDto);
            estimate.VehicleID = vehicle.Id;
            estimate.UserWorkshopID = vehicle.UserWorkshopId;

            // Manejar TechnicianDiagnostic si está presente en el DTO
            if (estimateCreateDto.TechnicianDiagnostic != null)
            {
                var technicianDiagnostic = _mapper.Map<TechnicianDiagnostic>(estimateCreateDto.TechnicianDiagnostic);
                estimate.TechnicianDiagnostic = technicianDiagnostic;
            }

            _context.Estimates.Add(estimate);
            await _context.SaveChangesAsync();

            // Recuperar la estimación completa para la respuesta
            var createdEstimate = await _context.Estimates
                .Include(e => e.Vehicle)
                    .ThenInclude(v => v.UserWorkshop)
                .Include(e => e.TechnicianDiagnostic)
                    .ThenInclude(td => td.Diagnostic)
                .Include(e => e.Parts)
                .Include(e => e.Labors)
                .Include(e => e.FlatFees)
                .FirstOrDefaultAsync(e => e.ID == estimate.ID);

            var estimateFullDto = _mapper.Map<EstimateFullDto>(createdEstimate);
            return CreatedAtAction(nameof(GetEstimate), new { id = estimate.ID }, estimateFullDto);
        }
        
        // PUT: api/Estimates/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEstimate(int id, [FromBody] EstimateUpdateDto dto)
        {
            if (id != dto.ID)
                return BadRequest(new { message = "ID mismatch." });

            var estimate = await _context.Estimates
                .Include(e => e.TechnicianDiagnostic)
                .Include(e => e.Parts)
                .Include(e => e.Labors)
                .Include(e => e.FlatFees)
                .FirstOrDefaultAsync(e => e.ID == id);

            if (estimate == null)
            {
                return NotFound(new { message = $"Estimate with ID {id} not found." });
            }

            // Actualizar SOLO los campos permitidos
            estimate.CustomerNote = dto.CustomerNote ?? estimate.CustomerNote;
            estimate.Subtotal = dto.Subtotal;
            estimate.Tax = dto.Tax;
            estimate.Total = dto.Total;
            estimate.AuthorizationStatus = dto.AuthorizationStatus;

            // TechnicianDiagnostic
            if (dto.TechnicianDiagnostic == null)
            {
                if (estimate.TechnicianDiagnostic != null)
                {
                    _context.TechnicianDiagnostics.Remove(estimate.TechnicianDiagnostic);
                    estimate.TechnicianDiagnostic = null;
                }
            }
            else
            {
                if (estimate.TechnicianDiagnostic == null)
                {
                    var newDiag = _mapper.Map<TechnicianDiagnostic>(dto.TechnicianDiagnostic);
                    newDiag.Id = 0; // Insertar nueva
                    estimate.TechnicianDiagnostic = newDiag;
                }
                else
                {
                    // Mantener la misma PK para no romper EF
                    dto.TechnicianDiagnostic.ID = estimate.TechnicianDiagnostic.Id;
                    _mapper.Map(dto.TechnicianDiagnostic, estimate.TechnicianDiagnostic);
                }
            }

            // Reemplazar listas de Parts, Labors, FlatFees
            _context.EstimateParts.RemoveRange(estimate.Parts);
            _context.EstimateLabors.RemoveRange(estimate.Labors);
            _context.EstimateFlatFees.RemoveRange(estimate.FlatFees);

            estimate.Parts.Clear();
            estimate.Labors.Clear();
            estimate.FlatFees.Clear();

            if (dto.Parts != null)
            {
                foreach (var partDto in dto.Parts)
                {
                    var partEntity = _mapper.Map<EstimatePart>(partDto);
                    estimate.Parts.Add(partEntity);
                }
            }
            if (dto.Labors != null)
            {
                foreach (var laborDto in dto.Labors)
                {
                    var laborEntity = _mapper.Map<EstimateLabor>(laborDto);
                    estimate.Labors.Add(laborEntity);
                }
            }
            if (dto.FlatFees != null)
            {
                foreach (var feeDto in dto.FlatFees)
                {
                    var feeEntity = _mapper.Map<EstimateFlatFee>(feeDto);
                    estimate.FlatFees.Add(feeEntity);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { message = "Error updating the estimate.", details = ex.Message });
            }

            var updatedDto = _mapper.Map<EstimateFullDto>(estimate);
            return Ok(updatedDto);
        }

        // DELETE: api/Estimates/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEstimate(int id)
        {
            var estimate = await _context.Estimates
                .Include(e => e.TechnicianDiagnostic)
                .Include(e => e.Parts)
                .Include(e => e.Labors)
                .Include(e => e.FlatFees)
                .FirstOrDefaultAsync(e => e.ID == id);

            if (estimate == null)
            {
                return NotFound(new { message = $"Estimate with ID {id} not found." });
            }

            // Eliminar TechnicianDiagnostic si existe
            if (estimate.TechnicianDiagnostic != null)
            {
                _context.TechnicianDiagnostics.Remove(estimate.TechnicianDiagnostic);
            }

            // Eliminar Partes, Mano de Obra y Tarifas Planas
            _context.EstimateParts.RemoveRange(estimate.Parts);
            _context.EstimateLabors.RemoveRange(estimate.Labors);
            _context.EstimateFlatFees.RemoveRange(estimate.FlatFees);
            _context.Estimates.Remove(estimate);

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool EstimateExists(int id)
        {
            return _context.Estimates.Any(e => e.ID == id);
        }

    }
}
