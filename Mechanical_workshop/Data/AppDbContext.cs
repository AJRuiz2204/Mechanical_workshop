using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Models;
using Mechanical_workshop.Controllers;
using System.Security.Cryptography.X509Certificates;

namespace Mechanical_workshop.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UserWorkshop> UserWorkshops { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Estimate> Estimates { get; set; }
        public DbSet<Diagnostic> Diagnostics { get; set; }
        public DbSet<TechnicianDiagnostic> TechnicianDiagnostics { get; set; }
        public DbSet<EstimatePart> EstimateParts { get; set; }
        public DbSet<EstimateLabor> EstimateLabors { get; set; }
        public DbSet<EstimateFlatFee> EstimateFlatFees { get; set; }
        public DbSet<WorkshopSettings> WorkshopSettings { get; set; }
        public DbSet<LaborTaxMarkupSettings> LaborTaxMarkupSettings { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserWorkshop>()
                .HasMany(uw => uw.Vehicles)
                .WithOne(v => v.UserWorkshop)
                .HasForeignKey(v => v.UserWorkshopId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Diagnostic>()
                .HasOne(d => d.Vehicle)
                .WithMany(v => v.Diagnostics)
                .HasForeignKey(d => d.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Diagnostic>()
                .HasMany(d => d.TechnicianDiagnostics)
                .WithOne(td => td.Diagnostic)
                .HasForeignKey(td => td.DiagnosticId)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
