using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Models;
using Mechanical_workshop.Controllers;
using System.Security.Cryptography.X509Certificates;

namespace Mechanical_workshop.Data
{
    /// <summary>
    /// Represents the application's database context.
    /// </summary>
    public class AppDbContext : DbContext
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AppDbContext"/> class.
        /// </summary>
        /// <param name="options">The options to be used by the DbContext.</param>
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
        public DbSet<Note> Notes { get; set; }
        public DbSet<AccountReceivable> AccountsReceivable { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<SalesReport> SalesReports { get; set; }
        public DbSet<SalesReportDetail> SalesReportDetails { get; set; }

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

            modelBuilder.Entity<Diagnostic>()
                .HasMany(d => d.Notes)
                .WithOne(n => n.Diagnostic)
                .HasForeignKey(n => n.DiagnosticId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AccountReceivable>(entity =>
            {
                entity.HasOne(ar => ar.Customer)
                    .WithMany(u => u.AccountsReceivable)
                    .HasForeignKey(ar => ar.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ar => ar.Estimate)
                    .WithOne(e => e.AccountReceivable)
                    .HasForeignKey<AccountReceivable>(ar => ar.EstimateId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasOne(p => p.AccountReceivable)
                    .WithMany(ar => ar.Payments)
                    .HasForeignKey(p => p.AccountReceivableId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<SalesReport>()
                .HasMany(sr => sr.Details)
                .WithOne(d => d.SalesReport)
                .HasForeignKey(d => d.SalesReportId)
                .OnDelete(DeleteBehavior.Cascade);

            // Hacer TechnicianDiagnosticID opcional
            modelBuilder.Entity<Estimate>()
                .Property(e => e.TechnicianDiagnosticID)
                .IsRequired(false);

            // Ajustar la relación para que no haga cascading y permita NULL
            modelBuilder.Entity<Estimate>()
                .HasOne(e => e.TechnicianDiagnostic)
                .WithMany()
                .HasForeignKey(e => e.TechnicianDiagnosticID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
