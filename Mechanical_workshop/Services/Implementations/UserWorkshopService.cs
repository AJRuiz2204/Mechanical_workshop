using AutoMapper;
using Microsoft.Extensions.Logging;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using Mechanical_workshop.Repositories.Interfaces;
using Mechanical_workshop.Services.Interfaces;

namespace Mechanical_workshop.Services.Implementations
{
    public class UserWorkshopService : IUserWorkshopService
    {
        private readonly IUserWorkshopRepository _repository;
        private readonly IVehicleRepository _vehicleRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<UserWorkshopService> _logger;

        public UserWorkshopService(
            IUserWorkshopRepository repository,
            IVehicleRepository vehicleRepository,
            IMapper mapper,
            ILogger<UserWorkshopService> logger)
        {
            _repository = repository;
            _vehicleRepository = vehicleRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<UserWorkshopReadDto>> GetAllUserWorkshopsAsync()
        {
            try
            {
                var userWorkshops = await _repository.GetAllAsync();
                _logger.LogInformation("Retrieved {Count} UserWorkshops.", userWorkshops.Count());
                return _mapper.Map<IEnumerable<UserWorkshopReadDto>>(userWorkshops);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los talleres de usuario");
                throw;
            }
        }

        public async Task<UserWorkshopReadDto?> GetUserWorkshopByIdAsync(int id)
        {
            try
            {
                var userWorkshop = await _repository.GetByIdWithVehiclesAsync(id);
                if (userWorkshop == null)
                {
                    _logger.LogWarning("No se encontró taller de usuario con ID: {Id}", id);
                    return null;
                }

                return _mapper.Map<UserWorkshopReadDto>(userWorkshop);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el taller de usuario con ID: {Id}", id);
                throw;
            }
        }

        public async Task<UserWorkshopReadDto> CreateUserWorkshopAsync(UserWorkshopCreateDto createDto)
        {
            try
            {
                var userWorkshop = _mapper.Map<UserWorkshop>(createDto);
                userWorkshop.Vehicles = new List<Vehicle>();

                // Process each vehicle in the creation DTO
                if (createDto.Vehicles != null)
                {
                    foreach (var vehicleDto in createDto.Vehicles)
                    {
                        if (string.IsNullOrWhiteSpace(vehicleDto.Vin))
                        {
                            _logger.LogWarning("A VehicleDto with an empty VIN will be skipped.");
                            continue;
                        }

                        _logger.LogInformation(
                            "Processing VehicleDto => VIN: {Vin}, Make: {Make}, Model: {Model}",
                            vehicleDto.Vin, vehicleDto.Make, vehicleDto.Model
                        );

                        // Check if vehicle already exists
                        var existingVehicle = await _vehicleRepository.GetByVinAsync(vehicleDto.Vin);

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
                }

                _logger.LogInformation(
                    "After processing vehicles, userWorkshop.Vehicles.Count = {Count}",
                    userWorkshop.Vehicles.Count
                );

                var createdUserWorkshop = await _repository.CreateAsync(userWorkshop);
                
                _logger.LogInformation("Taller de usuario creado con ID: {Id}", createdUserWorkshop.Id);
                return _mapper.Map<UserWorkshopReadDto>(createdUserWorkshop);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el taller de usuario");
                throw;
            }
        }

        public async Task<bool> UpdateUserWorkshopAsync(int id, UserWorkshopCreateDto updateDto)
        {
            try
            {
                var existingUserWorkshop = await _repository.GetByIdAsync(id);
                if (existingUserWorkshop == null)
                {
                    _logger.LogWarning("No se encontró taller de usuario con ID: {Id}", id);
                    return false;
                }

                _mapper.Map(updateDto, existingUserWorkshop);
                await _repository.UpdateAsync(existingUserWorkshop);
                
                _logger.LogInformation("Taller de usuario actualizado con ID: {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el taller de usuario con ID: {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteUserWorkshopAsync(int id)
        {
            try
            {
                var deleted = await _repository.DeleteAsync(id);
                if (deleted)
                {
                    _logger.LogInformation("Taller de usuario eliminado con ID: {Id}", id);
                }
                else
                {
                    _logger.LogWarning("No se encontró taller de usuario con ID: {Id} para eliminar", id);
                }
                return deleted;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar el taller de usuario con ID: {Id}", id);
                throw;
            }
        }

        public async Task<bool> UserWorkshopExistsAsync(int id)
        {
            return await _repository.ExistsAsync(id);
        }
    }
}