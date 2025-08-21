using Mechanical_workshop.Models;

namespace Mechanical_workshop.Repositories.Interfaces
{
    public interface IEstimateRepository
    {
        Task<IEnumerable<Estimate>> GetAllAsync();
        Task<Estimate?> GetByIdAsync(int id);
        Task<Estimate?> GetByIdWithDetailsAsync(int id);
        Task<Estimate?> GetByIdWithUserWorkshopAsync(int id);
        Task<Estimate> CreateAsync(Estimate estimate);
        Task<Estimate> UpdateAsync(Estimate estimate);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}