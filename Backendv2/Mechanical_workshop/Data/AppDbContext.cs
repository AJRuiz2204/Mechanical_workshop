// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Models;

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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configuraciones adicionales si es necesario
            base.OnModelCreating(modelBuilder);
        }
    }
}
