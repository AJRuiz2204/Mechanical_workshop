using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Profiles;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Mechanical_workshop.Models;
using Microsoft.AspNetCore.Mvc.NewtonsoftJson;
using System.Text;
using Mechanical_workshop.MappingProfiles;
using MechanicalWorkshop.Profiles;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"];

if (string.IsNullOrEmpty(secretKey))
{
    throw new InvalidOperationException("JWT Secret Key is missing in appsettings.json");
}

var key = Encoding.UTF8.GetBytes(secretKey);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(opts => {
        opts.JsonSerializerOptions.NumberHandling =
            JsonNumberHandling.AllowReadingFromString |
            JsonNumberHandling.AllowNamedFloatingPointLiterals;
    });

builder.Services.AddCors(options => 
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("https://app2.j-benz.com", "http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
    });

// Register AutoMapper with all profiles from the assembly
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// Register Repositories
builder.Services.AddScoped<Mechanical_workshop.Repositories.Interfaces.IWorkshopSettingsRepository, Mechanical_workshop.Repositories.Implementations.WorkshopSettingsRepository>();
builder.Services.AddScoped<Mechanical_workshop.Repositories.Interfaces.IUserWorkshopRepository, Mechanical_workshop.Repositories.Implementations.UserWorkshopRepository>();
builder.Services.AddScoped<Mechanical_workshop.Repositories.Interfaces.IVehicleRepository, Mechanical_workshop.Repositories.Implementations.VehicleRepository>();
builder.Services.AddScoped<Mechanical_workshop.Repositories.Interfaces.IEstimateRepository, Mechanical_workshop.Repositories.Implementations.EstimateRepository>();

// Register Services
builder.Services.AddScoped<Mechanical_workshop.Services.Interfaces.IWorkshopSettingsService, Mechanical_workshop.Services.Implementations.WorkshopSettingsService>();
builder.Services.AddScoped<Mechanical_workshop.Services.Interfaces.IUserWorkshopService, Mechanical_workshop.Services.Implementations.UserWorkshopService>();
builder.Services.AddScoped<Mechanical_workshop.Services.Interfaces.IEstimateService, Mechanical_workshop.Services.Implementations.EstimateService>();

builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

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

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
