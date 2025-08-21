using Mechanical_workshop.Dtos;

namespace Mechanical_workshop.Services.Interfaces
{
    public interface IEstimateService
    {
        Task<IEnumerable<EstimateFullDto>> GetAllEstimatesAsync();
        Task<EstimateFullDto?> GetEstimateByIdAsync(int id);
        Task<EstimateFullDto?> GetEstimateWithUserWorkshopAsync(int id);
        Task<EstimateFullDto> CreateEstimateAsync(EstimateCreateDto createDto);
        Task<bool> UpdateEstimateAsync(int id, EstimateUpdateDto updateDto);
        Task<bool> DeleteEstimateAsync(int id);
        Task<bool> EstimateExistsAsync(int id);
    }
}