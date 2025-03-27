using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;

namespace Mechanical_workshop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EstimatesSumaryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public EstimatesSumaryController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("GetEstimateData")]
        public IActionResult GetEstimateData()
        {
            // Cargamos los Estimates con sus relaciones
            var estimates = _context.Estimates
                .Include(e => e.Vehicle)
                .Include(e => e.Parts)
                .Include(e => e.Labors)
                .Include(e => e.FlatFees)
                .ToList();

            // Lista final de renglones
            var result = new List<EstimateLineDto>();

            // Recorremos cada Estimate
            foreach (var estimate in estimates)
            {
                // 1) Mapeamos las PARTS a DTO
                var partDtos = _mapper.Map<List<EstimateLineDto>>(estimate.Parts);
                // A cada DTO le asignamos el VIN (porque lo ignoramos en el map)
                foreach (var dto in partDtos)
                {
                    dto.Vin = estimate.Vehicle.Vin;
                    result.Add(dto);
                }

                // 2) Mapeamos las LABORS a DTO
                var laborDtos = _mapper.Map<List<EstimateLineDto>>(estimate.Labors);
                foreach (var dto in laborDtos)
                {
                    dto.Vin = estimate.Vehicle.Vin;
                    result.Add(dto);
                }

                // 3) Mapeamos los FLAT FEES a DTO
                var feeDtos = _mapper.Map<List<EstimateLineDto>>(estimate.FlatFees);
                foreach (var dto in feeDtos)
                {
                    dto.Vin = estimate.Vehicle.Vin;
                    result.Add(dto);
                }
            }

            return Ok(result);
        }
    }
}
