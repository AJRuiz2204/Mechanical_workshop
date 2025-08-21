using Mechanical_workshop.Models;

namespace Mechanical_workshop.Repositories.Interfaces
{
    public interface IWorkshopSettingsRepository
    {
        Task<WorkshopSettings?> GetLatestAsync();
        Task<WorkshopSettings?> GetByIdAsync(int id);
        Task<WorkshopSettings> CreateAsync(WorkshopSettings workshopSettings);
        Task<WorkshopSettings> UpdateAsync(WorkshopSettings workshopSettings);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}