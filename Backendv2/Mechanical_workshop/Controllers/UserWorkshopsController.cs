using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserWorkshopsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public UserWorkshopsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/UserWorkshops
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserWorkshopReadDto>>> GetUserWorkshops()
        {
            var userWorkshops = await _context.UserWorkshops
                .Include(uw => uw.Vehicles)
                .ToListAsync();

            return Ok(_mapper.Map<IEnumerable<UserWorkshopReadDto>>(userWorkshops));
        }

        // GET: api/UserWorkshops/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserWorkshopReadDto>> GetUserWorkshop(int id)
        {
            var userWorkshop = await _context.UserWorkshops
                .Include(uw => uw.Vehicles)
                .FirstOrDefaultAsync(uw => uw.Id == id);

            if (userWorkshop == null) return NotFound();

            return Ok(_mapper.Map<UserWorkshopReadDto>(userWorkshop));
        }

        [HttpPost]
        public async Task<ActionResult<UserWorkshopReadDto>> CreateUserWorkshop(UserWorkshopCreateDto userWorkshopDto)
        {
            try
            {
                // Lógica existente
                var userWorkshop = _mapper.Map<UserWorkshop>(userWorkshopDto);

                foreach (var vehicleDto in userWorkshopDto.Vehicles)
                {
                    userWorkshop.Vehicles.Add(_mapper.Map<Vehicle>(vehicleDto));
                }

                _context.UserWorkshops.Add(userWorkshop);
                await _context.SaveChangesAsync();  // <-- Aquí se lanza la excepción si algo falla en la BD

                var readDto = _mapper.Map<UserWorkshopReadDto>(userWorkshop);
                return CreatedAtAction(nameof(GetUserWorkshop), new { id = userWorkshop.Id }, readDto);
            }
            catch (Exception ex)
            {
                // Capturamos cualquier excepción (por ejemplo, DB, validación, etc.)
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = $"Error al crear el taller: {ex.Message}"
                });
            }
        }



        // PUT: api/UserWorkshops/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserWorkshop(int id, UserWorkshopUpdateDto userWorkshopUpdateDto)
        {
            if (id != userWorkshopUpdateDto.Id)
            {
                return BadRequest("ID mismatch");
            }

            var userWorkshop = await _context.UserWorkshops
                .Include(uw => uw.Vehicles)
                .FirstOrDefaultAsync(uw => uw.Id == id);

            if (userWorkshop == null)
            {
                return NotFound();
            }

            // Mapeo de campos principales
            _mapper.Map(userWorkshopUpdateDto, userWorkshop);

            // Manejo de vehículos
            // Eliminar vehículos que ya no existen
            var vehiclesToRemove = userWorkshop.Vehicles
                .Where(v => !userWorkshopUpdateDto.Vehicles.Any(dto => dto.Vin == v.Vin))
                .ToList();

            foreach (var vehicle in vehiclesToRemove)
            {
                _context.Vehicles.Remove(vehicle);
            }

            // Agregar o actualizar vehículos
            foreach (var vehicleDto in userWorkshopUpdateDto.Vehicles)
            {
                var existingVehicle = userWorkshop.Vehicles.FirstOrDefault(v => v.Vin == vehicleDto.Vin);
                if (existingVehicle != null)
                {
                    _mapper.Map(vehicleDto, existingVehicle);
                }
                else
                {
                    var newVehicle = _mapper.Map<Vehicle>(vehicleDto);
                    userWorkshop.Vehicles.Add(newVehicle);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserWorkshopExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/UserWorkshops/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserWorkshop(int id)
        {
            var userWorkshop = await _context.UserWorkshops.FindAsync(id);
            if (userWorkshop == null)
            {
                return NotFound();
            }

            _context.UserWorkshops.Remove(userWorkshop);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserWorkshopExists(int id)
        {
            return _context.UserWorkshops.Any(e => e.Id == id);
        }

        /// <summary>
        /// Busca vehículos por número VIN o nombre del cliente en tiempo real.
        /// </summary>
        /// <param name="searchTerm">Término de búsqueda (VIN o nombre del cliente)</param>
        /// <returns>Lista de VehicleSearchDto que coinciden con el término de búsqueda</returns>
        [HttpGet("searchVehicles")]
        public async Task<ActionResult<List<VehicleSearchDto>>> SearchVehicles([FromQuery] string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return BadRequest("El término de búsqueda no puede estar vacío.");
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
                return Ok(new { message = "No se encontraron vehículos que coincidan con la búsqueda." });
            }

            return Ok(vehicles);
        }

        /// <summary>
        /// Obtiene la lista completa de vehículos.
        /// </summary>
        /// <returns>Lista de VehicleSearchDto</returns>
        [HttpGet("vehicles")]
        public async Task<ActionResult<List<VehicleSearchDto>>> GetAllVehicles()
        {
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
                            OwnerName = $"{uw.Name} {uw.LastName}"
                        }
                    )
                    .ToListAsync();

                var result = vehicles.Select(v => new VehicleSearchDto
                {
                    Id = v.Id,
                    Vin = v.Vin,
                    Make = v.Make,
                    Model = v.Model,
                    OwnerName = v.OwnerName
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Error al obtener la lista de vehículos: {ex.Message}" });
            }
        }


        [HttpDelete("vehicle/{vin}")]
        public async Task<IActionResult> DeleteVehicleByVin(string vin)
        {
            try
            {
                var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Vin == vin);
                if (vehicle == null)
                {
                    return NotFound(new { message = $"No se encontró el vehículo con VIN '{vin}'." });
                }

                _context.Vehicles.Remove(vehicle);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = $"Error al eliminar el vehículo: {ex.Message}"
                });
            }
        }




        [HttpGet("vehicle/{id}")]
        public async Task<ActionResult<VehicleReadDto>> GetVehicleById(int id)
        {
            var vehicle = await _context.Vehicles
                .Include(v => v.UserWorkshop)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (vehicle == null)
            {
                return NotFound(new { message = $"No se encontró el vehículo con ID {id}." });
            }

            var vehicleReadDto = _mapper.Map<VehicleReadDto>(vehicle);
            return Ok(vehicleReadDto);
        }




    }
}
