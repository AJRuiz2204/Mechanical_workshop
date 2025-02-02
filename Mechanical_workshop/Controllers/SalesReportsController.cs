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
            // Para la consulta: si StartDate no se suministra, usamos DateTime.MinValue; si EndDate no se suministra, usamos Today.
            DateTime queryStart = startDate ?? DateTime.MinValue;
            DateTime queryEnd = endDate ?? DateTime.Today;

            _logger.LogInformation("Generando reporte de ventas para el periodo {StartDate} - {EndDate}", queryStart, queryEnd);

            var estimates = await _context.Estimates
                .Include(e => e.Vehicle)
                .Include(e => e.UserWorkshop)
                .Include(e => e.AccountReceivable)
                    .ThenInclude(ar => ar.Payments)
                .Include(e => e.Parts)
                .Include(e => e.Labors)
                .Include(e => e.FlatFees)
                .Where(e => e.Date >= queryStart && e.Date <= queryEnd)
                .ToListAsync();

            var report = new SalesReport
            {
                // En el reporte se guarda StartDate tal como viene (puede ser null)
                StartDate = startDate,
                EndDate = queryEnd,
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
                    // No se asignan CustomerName ni VehicleInfo
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

        // GET: api/SalesReport/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<SalesReportDto>> GetSalesReportById(int id)
        {
            var salesReport = await _context.SalesReports
                .Include(r => r.Details)
                    .ThenInclude(d => d.Estimate)
                .FirstOrDefaultAsync(r => r.SalesReportId == id);
            if (salesReport == null)
            {
                return NotFound();
            }
            var reportDto = _mapper.Map<SalesReportDto>(salesReport);
            return Ok(reportDto);
        }

        // POST: api/SalesReport
        [HttpPost]
        public async Task<ActionResult<SalesReportDto>> CreateSalesReport([FromBody] SalesReportDto reportDto)
        {
            if (reportDto == null)
            {
                _logger.LogError("No se proporcionó información para el reporte.");
                return BadRequest("No se proporcionó información para el reporte.");
            }

            // Se elimina la validación de detalles, ya que se quiere guardar solo el resumen
            // Rellenar valores nulos en los detalles (si existieran)
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
            return CreatedAtAction(nameof(GetSalesReportById), new { id = createdReportDto.SalesReportId }, createdReportDto);
        }

        // GET: api/SalesReport/all
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<SalesReportDto>>> GetAllSalesReports()
        {
            var reports = await _context.SalesReports
                .Include(r => r.Details)
                    .ThenInclude(d => d.Estimate)
                .ToListAsync();
            return Ok(_mapper.Map<List<SalesReportDto>>(reports));
        }
    }
}
