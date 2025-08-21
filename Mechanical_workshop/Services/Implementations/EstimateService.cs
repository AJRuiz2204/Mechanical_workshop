using AutoMapper;
using Microsoft.Extensions.Logging;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using Mechanical_workshop.Repositories.Interfaces;
using Mechanical_workshop.Services.Interfaces;

namespace Mechanical_workshop.Services.Implementations
{
    public class EstimateService : IEstimateService
    {
        private readonly IEstimateRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<EstimateService> _logger;

        public EstimateService(
            IEstimateRepository repository,
            IMapper mapper,
            ILogger<EstimateService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<EstimateFullDto>> GetAllEstimatesAsync()
        {
            try
            {
                var estimates = await _repository.GetAllAsync();
                _logger.LogInformation("Retrieved {Count} estimates", estimates.Count());
                return _mapper.Map<IEnumerable<EstimateFullDto>>(estimates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving estimates");
                throw;
            }
        }

        public async Task<EstimateFullDto?> GetEstimateByIdAsync(int id)
        {
            try
            {
                var estimate = await _repository.GetByIdWithDetailsAsync(id);
                if (estimate == null)
                {
                    _logger.LogWarning("Estimate with ID {Id} not found", id);
                    return null;
                }

                return _mapper.Map<EstimateFullDto>(estimate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving estimate with ID: {Id}", id);
                throw;
            }
        }

        public async Task<EstimateFullDto?> GetEstimateWithUserWorkshopAsync(int id)
        {
            try
            {
                var estimate = await _repository.GetByIdWithUserWorkshopAsync(id);
                if (estimate == null)
                {
                    _logger.LogWarning("Estimate with ID {Id} not found", id);
                    return null;
                }

                return _mapper.Map<EstimateFullDto>(estimate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving estimate with user workshop, ID: {Id}", id);
                throw;
            }
        }

        public async Task<EstimateFullDto> CreateEstimateAsync(EstimateCreateDto createDto)
        {
            try
            {
                var estimate = _mapper.Map<Estimate>(createDto);
                var createdEstimate = await _repository.CreateAsync(estimate);
                
                _logger.LogInformation("Estimate created with ID: {Id}", createdEstimate.ID);
                return _mapper.Map<EstimateFullDto>(createdEstimate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating estimate");
                throw;
            }
        }

        public async Task<bool> UpdateEstimateAsync(int id, EstimateUpdateDto updateDto)
        {
            try
            {
                var existingEstimate = await _repository.GetByIdAsync(id);
                if (existingEstimate == null)
                {
                    _logger.LogWarning("Estimate with ID {Id} not found for update", id);
                    return false;
                }

                _mapper.Map(updateDto, existingEstimate);
                await _repository.UpdateAsync(existingEstimate);
                
                _logger.LogInformation("Estimate updated with ID: {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating estimate with ID: {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteEstimateAsync(int id)
        {
            try
            {
                var deleted = await _repository.DeleteAsync(id);
                if (deleted)
                {
                    _logger.LogInformation("Estimate deleted with ID: {Id}", id);
                }
                else
                {
                    _logger.LogWarning("Estimate with ID {Id} not found for deletion", id);
                }
                return deleted;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting estimate with ID: {Id}", id);
                throw;
            }
        }

        public async Task<bool> EstimateExistsAsync(int id)
        {
            return await _repository.ExistsAsync(id);
        }
    }
}