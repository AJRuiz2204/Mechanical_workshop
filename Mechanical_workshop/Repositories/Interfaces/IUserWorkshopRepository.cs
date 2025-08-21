using Mechanical_workshop.Models;

namespace Mechanical_workshop.Repositories.Interfaces
{
    public interface IUserWorkshopRepository
    {
        Task<IEnumerable<UserWorkshop>> GetAllAsync();
        Task<UserWorkshop?> GetByIdAsync(int id);
        Task<UserWorkshop?> GetByIdWithVehiclesAsync(int id);
        Task<UserWorkshop> CreateAsync(UserWorkshop userWorkshop);
        Task<UserWorkshop> UpdateAsync(UserWorkshop userWorkshop);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}