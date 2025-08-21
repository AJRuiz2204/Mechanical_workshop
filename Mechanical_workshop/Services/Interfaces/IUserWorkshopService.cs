using Mechanical_workshop.Dtos;

namespace Mechanical_workshop.Services.Interfaces
{
    public interface IUserWorkshopService
    {
        Task<IEnumerable<UserWorkshopReadDto>> GetAllUserWorkshopsAsync();
        Task<UserWorkshopReadDto?> GetUserWorkshopByIdAsync(int id);
        Task<UserWorkshopReadDto> CreateUserWorkshopAsync(UserWorkshopCreateDto createDto);
        Task<bool> UpdateUserWorkshopAsync(int id, UserWorkshopCreateDto updateDto);
        Task<bool> DeleteUserWorkshopAsync(int id);
        Task<bool> UserWorkshopExistsAsync(int id);
    }
}