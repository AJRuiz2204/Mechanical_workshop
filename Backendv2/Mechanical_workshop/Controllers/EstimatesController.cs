// Controllers/EstimatesController.cs

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
            // Validate that the VehicleID exists
            var vehicle = await _context.Vehicles
                                        .Include(v => v.UserWorkshop)
                                        .FirstOrDefaultAsync(v => v.Id == estimateCreateDto.VehicleID);

            if (vehicle == null)
            {
                return BadRequest(new { message = "Invalid Vehicle ID." });
            }

            // Create the Estimate
            var estimate = _mapper.Map<Estimate>(estimateCreateDto);
            estimate.VehicleID = vehicle.Id;
            estimate.UserWorkshopID = vehicle.UserWorkshopId;

            // Add Parts
            foreach (var partDto in estimateCreateDto.Parts)
            {
                var part = _mapper.Map<EstimatePart>(partDto);
                part.EstimateID = estimate.ID;
                estimate.Parts.Add(part);
            }

            // Add Labors
            foreach (var laborDto in estimateCreateDto.Labors)
            {
                var labor = _mapper.Map<EstimateLabor>(laborDto);
                labor.EstimateID = estimate.ID;
                estimate.Labors.Add(labor);
            }

            // Add Flat Fees
            foreach (var flatFeeDto in estimateCreateDto.FlatFees)
            {
                var flatFee = _mapper.Map<EstimateFlatFee>(flatFeeDto);
                flatFee.EstimateID = estimate.ID;
                estimate.FlatFees.Add(flatFee);
            }

            _context.Estimates.Add(estimate);
            await _context.SaveChangesAsync();

            // Retrieve the created Estimate with all relationships
            var createdEstimate = await _context.Estimates
                .Include(e => e.Vehicle)
                    .ThenInclude(v => v.UserWorkshop)
                .Include(e => e.Parts)
                .Include(e => e.Labors)
                .Include(e => e.FlatFees)
                .FirstOrDefaultAsync(e => e.ID == estimate.ID);

            var estimateFullDto = _mapper.Map<EstimateFullDto>(createdEstimate);

            return CreatedAtAction(nameof(GetEstimate), new { id = estimate.ID }, estimateFullDto);
        }

        // PUT: api/Estimates/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEstimate(int id, EstimateFullDto estimateFullDto)
        {
            if (id != estimateFullDto.ID)
            {
                return BadRequest(new { message = "ID mismatch." });
            }

            var estimate = await _context.Estimates
                .Include(e => e.Parts)
                .Include(e => e.Labors)
                .Include(e => e.FlatFees)
                .FirstOrDefaultAsync(e => e.ID == id);

            if (estimate == null)
            {
                return NotFound(new { message = $"Estimate with ID {id} not found." });
            }

            // Update main fields of the Estimate
            estimate.Date = estimateFullDto.Date;
            estimate.CustomerNote = estimateFullDto.CustomerNote;
            estimate.ExtendedDiagnostic = estimateFullDto.ExtendedDiagnostic;
            estimate.Subtotal = estimateFullDto.Subtotal;
            estimate.Tax = estimateFullDto.Tax;
            estimate.Total = estimateFullDto.Total;

            // Handle Parts
            // 1. Remove parts that no longer exist
            var partsToRemove = estimate.Parts
                .Where(p => !estimateFullDto.Parts.Any(dto => dto.ID == p.ID))
                .ToList();

            foreach (var part in partsToRemove)
            {
                _context.EstimateParts.Remove(part);
            }

            // 2. Add or update parts
            foreach (var partDto in estimateFullDto.Parts)
            {
                if (partDto.ID == 0)
                {
                    // New part
                    var newPart = _mapper.Map<EstimatePart>(partDto);
                    newPart.EstimateID = estimate.ID;
                    estimate.Parts.Add(newPart);
                }
                else
                {
                    // Existing part, update
                    var existingPart = estimate.Parts.FirstOrDefault(p => p.ID == partDto.ID);
                    if (existingPart != null)
                    {
                        _mapper.Map(partDto, existingPart);
                    }
                }
            }

            // Handle Labors
            // 1. Remove labors that no longer exist
            var laborsToRemove = estimate.Labors
                .Where(l => !estimateFullDto.Labors.Any(dto => dto.ID == l.ID))
                .ToList();

            foreach (var labor in laborsToRemove)
            {
                _context.EstimateLabors.Remove(labor);
            }

            // 2. Add or update labors
            foreach (var laborDto in estimateFullDto.Labors)
            {
                if (laborDto.ID == 0)
                {
                    // New labor
                    var newLabor = _mapper.Map<EstimateLabor>(laborDto);
                    newLabor.EstimateID = estimate.ID;
                    estimate.Labors.Add(newLabor);
                }
                else
                {
                    // Existing labor, update
                    var existingLabor = estimate.Labors.FirstOrDefault(l => l.ID == laborDto.ID);
                    if (existingLabor != null)
                    {
                        _mapper.Map(laborDto, existingLabor);
                    }
                }
            }

            // Handle Flat Fees
            // 1. Remove flat fees that no longer exist
            var flatFeesToRemove = estimate.FlatFees
                .Where(f => !estimateFullDto.FlatFees.Any(dto => dto.ID == f.ID))
                .ToList();

            foreach (var fee in flatFeesToRemove)
            {
                _context.EstimateFlatFees.Remove(fee);
            }

            // 2. Add or update flat fees
            foreach (var flatFeeDto in estimateFullDto.FlatFees)
            {
                if (flatFeeDto.ID == 0)
                {
                    // New flat fee
                    var newFlatFee = _mapper.Map<EstimateFlatFee>(flatFeeDto);
                    newFlatFee.EstimateID = estimate.ID;
                    estimate.FlatFees.Add(newFlatFee);
                }
                else
                {
                    // Existing flat fee, update
                    var existingFlatFee = estimate.FlatFees.FirstOrDefault(f => f.ID == flatFeeDto.ID);
                    if (existingFlatFee != null)
                    {
                        _mapper.Map(flatFeeDto, existingFlatFee);
                    }
                }
            }

            // Validate and save changes
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EstimateExists(id))
                {
                    return NotFound(new { message = $"Estimate with ID {id} not found." });
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Estimates/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEstimate(int id)
        {
            var estimate = await _context.Estimates
                .Include(e => e.Parts)
                .Include(e => e.Labors)
                .Include(e => e.FlatFees)
                .FirstOrDefaultAsync(e => e.ID == id);

            if (estimate == null)
            {
                return NotFound(new { message = $"Estimate with ID {id} not found." });
            }

            // Remove related items
            _context.EstimateParts.RemoveRange(estimate.Parts);
            _context.EstimateLabors.RemoveRange(estimate.Labors);
            _context.EstimateFlatFees.RemoveRange(estimate.FlatFees);

            // Remove the Estimate
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
