using Mechanical_workshop.Models;

namespace Mechanical_workshop.Repositories.Interfaces
{
    public interface IVehicleRepository
    {
        Task<Vehicle?> GetByVinAsync(string vin);
        Task<Vehicle> CreateAsync(Vehicle vehicle);
        Task<Vehicle> UpdateAsync(Vehicle vehicle);
        Task<bool> DeleteAsync(int id);
    }
}