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
    /// <summary>
    /// Controller for managing UserWorkshops and their Vehicles.
    /// </summary>
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

        /// <summary>
        /// Retrieves all UserWorkshops along with their associated Vehicles.
        /// </summary>
        /// <returns>A list of UserWorkshopReadDto objects.</returns>
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

        /// <summary>
        /// Retrieves a specific UserWorkshop by its ID.
        /// </summary>
        /// <param name="id">The ID of the UserWorkshop.</param>
        /// <returns>The UserWorkshopReadDto object.</returns>
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

        /// <summary>
        /// Crea un nuevo UserWorkshop.
        /// </summary>
        /// <param name="userWorkshopDto">Objeto UserWorkshopCreateDto con la información del taller y vehículos asociados.</param>
        /// <returns>El UserWorkshopReadDto creado.</returns>
        [HttpPost]
        public async Task<ActionResult<UserWorkshopReadDto>> CreateUserWorkshop(UserWorkshopCreateDto userWorkshopDto)
        {
            _logger.LogInformation("POST: Creando un nuevo UserWorkshop.");

            if (userWorkshopDto == null)
            {
                _logger.LogWarning("POST: UserWorkshopCreateDto es nulo.");
                return BadRequest("Datos de UserWorkshop inválidos.");
            }

            try
            {
                // Mapear el DTO a la entidad
                var userWorkshop = _mapper.Map<UserWorkshop>(userWorkshopDto);

                userWorkshop.Vehicles = new List<Vehicle>();

                foreach (var vehicleDto in userWorkshopDto.Vehicles)
                {
                    if (string.IsNullOrWhiteSpace(vehicleDto.Vin))
                    {
                        _logger.LogWarning("POST: Se omitirá un VehicleDto con VIN vacío.");
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
                            "No se encontró vehículo existente con VIN = {Vin}. Creando uno nuevo...",
                            vehicleDto.Vin
                        );
                        var newVehicle = _mapper.Map<Vehicle>(vehicleDto);
                        userWorkshop.Vehicles.Add(newVehicle);
                    }
                    else
                    {
                        _logger.LogInformation(
                            "Vehículo existente encontrado con VIN = {Vin}. Reutilizando la misma entidad.",
                            vehicleDto.Vin
                        );
                        userWorkshop.Vehicles.Add(existingVehicle);
                    }
                }

                _logger.LogInformation(
                    "Después de las adiciones manuales, userWorkshop.Vehicles.Count = {Count}",
                    userWorkshop.Vehicles.Count
                );

                // Guardar el UserWorkshop en la base de datos
                _context.UserWorkshops.Add(userWorkshop);
                await _context.SaveChangesAsync();

                // Mapear la entidad a ReadDto
                var readDto = _mapper.Map<UserWorkshopReadDto>(userWorkshop);

                _logger.LogInformation("POST: UserWorkshop creado exitosamente con ID = {Id}.", userWorkshop.Id);

                return CreatedAtAction(nameof(GetUserWorkshop), new { id = readDto.Id }, readDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "POST: Error al crear UserWorkshop.");
                return StatusCode(500, "Error al crear el taller mecánico.");
            }
        }

        /// <summary>
        /// Crea múltiples UserWorkshops.
        /// </summary>
        /// <param name="userWorkshopsDto">Lista de UserWorkshopCreateDto.</param>
        /// <returns>Lista de UserWorkshopReadDto creados.</returns>
        [HttpPost("bulk")]
        public async Task<ActionResult<IEnumerable<UserWorkshopReadDto>>> CreateUserWorkshops(IEnumerable<UserWorkshopCreateDto> userWorkshopsDto)
        {
            _logger.LogInformation("POST: Creando múltiples UserWorkshops. Cantidad: {Count}", userWorkshopsDto.Count());

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
                            _logger.LogWarning("POST Bulk: Se omitirá un VehicleDto con VIN vacío.");
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
                                "No se encontró vehículo existente con VIN = {Vin}. Creando uno nuevo...",
                                vehicleDto.Vin
                            );
                            var newVehicle = _mapper.Map<Vehicle>(vehicleDto);
                            userWorkshop.Vehicles.Add(newVehicle);
                        }
                        else
                        {
                            _logger.LogInformation(
                                "Vehículo existente encontrado con VIN = {Vin}. Reutilizando la misma entidad.",
                                vehicleDto.Vin
                            );
                            userWorkshop.Vehicles.Add(existingVehicle);
                        }
                    }

                    _logger.LogInformation(
                        "Después de las adiciones manuales, userWorkshop.Vehicles.Count = {Count}",
                        userWorkshop.Vehicles.Count
                    );

                    // Guardar el UserWorkshop
                    _context.UserWorkshops.Add(userWorkshop);
                    await _context.SaveChangesAsync();

                    // Mapear al ReadDto y agregar a la lista de respuestas
                    var readDto = _mapper.Map<UserWorkshopReadDto>(userWorkshop);
                    readDtos.Add(readDto);

                    _logger.LogInformation("POST Bulk: UserWorkshop creado exitosamente con ID = {Id}.", userWorkshop.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "POST Bulk: Error al crear UserWorkshop.");
                    // Opcional: Puedes decidir cómo manejar errores individuales sin detener todo el proceso
                }
            }

            return CreatedAtAction(nameof(GetUserWorkshops), readDtos);
        }

        /// <summary>
        /// Updates an existing UserWorkshop.
        /// </summary>
        /// <param name="id">The ID of the UserWorkshop to update.</param>
        /// <param name="userWorkshopUpdateDto">The UserWorkshopUpdateDto object containing updated details.</param>
        /// <returns>No content if successful.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserWorkshop(int id, UserWorkshopUpdateDto userWorkshopUpdateDto)
        {
            _logger.LogInformation("PUT: Actualizando UserWorkshop con ID = {Id}. DTO entrante: {@Dto}", id, userWorkshopUpdateDto);

            if (id != userWorkshopUpdateDto.Id)
            {
                _logger.LogWarning("PUT: Desajuste de ID. ID de ruta: {RouteId}, ID del DTO: {DtoId}", id, userWorkshopUpdateDto.Id);
                return BadRequest("Desajuste de ID");
            }

            var userWorkshop = await _context.UserWorkshops
                .Include(uw => uw.Vehicles)
                .FirstOrDefaultAsync(uw => uw.Id == id);

            if (userWorkshop == null)
            {
                _logger.LogWarning("PUT: UserWorkshop con ID = {Id} no encontrado.", id);
                return NotFound();
            }

            // Mapear los campos principales (UserWorkshop)
            _mapper.Map(userWorkshopUpdateDto, userWorkshop);

            // Manejar vehículos
            // 1) Remover vehículos que ya no están presentes
            var vehiclesToRemove = userWorkshop.Vehicles
                .Where(v => !userWorkshopUpdateDto.Vehicles.Any(dto => dto.Vin == v.Vin))
                .ToList();

            if (vehiclesToRemove.Any())
            {
                _logger.LogInformation("PUT: Removiendo {Count} vehículos que ya no están presentes en el DTO.", vehiclesToRemove.Count);
            }

            foreach (var vehicle in vehiclesToRemove)
            {
                _logger.LogInformation("PUT: Removiendo vehículo con VIN = {Vin}", vehicle.Vin);
                _context.Vehicles.Remove(vehicle);
            }

            // 2) Añadir o actualizar vehículos
            foreach (var vehicleDto in userWorkshopUpdateDto.Vehicles)
            {
                _logger.LogInformation("PUT: Procesando VehicleDto con VIN = {Vin}", vehicleDto.Vin);

                var existingVehicle = userWorkshop.Vehicles
                    .FirstOrDefault(v => v.Vin == vehicleDto.Vin);

                if (existingVehicle != null)
                {
                    _logger.LogInformation("PUT: Vehículo existente encontrado en UserWorkshop con VIN = {Vin}. Actualizando campos...", vehicleDto.Vin);
                    _mapper.Map(vehicleDto, existingVehicle);
                }
                else
                {
                    // Verificar si el vehículo ya existe en DB (otra instancia)
                    var vehicleExists = await _context.Vehicles.AnyAsync(v => v.Vin == vehicleDto.Vin);
                    if (!vehicleExists)
                    {
                        _logger.LogInformation("PUT: Vehículo con VIN {Vin} no encontrado en DB, creando uno nuevo.", vehicleDto.Vin);
                        var newVehicle = _mapper.Map<Vehicle>(vehicleDto);
                        userWorkshop.Vehicles.Add(newVehicle);
                    }
                    else
                    {
                        var existing = await _context.Vehicles.FirstOrDefaultAsync(v => v.Vin == vehicleDto.Vin);
                        if (existing != null)
                        {
                            _logger.LogInformation("PUT: Vehículo con VIN {Vin} encontrado en DB, reutilizándolo.", vehicleDto.Vin);
                            userWorkshop.Vehicles.Add(existing);
                        }
                    }
                }
            }

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("PUT: UserWorkshop con ID = {Id} actualizado exitosamente.", id);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "PUT: Error de concurrencia al actualizar UserWorkshop con ID = {Id}", id);

                if (!UserWorkshopExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a UserWorkshop by its ID.
        /// </summary>
        /// <param name="id">The ID of the UserWorkshop to delete.</param>
        /// <returns>No content if successful.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserWorkshop(int id)
        {
            _logger.LogInformation("DELETE: Eliminando UserWorkshop con ID = {Id}", id);

            var userWorkshop = await _context.UserWorkshops.FindAsync(id);
            if (userWorkshop == null)
            {
                _logger.LogWarning("DELETE: UserWorkshop con ID {Id} no encontrado.", id);
                return NotFound();
            }

            _context.UserWorkshops.Remove(userWorkshop);
            await _context.SaveChangesAsync();

            _logger.LogInformation("DELETE: UserWorkshop con ID = {Id} eliminado exitosamente.", id);

            return NoContent();
        }

        private bool UserWorkshopExists(int id)
        {
            return _context.UserWorkshops.Any(e => e.Id == id);
        }

        /// <summary>
        /// Searches for Vehicles based on a search term.
        /// </summary>
        /// <param name="searchTerm">The term to search for.</param>
        /// <returns>A list of VehicleSearchDto objects.</returns>
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

        /// <summary>
        /// Retrieves all Vehicles from all UserWorkshops.
        /// </summary>
        /// <returns>A list of VehicleSearchDto objects.</returns>
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

        /// <summary>
        /// Deletes a Vehicle by its VIN.
        /// </summary>
        /// <param name="vin">The VIN of the Vehicle to delete.</param>
        /// <returns>No content if successful.</returns>
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

        /// <summary>
        /// Retrieves a Vehicle by its ID.
        /// </summary>
        /// <param name="id">The ID of the Vehicle.</param>
        /// <returns>The VehicleReadDto object.</returns>
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

        /// <summary>
        /// Updates the status of a Vehicle.
        /// </summary>
        /// <param name="id">The ID of the Vehicle.</param>
        /// <param name="newStatus">The new status to set.</param>
        /// <returns>No content if successful.</returns>
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
