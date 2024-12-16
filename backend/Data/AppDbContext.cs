// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // DbSet para cada entidad
    public DbSet<User> Users { get; set; }
    public DbSet<UserWorkshop> UserWorkshops { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Diagnostic> Diagnostics { get; set; }
    public DbSet<Estimate> Estimates { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Reports> Reports { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuraciones adicionales (opcional)
        // Por ejemplo, establecer el nombre de tablas:
        // modelBuilder.Entity<User>().ToTable("Users");
        // modelBuilder.Entity<Vehicle>().ToTable("Vehicles");
    }
}
