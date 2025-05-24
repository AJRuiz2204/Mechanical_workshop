using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using AutoMapper;
using Microsoft.Extensions.Logging;

namespace Mechanical_workshop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EstimateWithAccountReceivableController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<EstimateWithAccountReceivableController> _logger;

        public EstimateWithAccountReceivableController(AppDbContext context, IMapper mapper, ILogger<EstimateWithAccountReceivableController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/EstimateWithAccountReceivable
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstimateWithAccountReceivableDto>>> GetEstimatesWithAccounts()
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


                var result = (from estimate in estimates
                              join ar in _context.AccountsReceivable
                                  on estimate.ID equals ar.EstimateId into arGroup
                              from account in arGroup.DefaultIfEmpty()
                              select new EstimateWithAccountReceivableDto
                              {
                                  Estimate = _mapper.Map<EstimateFullDto>(estimate),
                                  AccountReceivable = account == null
                                      ? null
                                      : _mapper.Map<AccountReceivableResponseDto>(account),
                              }).ToList();
                              
                result.ForEach(item =>
                {
                    if (item.AccountReceivable != null)
                    {
                        item.AccountReceivable.Estimate = null;
                    }
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving estimates with accounts receivable");
                return StatusCode(500, new { message = $"Error al obtener los presupuestos con cuentas por cobrar: {ex.ToString()}" });
            }
        }
    }
}
