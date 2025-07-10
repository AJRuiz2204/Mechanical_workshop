using AutoMapper;
using AutoMapper.QueryableExtensions;
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
    public class AccountReceivableController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<AccountReceivableController> _logger;

        public AccountReceivableController(AppDbContext context, IMapper mapper, ILogger<AccountReceivableController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/AccountReceivable
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccountReceivableResponseDto>>> GetAccountsReceivable()
        {
            try
            {
                var accounts = await _context.AccountsReceivable
                                .Include(ar => ar.Estimate)
                                    .ThenInclude(e => e.Vehicle)
                                .Include(ar => ar.Estimate)
                                    .ThenInclude(e => e.TechnicianDiagnostic)
                                        .ThenInclude(td => td!.Notes)
                                .Include(ar => ar.Estimate)
                                    .ThenInclude(e => e.Parts)
                                .Include(ar => ar.Estimate)
                                    .ThenInclude(e => e.Labors)
                                .Include(ar => ar.Estimate)
                                    .ThenInclude(e => e.FlatFees)
                                .Include(ar => ar.Customer)
                                .Include(ar => ar.Payments)
                                .ProjectTo<AccountReceivableResponseDto>(_mapper.ConfigurationProvider)
                                .ToListAsync();

                return _mapper.Map<List<AccountReceivableResponseDto>>(accounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving accounts receivable");
                return StatusCode(500, new { message = $"Error al obtener cuentas por cobrar: {ex.ToString()}" });
            }
        }

        // GET: api/AccountReceivable/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AccountReceivableResponseDto>> GetAccountReceivable(int id)
        {
            try
            {
                var account = await _context.AccountsReceivable
                    .Include(ar => ar.Estimate)
                        .ThenInclude(e => e.Vehicle)
                    .Include(ar => ar.Estimate)
                        .ThenInclude(e => e.TechnicianDiagnostic)
                            .ThenInclude(td => td!.Notes)
                    .Include(ar => ar.Estimate)
                        .ThenInclude(e => e.Parts)
                    .Include(ar => ar.Estimate)
                        .ThenInclude(e => e.Labors)
                    .Include(ar => ar.Estimate)
                        .ThenInclude(e => e.FlatFees)
                    .Include(ar => ar.Customer)
                    .Include(ar => ar.Payments)
                    .FirstOrDefaultAsync(ar => ar.Id == id);

                if (account == null)
                {
                    _logger.LogWarning("Account receivable with ID {Id} not found", id);
                    return NotFound();
                }

                return _mapper.Map<AccountReceivableResponseDto>(account);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving account receivable with ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al obtener la cuenta por cobrar: {ex.ToString()}" });
            }
        }

        // POST: api/AccountReceivable
        [HttpPost]
        public async Task<ActionResult<AccountReceivableResponseDto>> CreateAccountReceivable(AccountReceivableCreateDto createDto)
        {
            try
            {
                // Verificar si ya existe una cuenta para el mismo EstimateId
                var existingAccount = await _context.AccountsReceivable
                    .FirstOrDefaultAsync(ar => ar.EstimateId == createDto.EstimateId);
                if (existingAccount != null)
                {
                    // Si ya existe, se retorna el DTO existente
                    return CreatedAtAction(nameof(GetAccountReceivable),
                        new { id = existingAccount.Id },
                        _mapper.Map<AccountReceivableResponseDto>(existingAccount));
                }

                // Buscar el estimado
                var estimate = await _context.Estimates
                    .Include(e => e.Vehicle)
                    .FirstOrDefaultAsync(e => e.ID == createDto.EstimateId);

                if (estimate == null)
                {
                    _logger.LogWarning("Attempt to create account receivable with non-existent estimate ID: {EstimateId}", createDto.EstimateId);
                    return BadRequest("El presupuesto especificado no existe");
                }

                // Mapear el DTO a la entidad AccountReceivable
                var account = _mapper.Map<AccountReceivable>(createDto);
                account.OriginalAmount = estimate.Total;
                account.Balance = estimate.Total;
                account.CustomerId = estimate.Vehicle.UserWorkshopId;

                _context.AccountsReceivable.Add(account);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAccountReceivable),
                    new { id = account.Id },
                    _mapper.Map<AccountReceivableResponseDto>(account));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating account receivable for estimate ID: {EstimateId}", createDto.EstimateId);
                return StatusCode(500, new { message = $"Error al crear la cuenta por cobrar: {ex.ToString()}" });
            }
        }

        // PUT: api/AccountReceivable/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAccountReceivable(int id, AccountReceivableUpdateDto updateDto)
        {
            try
            {
                var account = await _context.AccountsReceivable.FindAsync(id);
                if (account == null)
                {
                    _logger.LogWarning("Account receivable with ID {Id} not found for update", id);
                    return NotFound();
                }

                _mapper.Map(updateDto, account);

                if (account.Balance <= 0)
                {
                    account.Status = "Paid";
                    account.CompletedDate = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating account receivable with ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al actualizar la cuenta por cobrar: {ex.ToString()}" });
            }
        }

        // DELETE: api/AccountReceivable/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccountReceivable(int id)
        {
            try
            {
                var account = await _context.AccountsReceivable.FindAsync(id);
                if (account == null)
                {
                    _logger.LogWarning("Account receivable with ID {Id} not found for deletion", id);
                    return NotFound();
                }

                _context.AccountsReceivable.Remove(account);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting account receivable with ID: {Id}", id);
                return StatusCode(500, new { message = $"Error al eliminar la cuenta por cobrar: {ex.ToString()}" });
            }
        }

        // POST: api/AccountReceivable/Payment
        [HttpPost("Payment")]
        public async Task<ActionResult<PaymentResponseDto>> CreatePayment(PaymentCreateDto paymentDto)
        {
            try
            {
                var account = await _context.AccountsReceivable
                    .Include(ar => ar.Payments)
                    .FirstOrDefaultAsync(ar => ar.Id == paymentDto.AccountReceivableId);

                if (account == null)
                {
                    _logger.LogWarning("Attempt to create payment for non-existent account receivable ID: {AccountId}", paymentDto.AccountReceivableId);
                    return NotFound("Cuenta por cobrar no encontrada");
                }

                if (paymentDto.Amount > account.Balance)
                {
                    _logger.LogWarning("Payment amount ({Amount}) exceeds balance ({Balance}) for account ID: {AccountId}", 
                        paymentDto.Amount, account.Balance, paymentDto.AccountReceivableId);
                    return BadRequest("El monto excede el saldo pendiente");
                }

                // Mapear el DTO a Payment
                var payment = _mapper.Map<Payment>(paymentDto);
                // Asignar la llave foránea explícitamente
                payment.AccountReceivableId = paymentDto.AccountReceivableId;
                payment.PaymentDate = DateTime.UtcNow;

                account.Payments.Add(payment);
                account.Balance -= payment.Amount;

                if (account.Balance <= 0)
                {
                    account.Status = "Paid";
                    account.CompletedDate = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                
                return CreatedAtAction(nameof(GetAccountReceivable),
                    new { id = account.Id },
                    _mapper.Map<PaymentResponseDto>(payment));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment for account ID: {AccountId}", paymentDto.AccountReceivableId);
                return StatusCode(500, new { message = $"Error al crear el pago: {ex.ToString()}" });
            }
        }

        // GET: api/AccountReceivable/Payment/5
        [HttpGet("Payment/{accountId}")]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> GetPayments(int accountId)
        {
            try
            {
                var payments = await _context.Payments
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(ar => ar.Estimate)
                            .ThenInclude(e => e!.TechnicianDiagnostic!)
                                .ThenInclude(td => td.Notes)
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(ar => ar.Estimate)
                            .ThenInclude(e => e!.Vehicle)
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(ar => ar.Customer)
                    .Where(p => p.AccountReceivableId == accountId)
                    .ToListAsync();

                return _mapper.Map<List<PaymentResponseDto>>(payments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payments for account ID: {AccountId}", accountId);
                return StatusCode(500, new { message = $"Error al obtener los pagos: {ex.ToString()}" });
            }
        }

        // GET: api/AccountReceivable/Payment
        [HttpGet("Payment")]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> GetAllPayments()
        {
            try
            {
                var payments = await _context.Payments
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(a => a.Customer)
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(a => a.Estimate)
                            .ThenInclude(e => e.Vehicle)
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(a => a.Estimate)
                            .ThenInclude(e => e.Parts)
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(a => a.Estimate)
                            .ThenInclude(e => e.Labors)
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(a => a.Estimate)
                            .ThenInclude(e => e.FlatFees)
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(a => a.Estimate)
                            .ThenInclude(e => e.TechnicianDiagnostic!)
                                .ThenInclude(td => td.Notes)
                    .ToListAsync();

                return _mapper.Map<List<PaymentResponseDto>>(payments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all payments");
                return StatusCode(500, new { message = $"Error al obtener todos los pagos: {ex.ToString()}" });
            }
        }

        // GET: api/AccountReceivable/Payment/Client/{customerId}
        [HttpGet("Payment/Client/{customerId}")]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> GetPaymentsByCustomer(int customerId)
        {
            try
            {
                var payments = await _context.Payments
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(ar => ar.Customer)
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(ar => ar.Estimate)
                            .ThenInclude(e => e.Vehicle)
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(ar => ar.Estimate)
                            .ThenInclude(e => e.Parts)
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(ar => ar.Estimate)
                            .ThenInclude(e => e.Labors)
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(ar => ar.Estimate)
                            .ThenInclude(e => e.FlatFees)
                    .Include(p => p.AccountReceivable)
                        .ThenInclude(ar => ar.Estimate)
                            .ThenInclude(e => e.TechnicianDiagnostic!)
                                .ThenInclude(td => td.Notes)
                    .Where(p => p.AccountReceivable.Customer.Id == customerId)
                    .ToListAsync();

                return _mapper.Map<List<PaymentResponseDto>>(payments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payments for customer ID: {CustomerId}", customerId);
                return StatusCode(500, new { message = $"Error al obtener los pagos por cliente: {ex.ToString()}" });
            }
        }
    }
}
