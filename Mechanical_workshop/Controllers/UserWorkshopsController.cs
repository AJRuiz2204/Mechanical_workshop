using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;
using Mechanical_workshop.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserWorkshopsController : ControllerBase
    {
        private readonly IUserWorkshopService _userWorkshopService;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<UserWorkshopsController> _logger;

        public UserWorkshopsController(
            IUserWorkshopService userWorkshopService,
            AppDbContext context,
            IMapper mapper,
            ILogger<UserWorkshopsController> logger)
        {
            _userWorkshopService = userWorkshopService;
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserWorkshopReadDto>>> GetUserWorkshops()
        {
            try
            {
                _logger.LogInformation("GET: Retrieving all UserWorkshops with Vehicles...");
                var userWorkshops = await _userWorkshopService.GetAllUserWorkshopsAsync();
                return Ok(userWorkshops);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los talleres de usuario");
                return StatusCode(500, new { message = $"Error al obtener los talleres de usuario: {ex.Message}" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserWorkshopReadDto>> GetUserWorkshop(int id)
        {
            try
            {
                _logger.LogInformation("GET: Retrieving UserWorkshop by ID: {Id}", id);
                var userWorkshop = await _userWorkshopService.GetUserWorkshopByIdAsync(id);
                
                if (userWorkshop == null)
                {
                    _logger.LogWarning("GET: UserWorkshop with ID {Id} not found.", id);
                    return NotFound();
                }

                _logger.LogInformation("GET: Found UserWorkshop with ID {Id}", id);
                return Ok(userWorkshop);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el taller de usuario con ID {Id}", id);
                return StatusCode(500, new { message = $"Error al obtener el taller de usuario: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<UserWorkshopReadDto>> CreateUserWorkshop(UserWorkshopCreateDto userWorkshopDto)
        {
            _logger.LogInformation("POST: Creating a new UserWorkshop.");

            if (userWorkshopDto == null)
            {
                _logger.LogWarning("POST: UserWorkshopCreateDto is null.");
                return BadRequest("Invalid UserWorkshop data.");
            }

            try
            {
                var result = await _userWorkshopService.CreateUserWorkshopAsync(userWorkshopDto);
                _logger.LogInformation("POST: UserWorkshop created successfully with ID = {Id}.", result.Id);
                return CreatedAtAction(nameof(GetUserWorkshop), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "POST: Error creating UserWorkshop.");
                return StatusCode(500, "Error creating the mechanical workshop.");
            }
        }

        [HttpPost("bulk")]
        public async Task<ActionResult<IEnumerable<UserWorkshopReadDto>>> CreateUserWorkshops(IEnumerable<UserWorkshopCreateDto> userWorkshopsDto)
        {
            _logger.LogInformation("POST: Creating multiple UserWorkshops. Count: {Count}", userWorkshopsDto.Count());

            var readDtos = new List<UserWorkshopReadDto>();

            foreach (var userWorkshopDto in userWorkshopsDto)
            {
                try
                {
                    var userWorkshop = _mapper.Map<UserWorkshop>(userWorkshopDto);

                    userWorkshop.Vehicles = new List<Vehicle>();

                    foreach (var vehicleDto in userWorkshopDto.Vehicles)
                    {
                        if (string.IsNullOrWhiteSpace(vehicleDto.Vin))
                        {
                            _logger.LogWarning("POST Bulk: A VehicleDto with an empty VIN will be skipped.");
                            continue;
                        }

                        _logger.LogInformation(
                            "VehicleDto => VIN: {Vin}, Make: {Make}, Model: {Model}",
                            vehicleDto.Vin, vehicleDto.Make, vehicleDto.Model
                        );

                        var existingVehicle = await _context.Vehicles
                            .FirstOrDefaultAsync(v => v.Vin == vehicleDto.Vin);

                        if (existingVehicle == null)
                        {
                            _logger.LogInformation(
                                "No existing vehicle found with VIN = {Vin}. Creating a new one...",
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


                    _context.UserWorkshops.Add(userWorkshop);
                    await _context.SaveChangesAsync();


                    var readDto = _mapper.Map<UserWorkshopReadDto>(userWorkshop);
                    readDtos.Add(readDto);

                    _logger.LogInformation("POST Bulk: UserWorkshop created successfully with ID = {Id}.", userWorkshop.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "POST Bulk: Error creating UserWorkshop.");

                }
            }

            return CreatedAtAction(nameof(GetUserWorkshops), readDtos);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserWorkshop(int id, UserWorkshopUpdateDto userWorkshopUpdateDto)
        {
            _logger.LogInformation("PUT: Updating UserWorkshop with ID = {Id}. Incoming DTO: {@Dto}", id, userWorkshopUpdateDto);

            if (id != userWorkshopUpdateDto.Id)
            {
                _logger.LogWarning("PUT: ID mismatch. Route ID: {RouteId}, DTO ID: {DtoId}", id, userWorkshopUpdateDto.Id);
                return BadRequest(new { message = "The ID in the route does not match the ID in the request body." });
            }

            var userWorkshop = await _context.UserWorkshops
                .Include(uw => uw.Vehicles)
                .FirstOrDefaultAsync(uw => uw.Id == id);
            if (userWorkshop == null)
            {
                _logger.LogWarning("PUT: UserWorkshop with ID {Id} not found.", id);
                return NotFound(new { message = $"UserWorkshop with ID {id} not found." });
            }

            _mapper.Map(userWorkshopUpdateDto, userWorkshop);

            var dtoVins = userWorkshopUpdateDto.Vehicles.Select(v => v.Vin).ToList();

            var vehiclesToRemove = userWorkshop.Vehicles.Where(v => !dtoVins.Contains(v.Vin)).ToList();
            if (vehiclesToRemove.Any())
            {
                _logger.LogInformation("PUT: Removing {Count} vehicles not present in the DTO.", vehiclesToRemove.Count);
                _context.Vehicles.RemoveRange(vehiclesToRemove);
            }


            foreach (var vehicleDto in userWorkshopUpdateDto.Vehicles)
            {
                if (string.IsNullOrWhiteSpace(vehicleDto.Vin))
                {
                    _logger.LogWarning("PUT: Found a vehicle with an empty VIN in the DTO. It will be skipped.");
                    continue;
                }

                var existingVehicle = userWorkshop.Vehicles.FirstOrDefault(v => v.Vin == vehicleDto.Vin);
                if (existingVehicle != null)
                {

                    _mapper.Map(vehicleDto, existingVehicle);
                    _logger.LogInformation("PUT: Updated existing vehicle with VIN = {Vin}.", vehicleDto.Vin);
                }
                else
                {


                    var newVehicle = _mapper.Map<Vehicle>(vehicleDto);
                    userWorkshop.Vehicles.Add(newVehicle);
                    _logger.LogInformation("PUT: Added new vehicle with VIN = {Vin}.", vehicleDto.Vin);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("PUT: UserWorkshop with ID = {Id} updated successfully.", id);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "PUT: Concurrency error updating UserWorkshop with ID = {Id}", id);
                if (!UserWorkshopExists(id))
                {
                    _logger.LogWarning("PUT: UserWorkshop with ID {Id} no longer exists after concurrency error.", id);
                    return NotFound(new { message = $"UserWorkshop with ID {id} no longer exists." });
                }
                else
                {
                    _logger.LogError("PUT: Unknown concurrency error for UserWorkshop with ID = {Id}.", id);
                    return StatusCode(500, new { message = "Concurrency error while updating the UserWorkshop." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PUT: Unexpected error updating UserWorkshop with ID = {Id}", id);
                return StatusCode(500, new { message = "Unexpected error while updating the UserWorkshop." });
            }

            return NoContent();
        }


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

            _logger.LogInformation("DELETE: UserWorkshop with ID {Id} deleted successfully.", id);

            return NoContent();
        }

        private bool UserWorkshopExists(int id)
        {
            return _context.UserWorkshops.Any(e => e.Id == id);
        }

        [HttpGet("searchVehicles")]
        public async Task<ActionResult> SearchVehicles([FromQuery] string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return BadRequest(new { success = false, message = "The search term cannot be empty." });
            }

            try
            {
                var searchTermLower = searchTerm.ToLower();

                var vehicles = await _context.UserWorkshops
                    .Include(uw => uw.Vehicles)
                    .Where(uw => EF.Functions.Like(uw.Name, $"%{searchTerm}%") ||
                                 EF.Functions.Like(uw.LastName, $"%{searchTerm}%") ||
                                 uw.Vehicles.Any(v => EF.Functions.Like(v.Vin, $"%{searchTerm}%")))
                    .SelectMany(uw => uw.Vehicles, (uw, v) => new { Workshop = uw, Vehicle = v })
                    .Select(wv => new VehicleSearchDto
                    {
                        Vin = wv.Vehicle.Vin,
                        Make = wv.Vehicle.Make,
                        Model = wv.Vehicle.Model,
                        OwnerName = $"{wv.Workshop.Name} {wv.Workshop.LastName}"
                    })
                    .ToListAsync();

                if (!vehicles.Any())
                {
                    return Ok(new { success = false, message = "No vehicles were found that match your search." });
                }

                return Ok(new { success = true, data = vehicles });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request.", error = ex.Message });
            }
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
                            UserWorkshopId = uw.Id,
                            OwnerName = $"{uw.Name} {uw.LastName}"
                        }
                    )
                    .ToListAsync();

                _logger.LogInformation("GET: Retrieved a total of {Count} vehicles.", vehicles.Count);

                var result = vehicles.Select(v => new VehicleSearchDto
                {
                    Id = v.Id,
                    Vin = v.Vin,
                    Make = v.Make,
                    Model = v.Model,
                    OwnerName = v.OwnerName,
                    Status = v.Status,
                    UserWorkshopId = v.UserWorkshopId
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GET: Error retrieving the vehicle list");
                return BadRequest(new { message = $"Error retrieving the vehicle list: {ex.Message}" });
            }
        }

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
