using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EstimatesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<EstimatesController> _logger;

        public EstimatesController(AppDbContext context, IMapper mapper, ILogger<EstimatesController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/Estimates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstimateFullDto>>> GetEstimates()
        {
            try
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving estimates");
                return StatusCode(500, new { message = $"Error al obtener los presupuestos: {ex.ToString()}" });
            }
        }

        // GET: api/Estimates/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EstimateFullDto>> GetEstimate(int id)
        {
            try
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
                    _logger.LogWarning("Estimate with ID {Id} not found", id);
                    return NotFound(new { message = $"Estimate with ID {id} not found." });
                }

                var estimateDto = _mapper.Map<EstimateFullDto>(estimate);
                return Ok(estimateDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving estimate with ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al obtener el presupuesto: {ex.ToString()}" });
            }
        }

        // GET: api/Estimates/WithUserWorkshop/{id}
        [HttpGet("WithUserWorkshop/{id}")]
        public async Task<ActionResult<EstimateFullDto>> GetEstimateWithUserWorkshop(int id)
        {
            try
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
                    _logger.LogWarning("Estimate with ID {Id} not found when retrieving with user workshop", id);
                    return NotFound(new { message = $"Estimate with ID {id} not found." });
                }

                var estimateDto = _mapper.Map<EstimateFullDto>(estimate);
                return Ok(estimateDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving estimate with user workshop, ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al obtener el presupuesto con información del cliente: {ex.ToString()}" });
            }
        }

        // POST: api/Estimates
        [HttpPost]
        public async Task<ActionResult<EstimateFullDto>> CreateEstimate(EstimateCreateDto estimateCreateDto)
        {
            try
            {
                _logger.LogInformation("Received estimate creation request: {@EstimateData}", estimateCreateDto);

                // Validate model state
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(x => x.Value.Errors.Count > 0)
                        .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) })
                        .ToList();

                    _logger.LogWarning("Model validation failed: {@ValidationErrors}", errors);
                    return BadRequest(new { message = "Validation failed", errors = errors });
                }

                // Verificar la existencia del vehículo
                var vehicle = await _context.Vehicles
                    .Include(v => v.UserWorkshop)
                    .FirstOrDefaultAsync(v => v.Id == estimateCreateDto.VehicleID);

                if (vehicle == null)
                {
                    _logger.LogWarning("Attempt to create estimate with invalid Vehicle ID: {VehicleId}", estimateCreateDto.VehicleID);
                    return BadRequest(new { message = "Invalid Vehicle ID." });
                }

                // Additional validation for decimal values
                if (estimateCreateDto.Subtotal < 0 || estimateCreateDto.Tax < 0 || estimateCreateDto.Total < 0)
                {
                    _logger.LogWarning("Invalid negative values in estimate: Subtotal={Subtotal}, Tax={Tax}, Total={Total}",
                        estimateCreateDto.Subtotal, estimateCreateDto.Tax, estimateCreateDto.Total);
                    return BadRequest(new { message = "Subtotal, Tax, and Total cannot be negative." });
                }

                // Validate parts
                foreach (var part in estimateCreateDto.Parts)
                {
                    if (part.Quantity <= 0)
                    {
                        return BadRequest(new { message = $"Part '{part.Description}' must have quantity greater than 0." });
                    }
                    if (part.NetPrice < 0 || part.ListPrice < 0 || part.ExtendedPrice < 0)
                    {
                        return BadRequest(new { message = $"Part '{part.Description}' cannot have negative prices." });
                    }
                }

                // Validate labors
                foreach (var labor in estimateCreateDto.Labors)
                {
                    if (labor.Duration <= 0)
                    {
                        return BadRequest(new { message = $"Labor '{labor.Description}' must have duration greater than 0." });
                    }
                    if (labor.LaborRate < 0 || labor.ExtendedPrice < 0)
                    {
                        return BadRequest(new { message = $"Labor '{labor.Description}' cannot have negative rates or prices." });
                    }
                }

                // Validate flat fees
                foreach (var fee in estimateCreateDto.FlatFees)
                {
                    if (fee.FlatFeePrice < 0 || fee.ExtendedPrice < 0)
                    {
                        return BadRequest(new { message = $"Flat fee '{fee.Description}' cannot have negative prices." });
                    }
                }

                // Mapear el DTO a la entidad Estimate
                var estimate = _mapper.Map<Estimate>(estimateCreateDto);
                estimate.VehicleID = vehicle.Id;
                estimate.UserWorkshopID = vehicle.UserWorkshopId;
                // Excluir TechnicianDiagnostic para evitar creación automática
                estimate.TechnicianDiagnostic = null;
                // Asegurar que el FK quede NULL y no 0
                estimate.TechnicianDiagnosticID = null;

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
                _logger.LogInformation("Successfully created estimate with ID: {EstimateId}", estimate.ID);
                return CreatedAtAction(nameof(GetEstimate), new { id = estimate.ID }, estimateFullDto);
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error creating estimate");
                return StatusCode(500, new { message = "Database error creating estimate", details = dbEx.InnerException?.Message ?? dbEx.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating estimate");
                return StatusCode(500, new { message = $"Error al crear el presupuesto: {ex.Message}" });
            }
        }

        // PUT: api/Estimates/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEstimate(int id, [FromBody] EstimateUpdateDto dto)
        {
            try
            {
                if (id != dto.ID)
                {
                    _logger.LogWarning("ID mismatch in update estimate request. Path ID: {PathId}, DTO ID: {DtoId}", id, dto.ID);
                    return BadRequest(new { message = "ID mismatch." });
                }

                var estimate = await _context.Estimates
                    .Include(e => e.TechnicianDiagnostic)
                    .Include(e => e.Parts)
                    .Include(e => e.Labors)
                    .Include(e => e.FlatFees)
                    .FirstOrDefaultAsync(e => e.ID == id);

                if (estimate == null)
                {
                    _logger.LogWarning("Estimate with ID {Id} not found for update", id);
                    return NotFound(new { message = $"Estimate with ID {id} not found." });
                }

                // Actualizar SOLO los campos permitidos
                estimate.CustomerNote = dto.CustomerNote ?? estimate.CustomerNote;
                estimate.Subtotal = dto.Subtotal;
                estimate.Tax = dto.Tax;
                estimate.Total = dto.Total;
                estimate.AuthorizationStatus = dto.AuthorizationStatus;
                estimate.Mileage = dto.Mileage;
                estimate.ExtendedDiagnostic = dto.ExtendedDiagnostic ?? estimate.ExtendedDiagnostic;

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

                await _context.SaveChangesAsync();

                var updatedDto = _mapper.Map<EstimateFullDto>(estimate);
                return Ok(updatedDto);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error updating estimate with ID: {Id}", id);
                return StatusCode(500, new { message = "Error updating the estimate.", details = ex.ToString() });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating estimate with ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al actualizar el presupuesto: {ex.ToString()}" });
            }
        }

        // DELETE: api/Estimates/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEstimate(int id)
        {
            try
            {
                var estimate = await _context.Estimates
                    .Include(e => e.TechnicianDiagnostic)
                    .Include(e => e.Parts)
                    .Include(e => e.Labors)
                    .Include(e => e.FlatFees)
                    .FirstOrDefaultAsync(e => e.ID == id);

                if (estimate == null)
                {
                    _logger.LogWarning("Attempt to delete non-existent estimate with ID: {Id}", id);
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting estimate with ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al eliminar el presupuesto: {ex.ToString()}" });
            }
        }

        private bool EstimateExists(int id)
        {
            try
            {
                return _context.Estimates.Any(e => e.ID == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if estimate exists with ID: {Id}", id);
                throw;
            }
        }
    }
}
