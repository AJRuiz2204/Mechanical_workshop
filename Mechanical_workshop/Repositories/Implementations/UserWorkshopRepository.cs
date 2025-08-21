using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Models;
using Mechanical_workshop.Repositories.Interfaces;

namespace Mechanical_workshop.Repositories.Implementations
{
    public class UserWorkshopRepository : IUserWorkshopRepository
    {
        private readonly AppDbContext _context;

        public UserWorkshopRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserWorkshop>> GetAllAsync()
        {
            return await _context.UserWorkshops
                .Include(uw => uw.Vehicles)
                .ToListAsync();
        }

        public async Task<UserWorkshop?> GetByIdAsync(int id)
        {
            return await _context.UserWorkshops.FindAsync(id);
        }

        public async Task<UserWorkshop?> GetByIdWithVehiclesAsync(int id)
        {
            return await _context.UserWorkshops
                .Include(uw => uw.Vehicles)
                .FirstOrDefaultAsync(uw => uw.Id == id);
        }

        public async Task<UserWorkshop> CreateAsync(UserWorkshop userWorkshop)
        {
            _context.UserWorkshops.Add(userWorkshop);
            await _context.SaveChangesAsync();
            return userWorkshop;
        }

        public async Task<UserWorkshop> UpdateAsync(UserWorkshop userWorkshop)
        {
            _context.Entry(userWorkshop).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return userWorkshop;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var userWorkshop = await _context.UserWorkshops.FindAsync(id);
            if (userWorkshop == null) return false;

            _context.UserWorkshops.Remove(userWorkshop);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.UserWorkshops.AnyAsync(uw => uw.Id == id);
        }
    }
}