// Program.cs
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using AutoMapper;
using Mechanical_workshop.Profiles; // Asegúrate de que las rutas sean correctas

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
        policy.WithOrigins("http://localhost:5173") // Ajusta a tu frontend
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});




// Registrar AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Registrar Controladores con Vistas y APIs
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configuración del pipeline de solicitud HTTP
if (!app.Environment.IsDevelopment())
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

// Aplicar middleware
app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthorization();

// Definir la ruta por defecto para los controladores MVC (si tienes vistas)
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
