using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using Microsoft.Extensions.Logging;

namespace Mechanical_workshop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EstimatesSumaryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<EstimatesSumaryController> _logger;

        public EstimatesSumaryController(AppDbContext context, IMapper mapper, ILogger<EstimatesSumaryController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet("GetEstimateData")]
        public IActionResult GetEstimateData()
        {
            try
            {

                var estimates = _context.Estimates
                    .Include(e => e.Vehicle)
                    .Include(e => e.Parts)
                    .Include(e => e.Labors)
                    .Include(e => e.FlatFees)
                    .ToList();


                var result = new List<EstimateLineDto>();


                foreach (var estimate in estimates)
                {

                    var partDtos = _mapper.Map<List<EstimateLineDto>>(estimate.Parts);

                    foreach (var dto in partDtos)
                    {
                        dto.Vin = estimate.Vehicle.Vin;
                        result.Add(dto);
                    }


                    var laborDtos = _mapper.Map<List<EstimateLineDto>>(estimate.Labors);
                    foreach (var dto in laborDtos)
                    {
                        dto.Vin = estimate.Vehicle.Vin;
                        result.Add(dto);
                    }


                    var feeDtos = _mapper.Map<List<EstimateLineDto>>(estimate.FlatFees);
                    foreach (var dto in feeDtos)
                    {
                        dto.Vin = estimate.Vehicle.Vin;
                        result.Add(dto);
                    }
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving estimate summary data");
                return StatusCode(500, new { message = $"Error al obtener los datos del resumen: {ex.ToString()}" });
            }
        }
    }
}
