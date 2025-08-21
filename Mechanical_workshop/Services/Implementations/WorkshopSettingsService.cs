using AutoMapper;
using Microsoft.Extensions.Logging;
using Mechanical_workshop.DTOs;
using Mechanical_workshop.Models;
using Mechanical_workshop.Repositories.Interfaces;
using Mechanical_workshop.Services.Interfaces;

namespace Mechanical_workshop.Services.Implementations
{
    public class WorkshopSettingsService : IWorkshopSettingsService
    {
        private readonly IWorkshopSettingsRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<WorkshopSettingsService> _logger;

        public WorkshopSettingsService(
            IWorkshopSettingsRepository repository,
            IMapper mapper,
            ILogger<WorkshopSettingsService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<WorkshopSettingsReadDto?> GetWorkshopSettingsAsync()
        {
            try
            {
                var settings = await _repository.GetLatestAsync();
                if (settings == null)
                {
                    _logger.LogWarning("No se encontraron configuraciones del taller");
                    return null;
                }

                return _mapper.Map<WorkshopSettingsReadDto>(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la configuración del taller");
                throw;
            }
        }

        public async Task<WorkshopSettingsReadDto> CreateWorkshopSettingsAsync(WorkshopSettingsCreateDto createDto)
        {
            try
            {
                var workshopSettings = _mapper.Map<WorkshopSettings>(createDto);
                var createdSettings = await _repository.CreateAsync(workshopSettings);
                
                _logger.LogInformation("Configuración del taller creada con ID: {Id}", createdSettings.Id);
                return _mapper.Map<WorkshopSettingsReadDto>(createdSettings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la configuración del taller");
                throw;
            }
        }

        public async Task<bool> UpdateWorkshopSettingsAsync(int id, WorkshopSettingsUpdateDto updateDto)
        {
            try
            {
                var existingSettings = await _repository.GetByIdAsync(id);
                if (existingSettings == null)
                {
                    _logger.LogWarning("No se encontró configuración del taller con ID: {Id}", id);
                    return false;
                }

                _mapper.Map(updateDto, existingSettings);
                await _repository.UpdateAsync(existingSettings);
                
                _logger.LogInformation("Configuración del taller actualizada con ID: {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la configuración del taller con ID: {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteWorkshopSettingsAsync(int id)
        {
            try
            {
                var deleted = await _repository.DeleteAsync(id);
                if (deleted)
                {
                    _logger.LogInformation("Configuración del taller eliminada con ID: {Id}", id);
                }
                else
                {
                    _logger.LogWarning("No se encontró configuración del taller con ID: {Id} para eliminar", id);
                }
                return deleted;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la configuración del taller con ID: {Id}", id);
                throw;
            }
        }

        public async Task<bool> WorkshopSettingsExistsAsync(int id)
        {
            return await _repository.ExistsAsync(id);
        }
    }
}