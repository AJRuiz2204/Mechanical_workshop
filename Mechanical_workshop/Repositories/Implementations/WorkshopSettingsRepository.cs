using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Models;
using Mechanical_workshop.Repositories.Interfaces;

namespace Mechanical_workshop.Repositories.Implementations
{
    public class WorkshopSettingsRepository : IWorkshopSettingsRepository
    {
        private readonly AppDbContext _context;

        public WorkshopSettingsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<WorkshopSettings?> GetLatestAsync()
        {
            return await _context.WorkshopSettings
                .OrderByDescending(ws => ws.LastUpdated)
                .FirstOrDefaultAsync();
        }

        public async Task<WorkshopSettings?> GetByIdAsync(int id)
        {
            return await _context.WorkshopSettings.FindAsync(id);
        }

        public async Task<WorkshopSettings> CreateAsync(WorkshopSettings workshopSettings)
        {
            _context.WorkshopSettings.Add(workshopSettings);
            await _context.SaveChangesAsync();
            return workshopSettings;
        }

        public async Task<WorkshopSettings> UpdateAsync(WorkshopSettings workshopSettings)
        {
            workshopSettings.LastUpdated = DateTime.UtcNow;
            _context.Entry(workshopSettings).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return workshopSettings;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var workshopSettings = await _context.WorkshopSettings.FindAsync(id);
            if (workshopSettings == null) return false;

            _context.WorkshopSettings.Remove(workshopSettings);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.WorkshopSettings.AnyAsync(ws => ws.Id == id);
        }
    }
}