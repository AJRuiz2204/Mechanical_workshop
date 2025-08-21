using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Models;
using Mechanical_workshop.Repositories.Interfaces;

namespace Mechanical_workshop.Repositories.Implementations
{
    public class EstimateRepository : IEstimateRepository
    {
        private readonly AppDbContext _context;

        public EstimateRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Estimate>> GetAllAsync()
        {
            return await _context.Estimates
                .Include(e => e.Vehicle)
                    .ThenInclude(v => v.UserWorkshop)
                .Include(e => e.TechnicianDiagnostic)
                    .ThenInclude(td => td.Diagnostic)
                .Include(e => e.Parts)
                .Include(e => e.Labors)
                .Include(e => e.FlatFees)
                .ToListAsync();
        }

        public async Task<Estimate?> GetByIdAsync(int id)
        {
            return await _context.Estimates.FindAsync(id);
        }

        public async Task<Estimate?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.Estimates
                .Include(e => e.Vehicle)
                    .ThenInclude(v => v.UserWorkshop)
                .Include(e => e.TechnicianDiagnostic)
                    .ThenInclude(td => td.Diagnostic)
                .Include(e => e.Parts)
                .Include(e => e.Labors)
                .Include(e => e.FlatFees)
                .FirstOrDefaultAsync(e => e.ID == id);
        }

        public async Task<Estimate?> GetByIdWithUserWorkshopAsync(int id)
        {
            return await _context.Estimates
                .Include(e => e.Vehicle)
                    .ThenInclude(v => v.UserWorkshop)
                .FirstOrDefaultAsync(e => e.ID == id);
        }

        public async Task<Estimate> CreateAsync(Estimate estimate)
        {
            _context.Estimates.Add(estimate);
            await _context.SaveChangesAsync();
            return estimate;
        }

        public async Task<Estimate> UpdateAsync(Estimate estimate)
        {
            _context.Entry(estimate).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return estimate;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var estimate = await _context.Estimates.FindAsync(id);
            if (estimate == null) return false;

            _context.Estimates.Remove(estimate);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Estimates.AnyAsync(e => e.ID == id);
        }
    }
}