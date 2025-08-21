using Mechanical_workshop.DTOs;

namespace Mechanical_workshop.Services.Interfaces
{
    public interface IWorkshopSettingsService
    {
        Task<WorkshopSettingsReadDto?> GetWorkshopSettingsAsync();
        Task<WorkshopSettingsReadDto> CreateWorkshopSettingsAsync(WorkshopSettingsCreateDto createDto);
        Task<bool> UpdateWorkshopSettingsAsync(int id, WorkshopSettingsUpdateDto updateDto);
        Task<bool> DeleteWorkshopSettingsAsync(int id);
        Task<bool> WorkshopSettingsExistsAsync(int id);
    }
}