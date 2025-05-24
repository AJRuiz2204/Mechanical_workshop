using AutoMapper;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesReportController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<SalesReportController> _logger;

        public SalesReportController(AppDbContext context, IMapper mapper, ILogger<SalesReportController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/SalesReport?startDate=...&endDate=...
        [HttpGet]
        public async Task<ActionResult<SalesReportDto>> GetSalesReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                DateTime queryStart = startDate ?? DateTime.MinValue;
                DateTime queryEnd = (endDate ?? DateTime.Today).AddDays(1);

                _logger.LogInformation("Generating sales report for the period {StartDate} - {EndDate}", queryStart, queryEnd.AddDays(-1));

                var estimates = await _context.Estimates
                    .Include(e => e.Vehicle)
                    .Include(e => e.UserWorkshop)
                    .Include(e => e.AccountReceivable)
                        .ThenInclude(ar => ar.Payments)
                    .Include(e => e.Parts)
                    .Include(e => e.Labors)
                    .Include(e => e.FlatFees)
                    .Where(e => e.Date >= queryStart && e.Date < queryEnd)
                    .ToListAsync();
                var report = new SalesReport
                {
                    StartDate = startDate,
                    EndDate = queryEnd.AddDays(-1),
                    CreatedDate = DateTime.UtcNow,
                };

                foreach (var e in estimates)
                {
                    decimal totalPayments = 0;
                    decimal remainingBalance = 0;
                    decimal originalAmount = 0;

                    if (e.AccountReceivable != null)
                    {
                        totalPayments = e.AccountReceivable.Payments.Sum(p => p.Amount);
                        remainingBalance = e.AccountReceivable.Balance;
                        originalAmount = e.AccountReceivable.OriginalAmount;
                    }

                    var detail = new SalesReportDetail
                    {
                        EstimateId = e.ID,
                        EstimateDate = e.Date,
                        Subtotal = e.Subtotal,
                        Tax = e.Tax,
                        Total = e.Total,
                        OriginalAmount = originalAmount,
                        RemainingBalance = remainingBalance,
                        TotalPayments = totalPayments,
                        Estimate = e
                    };

                    report.Details.Add(detail);
                }

                report.TotalEstimates = report.Details.Sum(d => d.Total);
                report.TotalPaymentsCollected = report.Details.Sum(d => d.TotalPayments);
                report.TotalOutstanding = report.Details.Sum(d => d.RemainingBalance);
                report.TotalPartsRevenue = estimates.Sum(e => e.Parts.Sum(p => p.ExtendedPrice));
                report.TotalLaborRevenue = estimates.Sum(e => e.Labors.Sum(l => l.ExtendedPrice));
                report.TotalFlatFeeRevenue = estimates.Sum(e => e.FlatFees.Sum(f => f.ExtendedPrice));
                report.TotalTaxCollected = estimates.Sum(e => e.Tax);

                var reportDto = _mapper.Map<SalesReportDto>(report);
                return Ok(reportDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generando reporte de ventas");
                return StatusCode(500, new { message = $"Error al generar el reporte de ventas: {ex.Message.ToString()}" });
            }
        }

        // GET: api/SalesReport/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<SalesReportDto>> GetSalesReportById(int id)
        {
            try
            {
                var salesReport = await _context.SalesReports
                    .Include(r => r.Details)
                        .ThenInclude(d => d.Estimate)
                    .FirstOrDefaultAsync(r => r.SalesReportId == id);
                if (salesReport == null)
                {
                    _logger.LogWarning("Reporte de ventas con ID {Id} no encontrado", id);
                    return NotFound();
                }
                var reportDto = _mapper.Map<SalesReportDto>(salesReport);
                return Ok(reportDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo reporte de ventas con ID {Id}", id);
                return StatusCode(500, new { message = $"Error al obtener el reporte de ventas: {ex.Message.ToString()}" });
            }
        }

        // POST: api/SalesReport
        [HttpPost]
        public async Task<ActionResult<SalesReportDto>> CreateSalesReport([FromBody] SalesReportDto reportDto)
        {
            try
            {
                if (reportDto == null)
                {
                    _logger.LogWarning("No report information provided.");
                    return BadRequest("No report information provided.");
                }

                if (reportDto.Details != null)
                {
                    foreach (var detail in reportDto.Details)
                    {
                        detail.Subtotal = detail.Subtotal ?? 0;
                        detail.Tax = detail.Tax ?? 0;
                        detail.Total = detail.Total ?? 0;
                        detail.OriginalAmount = detail.OriginalAmount ?? 0;
                        detail.RemainingBalance = detail.RemainingBalance ?? 0;
                        detail.TotalPayments = detail.TotalPayments ?? 0;
                    }
                }

                var salesReport = _mapper.Map<SalesReport>(reportDto);

                _context.SalesReports.Add(salesReport);
                await _context.SaveChangesAsync();

                var createdReportDto = _mapper.Map<SalesReportDto>(salesReport);
                _logger.LogInformation("Reporte de ventas creado con ID: {Id}", salesReport.SalesReportId);
                return CreatedAtAction(nameof(GetSalesReportById), new { id = createdReportDto.SalesReportId }, createdReportDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear reporte de ventas");
                return StatusCode(500, new { message = $"Error al crear el reporte de ventas: {ex.Message.ToString()}" });
            }
        }

        // GET: api/SalesReport/all
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<SalesReportDto>>> GetAllSalesReports()
        {
            try
            {
                var reports = await _context.SalesReports
                    .Include(r => r.Details)
                        .ThenInclude(d => d.Estimate)
                    .ToListAsync();
                return Ok(_mapper.Map<List<SalesReportDto>>(reports));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los reportes de ventas");
                return StatusCode(500, new { message = $"Error al obtener todos los reportes de ventas: {ex.Message.ToString()}" });
            }
        }
    }
}
