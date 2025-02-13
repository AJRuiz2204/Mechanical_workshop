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
    public class AccountReceivableController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public AccountReceivableController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/AccountReceivable
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccountReceivableResponseDto>>> GetAccountsReceivable()
        {
            var accounts = await _context.AccountsReceivable
                .Include(ar => ar.Estimate)
                    .ThenInclude(e => e.Vehicle)
                .Include(ar => ar.Customer)
                .Include(ar => ar.Payments)
                .ToListAsync();

            return _mapper.Map<List<AccountReceivableResponseDto>>(accounts);
        }

        // GET: api/AccountReceivable/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AccountReceivableResponseDto>> GetAccountReceivable(int id)
        {
            var account = await _context.AccountsReceivable
                .Include(ar => ar.Estimate)
                    .ThenInclude(e => e.Vehicle)
                .Include(ar => ar.Customer)
                .Include(ar => ar.Payments)
                .FirstOrDefaultAsync(ar => ar.Id == id);

            if (account == null)
            {
                return NotFound();
            }

            return _mapper.Map<AccountReceivableResponseDto>(account);
        }

        // POST: api/AccountReceivable
        [HttpPost]
        public async Task<ActionResult<AccountReceivableResponseDto>> CreateAccountReceivable(AccountReceivableCreateDto createDto)
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


        // PUT: api/AccountReceivable/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAccountReceivable(int id, AccountReceivableUpdateDto updateDto)
        {
            var account = await _context.AccountsReceivable.FindAsync(id);
            if (account == null)
            {
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

        // DELETE: api/AccountReceivable/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccountReceivable(int id)
        {
            var account = await _context.AccountsReceivable.FindAsync(id);
            if (account == null)
            {
                return NotFound();
            }

            _context.AccountsReceivable.Remove(account);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/AccountReceivable/Payment
        [HttpPost("Payment")]
        public async Task<ActionResult<PaymentResponseDto>> CreatePayment(PaymentCreateDto paymentDto)
        {
            var account = await _context.AccountsReceivable
                .Include(ar => ar.Payments)
                .FirstOrDefaultAsync(ar => ar.Id == paymentDto.AccountReceivableId);

            if (account == null)
            {
                return NotFound("Cuenta por cobrar no encontrada");
            }

            if (paymentDto.Amount > account.Balance)
            {
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

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return CreatedAtAction(nameof(GetAccountReceivable),
                new { id = account.Id },
                _mapper.Map<PaymentResponseDto>(payment));
        }

        // GET: api/AccountReceivable/Payment/5
        [HttpGet("Payment/{accountId}")]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> GetPayments(int accountId)
        {
            var payments = await _context.Payments
                .Where(p => p.AccountReceivableId == accountId)
                .ToListAsync();

            return _mapper.Map<List<PaymentResponseDto>>(payments);
        }

        // GET: api/AccountReceivable/Payment
        [HttpGet("Payment")]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> GetAllPayments()
        {
            // Incluir AccountReceivable, y dentro de éste, incluir Customer y Estimate con su Vehicle
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
                .ToListAsync();

            return _mapper.Map<List<PaymentResponseDto>>(payments);
        }

        // GET: api/AccountReceivable/Payment/Client/{customerId}
        [HttpGet("Payment/Client/{customerId}")]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> GetPaymentsByCustomer(int customerId)
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
                .Where(p => p.AccountReceivable.Customer.Id == customerId)
                .ToListAsync();

            return _mapper.Map<List<PaymentResponseDto>>(payments);
        }



    }
}
