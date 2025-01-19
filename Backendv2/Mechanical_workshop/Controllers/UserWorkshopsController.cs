using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserWorkshopsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<UserWorkshopsController> _logger;

        public UserWorkshopsController(
            AppDbContext context,
            IMapper mapper,
            ILogger<UserWorkshopsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/UserWorkshops
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserWorkshopReadDto>>> GetUserWorkshops()
        {
            _logger.LogInformation("GET: Retrieving all UserWorkshops with Vehicles...");

            var userWorkshops = await _context.UserWorkshops
                .Include(uw => uw.Vehicles)
                .ToListAsync();

            _logger.LogInformation("GET: Retrieved {Count} UserWorkshops.", userWorkshops.Count);

            return Ok(_mapper.Map<IEnumerable<UserWorkshopReadDto>>(userWorkshops));
        }

        // GET: api/UserWorkshops/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserWorkshopReadDto>> GetUserWorkshop(int id)
        {
            _logger.LogInformation("GET: Retrieving UserWorkshop by ID: {Id}", id);

            var userWorkshop = await _context.UserWorkshops
                .Include(uw => uw.Vehicles)
                .FirstOrDefaultAsync(uw => uw.Id == id);

            if (userWorkshop == null)
            {
                _logger.LogWarning("GET: UserWorkshop with ID {Id} not found.", id);
                return NotFound();
            }

            _logger.LogInformation("GET: Found UserWorkshop with ID {Id}", id);
            return Ok(_mapper.Map<UserWorkshopReadDto>(userWorkshop));
        }

        // POST: api/UserWorkshops
        [HttpPost]
        public async Task<ActionResult<UserWorkshopReadDto>> CreateUserWorkshop(UserWorkshopCreateDto userWorkshopDto)
        {
            _logger.LogInformation("POST: Creating UserWorkshop. Incoming DTO: {@Dto}", userWorkshopDto);

            try
            {
                // 1) Mapeamos SOLO las propiedades básicas, IGNORANDO la lista de Vehicles
                var userWorkshop = _mapper.Map<UserWorkshop>(userWorkshopDto);

                // Aseguramos que la lista de Vehicles esté vacía después del mapeo
                userWorkshop.Vehicles = new List<Vehicle>();

                _logger.LogInformation(
                    "After mapping, userWorkshop.Vehicles.Count = {Count}",
                    userWorkshop.Vehicles.Count
                );

                // 2) Procesamos manualmente cada vehículo
                foreach (var vehicleDto in userWorkshopDto.Vehicles)
                {
                    // Validación: Ignorar vehículos con VIN vacío o nulo
                    if (string.IsNullOrWhiteSpace(vehicleDto.Vin))
                    {
                        _logger.LogWarning("POST: Skipping VehicleDto with empty VIN.");
                        continue;
                    }

                    _logger.LogInformation(
                        "VehicleDto => VIN: {Vin}, Make: {Make}, Model: {Model}",
                        vehicleDto.Vin, vehicleDto.Make, vehicleDto.Model
                    );

                    // Verificar si el vehículo ya existe basado en el VIN
                    var existingVehicle = await _context.Vehicles
                        .FirstOrDefaultAsync(v => v.Vin == vehicleDto.Vin);

                    if (existingVehicle == null)
                    {
                        _logger.LogInformation(
                            "No existing vehicle found with VIN = {Vin}. Creating new...",
                            vehicleDto.Vin
                        );
                        var newVehicle = _mapper.Map<Vehicle>(vehicleDto);
                        userWorkshop.Vehicles.Add(newVehicle);
                    }
                    else
                    {
                        _logger.LogInformation(
                            "Existing vehicle found with VIN = {Vin}. Reusing the same entity.",
                            vehicleDto.Vin
                        );
                        userWorkshop.Vehicles.Add(existingVehicle);
                    }
                }

                _logger.LogInformation(
                    "After manual additions, userWorkshop.Vehicles.Count = {Count}",
                    userWorkshop.Vehicles.Count
                );

                // 3) Guardar
                _context.UserWorkshops.Add(userWorkshop);
                await _context.SaveChangesAsync();

                // 4) Retornar el UserWorkshopReadDto resultante
                var readDto = _mapper.Map<UserWorkshopReadDto>(userWorkshop);

                _logger.LogInformation("POST: Successfully created UserWorkshop with ID = {Id}.", userWorkshop.Id);

                return CreatedAtAction(
                    nameof(GetUserWorkshop),
                    new { id = userWorkshop.Id },
                    readDto
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "POST: Error creating UserWorkshop.");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = $"Error creating the workshop: {ex.Message}"
                });
            }
        }


        // PUT: api/UserWorkshops/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserWorkshop(int id, UserWorkshopUpdateDto userWorkshopUpdateDto)
        {
            _logger.LogInformation("PUT: Updating UserWorkshop with ID = {Id}. Incoming DTO: {@Dto}", id, userWorkshopUpdateDto);

            if (id != userWorkshopUpdateDto.Id)
            {
                _logger.LogWarning("PUT: ID mismatch. Route ID: {RouteId}, DTO ID: {DtoId}", id, userWorkshopUpdateDto.Id);
                return BadRequest("ID mismatch");
            }

            var userWorkshop = await _context.UserWorkshops
                .Include(uw => uw.Vehicles)
                .FirstOrDefaultAsync(uw => uw.Id == id);

            if (userWorkshop == null)
            {
                _logger.LogWarning("PUT: UserWorkshop with ID = {Id} not found.", id);
                return NotFound();
            }

            // Map main fields (UserWorkshop)
            _mapper.Map(userWorkshopUpdateDto, userWorkshop);

            // Handle vehicles
            // 1) Remove vehicles that are no longer present
            var vehiclesToRemove = userWorkshop.Vehicles
                .Where(v => !userWorkshopUpdateDto.Vehicles.Any(dto => dto.Vin == v.Vin))
                .ToList();

            if (vehiclesToRemove.Any())
            {
                _logger.LogInformation("PUT: Removing {Count} vehicles that are no longer present in the DTO.", vehiclesToRemove.Count);
            }

            foreach (var vehicle in vehiclesToRemove)
            {
                _logger.LogInformation("PUT: Removing Vehicle with VIN = {Vin}", vehicle.Vin);
                _context.Vehicles.Remove(vehicle);
            }

            // 2) Add or update vehicles
            foreach (var vehicleDto in userWorkshopUpdateDto.Vehicles)
            {
                _logger.LogInformation("PUT: Processing VehicleDto with VIN = {Vin}", vehicleDto.Vin);

                var existingVehicle = userWorkshop.Vehicles
                    .FirstOrDefault(v => v.Vin == vehicleDto.Vin);

                if (existingVehicle != null)
                {
                    _logger.LogInformation("PUT: Found existing vehicle in userWorkshop with VIN = {Vin}. Updating fields...", vehicleDto.Vin);
                    _mapper.Map(vehicleDto, existingVehicle);
                }
                else
                {
                    // Verificar si el vehículo ya existe en DB (otra instancia)
                    var vehicleExists = await _context.Vehicles.AnyAsync(v => v.Vin == vehicleDto.Vin);
                    if (!vehicleExists)
                    {
                        _logger.LogInformation("PUT: Vehicle VIN {Vin} not found in DB, creating new.", vehicleDto.Vin);
                        var newVehicle = _mapper.Map<Vehicle>(vehicleDto);
                        userWorkshop.Vehicles.Add(newVehicle);
                    }
                    else
                    {
                        var existing = await _context.Vehicles.FirstOrDefaultAsync(v => v.Vin == vehicleDto.Vin);
                        if (existing != null)
                        {
                            _logger.LogInformation("PUT: Vehicle VIN {Vin} found in DB, reusing it.", vehicleDto.Vin);
                            userWorkshop.Vehicles.Add(existing);
                        }
                    }
                }
            }

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("PUT: Successfully updated UserWorkshop ID = {Id}", id);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "PUT: Concurrency error updating UserWorkshop ID = {Id}", id);

                if (!UserWorkshopExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/UserWorkshops/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserWorkshop(int id)
        {
            _logger.LogInformation("DELETE: Deleting UserWorkshop with ID = {Id}", id);

            var userWorkshop = await _context.UserWorkshops.FindAsync(id);
            if (userWorkshop == null)
            {
                _logger.LogWarning("DELETE: UserWorkshop with ID {Id} not found.", id);
                return NotFound();
            }

            _context.UserWorkshops.Remove(userWorkshop);
            await _context.SaveChangesAsync();

            _logger.LogInformation("DELETE: Successfully deleted UserWorkshop with ID = {Id}", id);

            return NoContent();
        }

        private bool UserWorkshopExists(int id)
        {
            return _context.UserWorkshops.Any(e => e.Id == id);
        }

        [HttpGet("searchVehicles")]
        public async Task<ActionResult<List<VehicleSearchDto>>> SearchVehicles([FromQuery] string searchTerm)
        {
            _logger.LogInformation("GET: searchVehicles endpoint called with searchTerm = {SearchTerm}", searchTerm);

            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                _logger.LogWarning("GET: searchVehicles called with empty or whitespace searchTerm.");
                return BadRequest("Search term cannot be empty.");
            }

            var searchTermLower = searchTerm.ToLower();

            var vehicles = await _context.UserWorkshops
                .Include(uw => uw.Vehicles)
                .Where(uw => uw.Name.ToLower().Contains(searchTermLower) || uw.LastName.ToLower().Contains(searchTermLower))
                .SelectMany(uw => uw.Vehicles, (uw, v) => new { Workshop = uw, Vehicle = v })
                .Where(wv => wv.Vehicle.Vin.ToLower().Contains(searchTermLower) ||
                             wv.Workshop.Name.ToLower().Contains(searchTermLower) ||
                             wv.Workshop.LastName.ToLower().Contains(searchTermLower))
                .Select(wv => new VehicleSearchDto
                {
                    Vin = wv.Vehicle.Vin,
                    Make = wv.Vehicle.Make,
                    Model = wv.Vehicle.Model,
                    OwnerName = $"{wv.Workshop.Name} {wv.Workshop.LastName}"
                })
                .ToListAsync();

            if (vehicles.Count == 0)
            {
                _logger.LogInformation("GET: searchVehicles found 0 matches for {SearchTerm}.", searchTerm);
                return Ok(new { message = "No vehicles matching the search were found." });
            }

            _logger.LogInformation("GET: searchVehicles found {Count} matches for {SearchTerm}.", vehicles.Count, searchTerm);
            return Ok(vehicles);
        }

        [HttpGet("vehicles")]
        public async Task<ActionResult<List<VehicleSearchDto>>> GetAllVehicles()
        {
            _logger.LogInformation("GET: Retrieving all vehicles from all UserWorkshops...");

            try
            {
                var vehicles = await _context.UserWorkshops
                    .Include(uw => uw.Vehicles)
                    .SelectMany(
                        uw => uw.Vehicles,
                        (uw, v) => new
                        {
                            Id = v.Id,
                            Vin = v.Vin,
                            v.Make,
                            v.Model,
                            v.Engine,
                            v.Plate,
                            v.State,
                            v.Status,
                            OwnerName = $"{uw.Name} {uw.LastName}"
                        }
                    )
                    .ToListAsync();

                _logger.LogInformation("GET: Retrieved total of {Count} vehicles.", vehicles.Count);

                var result = vehicles.Select(v => new VehicleSearchDto
                {
                    Id = v.Id,
                    Vin = v.Vin,
                    Make = v.Make,
                    Model = v.Model,
                    OwnerName = v.OwnerName,
                    Status = v.Status
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GET: Error retrieving the vehicle list");
                return BadRequest(new { message = $"Error retrieving the vehicle list: {ex.Message}" });
            }
        }

        // DELETE: api/UserWorkshops/vehicle/{vin}
        [HttpDelete("vehicle/{vin}")]
        public async Task<IActionResult> DeleteVehicleByVin(string vin)
        {
            _logger.LogInformation("DELETE: Deleting vehicle by VIN = {Vin}", vin);

            try
            {
                var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Vin == vin);
                if (vehicle == null)
                {
                    _logger.LogWarning("DELETE: Vehicle with VIN {Vin} not found.", vin);
                    return NotFound(new { message = $"Vehicle with VIN '{vin}' not found." });
                }

                _context.Vehicles.Remove(vehicle);
                await _context.SaveChangesAsync();

                _logger.LogInformation("DELETE: Successfully removed vehicle with VIN = {Vin}", vin);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DELETE: Error deleting vehicle with VIN {Vin}", vin);
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = $"Error deleting the vehicle: {ex.Message}"
                });
            }
        }

        // GET: api/UserWorkshops/vehicle/{id}
        [HttpGet("vehicle/{id}")]
        public async Task<ActionResult<VehicleReadDto>> GetVehicleById(int id)
        {
            _logger.LogInformation("GET: Retrieving vehicle by ID = {Id}", id);

            var vehicle = await _context.Vehicles
                .Include(v => v.UserWorkshop)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (vehicle == null)
            {
                _logger.LogWarning("GET: Vehicle with ID {Id} not found.", id);
                return NotFound(new { message = $"Vehicle with ID {id} not found." });
            }

            _logger.LogInformation("GET: Found vehicle with ID {Id}, VIN = {Vin}", id, vehicle.Vin);
            var vehicleReadDto = _mapper.Map<VehicleReadDto>(vehicle);
            return Ok(vehicleReadDto);
        }

        // PUT: api/UserWorkshops/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateVehicleStatus(int id, [FromBody] string newStatus)
        {
            _logger.LogInformation("PUT: Updating vehicle status. VehicleID = {Id}, NewStatus = {Status}", id, newStatus);

            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                _logger.LogWarning("PUT: Vehicle with ID {Id} not found.", id);
                return NotFound(new { message = "Vehicle not found." });
            }

            vehicle.Status = newStatus;
            await _context.SaveChangesAsync();

            _logger.LogInformation("PUT: Successfully updated status of Vehicle ID {Id} to {Status}", id, newStatus);
            return NoContent();
        }
    }
}
