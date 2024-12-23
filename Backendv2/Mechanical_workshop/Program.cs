using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Profiles;
using AutoMapper;

var builder = WebApplication.CreateBuilder(args);

// Obtener la cadena de conexión desde appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Registrar el DbContext con la base de datos (usando Pomelo.EntityFrameworkCore.MySql)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Ajusta la URL al frontend
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Registrar AutoMapper
builder.Services.AddAutoMapper(typeof(UserWorkshopProfile).Assembly);

// Registrar Controladores con Vistas y APIs
builder.Services.AddControllersWithViews();

// Agregar Swagger para documentación de API (opcional pero recomendado)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configuración del pipeline de solicitud HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Aplicar la política CORS antes de la autorización
app.UseCors("AllowFrontend");

app.UseAuthorization();

// Mapear controladores basados en atributos
app.MapControllers();

// Definir la ruta por defecto para los controladores MVC
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
