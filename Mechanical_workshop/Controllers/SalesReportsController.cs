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
        // Retrieves a sales report for a given period.
        [HttpGet]
        public async Task<ActionResult<SalesReportDto>> GetSalesReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            // If startDate is not provided, use DateTime.MinValue.
            // If endDate is not provided, use DateTime.Today.
            // To include all records on the end date, add one day to endDate and compare using '<'
            DateTime queryStart = startDate ?? DateTime.MinValue;
            DateTime queryEnd = (endDate ?? DateTime.Today).AddDays(1);

            _logger.LogInformation("Generating sales report for the period {StartDate} - {EndDate}", queryStart, queryEnd.AddDays(-1));

            // Retrieve estimates within the specified date range with all necessary related entities.
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

            // Create a new SalesReport instance
            var report = new SalesReport
            {
                // Keep the original value of startDate (which may be null) and adjust endDate to display the original date.
                StartDate = startDate,
                EndDate = queryEnd.AddDays(-1),
                CreatedDate = DateTime.UtcNow,
            };

            // Process each estimate and add its details to the sales report.
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
                    // Include the full Estimate if mapping is needed.
                    Estimate = e
                };

                report.Details.Add(detail);
            }

            // Calculate aggregate totals for the report.
            report.TotalEstimates = report.Details.Sum(d => d.Total);
            report.TotalPaymentsCollected = report.Details.Sum(d => d.TotalPayments);
            report.TotalOutstanding = report.Details.Sum(d => d.RemainingBalance);
            report.TotalPartsRevenue = estimates.Sum(e => e.Parts.Sum(p => p.ExtendedPrice));
            report.TotalLaborRevenue = estimates.Sum(e => e.Labors.Sum(l => l.ExtendedPrice));
            report.TotalFlatFeeRevenue = estimates.Sum(e => e.FlatFees.Sum(f => f.ExtendedPrice));
            report.TotalTaxCollected = estimates.Sum(e => e.Tax);

            // Map the report entity to a DTO and return it.
            var reportDto = _mapper.Map<SalesReportDto>(report);
            return Ok(reportDto);
        }

        // GET: api/SalesReport/{id}
        // Retrieves a sales report by its ID.
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
        // Creates a new sales report based on the provided SalesReportDto.
        [HttpPost]
        public async Task<ActionResult<SalesReportDto>> CreateSalesReport([FromBody] SalesReportDto reportDto)
        {
            if (reportDto == null)
            {
                _logger.LogError("No report information provided.");
                return BadRequest("No report information provided.");
            }

            // Fill in null values in the details (if any), because only the summary is to be saved.
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

            // Map the DTO to a SalesReport entity.
            var salesReport = _mapper.Map<SalesReport>(reportDto);

            _context.SalesReports.Add(salesReport);
            await _context.SaveChangesAsync();

            var createdReportDto = _mapper.Map<SalesReportDto>(salesReport);
            return CreatedAtAction(nameof(GetSalesReportById), new { id = createdReportDto.SalesReportId }, createdReportDto);
        }

        // GET: api/SalesReport/all
        // Retrieves all sales reports.
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
