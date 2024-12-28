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
                return NotFound(new { message = $"No se encontró el Estimate con ID {id}." });
            }

            var estimateDto = _mapper.Map<EstimateFullDto>(estimate);
            return Ok(estimateDto);
        }

        // POST: api/Estimates
        [HttpPost]
        public async Task<ActionResult<EstimateFullDto>> CreateEstimate(EstimateCreateDto estimateCreateDto)
        {
            // Validar que el VehicleID exista
            var vehicle = await _context.Vehicles
                                        .Include(v => v.UserWorkshop)
                                        .FirstOrDefaultAsync(v => v.Id == estimateCreateDto.VehicleID);

            if (vehicle == null)
            {
                return BadRequest(new { message = "Vehicle ID no válido." });
            }

            // Crear el Estimate
            var estimate = _mapper.Map<Estimate>(estimateCreateDto);
            estimate.VehicleID = vehicle.Id;
            estimate.UserWorkshopID = vehicle.UserWorkshopId;

            // Agregar Partes
            foreach (var partDto in estimateCreateDto.Parts)
            {
                var part = _mapper.Map<EstimatePart>(partDto);
                part.EstimateID = estimate.ID;
                estimate.Parts.Add(part);
            }

            // Agregar Mano de Obra
            foreach (var laborDto in estimateCreateDto.Labors)
            {
                var labor = _mapper.Map<EstimateLabor>(laborDto);
                labor.EstimateID = estimate.ID;
                estimate.Labors.Add(labor);
            }

            // Agregar Tarifas Planas
            foreach (var flatFeeDto in estimateCreateDto.FlatFees)
            {
                var flatFee = _mapper.Map<EstimateFlatFee>(flatFeeDto);
                flatFee.EstimateID = estimate.ID;
                estimate.FlatFees.Add(flatFee);
            }

            _context.Estimates.Add(estimate);
            await _context.SaveChangesAsync();

            // Recuperar el Estimate creado con todas las relaciones
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
                return NotFound(new { message = $"No se encontró el Estimate con ID {id}." });
            }

            // Actualizar campos principales del Estimate
            estimate.Date = estimateFullDto.Date;
            estimate.CustomerNote = estimateFullDto.CustomerNote;
            estimate.ExtendedDiagnostic = estimateFullDto.ExtendedDiagnostic;
            estimate.Subtotal = estimateFullDto.Subtotal;
            estimate.Tax = estimateFullDto.Tax;
            estimate.Total = estimateFullDto.Total;

            // Manejar Partes
            // 1. Eliminar partes que ya no existen
            var partsToRemove = estimate.Parts
                .Where(p => !estimateFullDto.Parts.Any(dto => dto.ID == p.ID))
                .ToList();

            foreach (var part in partsToRemove)
            {
                _context.EstimateParts.Remove(part);
            }

            // 2. Agregar o actualizar partes
            foreach (var partDto in estimateFullDto.Parts)
            {
                if (partDto.ID == 0)
                {
                    // Nueva parte
                    var newPart = _mapper.Map<EstimatePart>(partDto);
                    newPart.EstimateID = estimate.ID;
                    estimate.Parts.Add(newPart);
                }
                else
                {
                    // Parte existente, actualizar
                    var existingPart = estimate.Parts.FirstOrDefault(p => p.ID == partDto.ID);
                    if (existingPart != null)
                    {
                        _mapper.Map(partDto, existingPart);
                    }
                }
            }

            // Manejar Mano de Obra
            // 1. Eliminar mano de obra que ya no existe
            var laborsToRemove = estimate.Labors
                .Where(l => !estimateFullDto.Labors.Any(dto => dto.ID == l.ID))
                .ToList();

            foreach (var labor in laborsToRemove)
            {
                _context.EstimateLabors.Remove(labor);
            }

            // 2. Agregar o actualizar mano de obra
            foreach (var laborDto in estimateFullDto.Labors)
            {
                if (laborDto.ID == 0)
                {
                    // Nueva mano de obra
                    var newLabor = _mapper.Map<EstimateLabor>(laborDto);
                    newLabor.EstimateID = estimate.ID;
                    estimate.Labors.Add(newLabor);
                }
                else
                {
                    // Mano de obra existente, actualizar
                    var existingLabor = estimate.Labors.FirstOrDefault(l => l.ID == laborDto.ID);
                    if (existingLabor != null)
                    {
                        _mapper.Map(laborDto, existingLabor);
                    }
                }
            }

            // Manejar Tarifas Planas
            // 1. Eliminar tarifas planas que ya no existen
            var flatFeesToRemove = estimate.FlatFees
                .Where(f => !estimateFullDto.FlatFees.Any(dto => dto.ID == f.ID))
                .ToList();

            foreach (var fee in flatFeesToRemove)
            {
                _context.EstimateFlatFees.Remove(fee);
            }

            // 2. Agregar o actualizar tarifas planas
            foreach (var flatFeeDto in estimateFullDto.FlatFees)
            {
                if (flatFeeDto.ID == 0)
                {
                    // Nueva tarifa plana
                    var newFlatFee = _mapper.Map<EstimateFlatFee>(flatFeeDto);
                    newFlatFee.EstimateID = estimate.ID;
                    estimate.FlatFees.Add(newFlatFee);
                }
                else
                {
                    // Tarifa plana existente, actualizar
                    var existingFlatFee = estimate.FlatFees.FirstOrDefault(f => f.ID == flatFeeDto.ID);
                    if (existingFlatFee != null)
                    {
                        _mapper.Map(flatFeeDto, existingFlatFee);
                    }
                }
            }

            // Validar y guardar cambios
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EstimateExists(id))
                {
                    return NotFound(new { message = $"No se encontró el Estimate con ID {id}." });
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
                return NotFound(new { message = $"No se encontró el Estimate con ID {id}." });
            }

            // Eliminar ítems relacionados
            _context.EstimateParts.RemoveRange(estimate.Parts);
            _context.EstimateLabors.RemoveRange(estimate.Labors);
            _context.EstimateFlatFees.RemoveRange(estimate.FlatFees);

            // Eliminar el Estimate
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
