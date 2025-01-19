using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Profiles;
using AutoMapper;
using Mechanical_workshop.Models;
using Microsoft.AspNetCore.Mvc.NewtonsoftJson;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
    });

builder.Services.AddAutoMapper(typeof(UserWorkshopProfile).Assembly);
builder.Services.AddAutoMapper(typeof(DiagnosticProfile).Assembly);
builder.Services.AddAutoMapper(typeof(VehicleProfile).Assembly, typeof(DiagnosticProfile).Assembly);
builder.Services.AddAutoMapper(typeof(EntityProfile).Assembly);
builder.Services.AddAutoMapper(typeof(EstimatesProfile).Assembly);
builder.Services.AddAutoMapper(typeof(WorkshopSettings).Assembly);
builder.Services.AddAutoMapper(typeof(LaborTaxMarkupSettingsProfile).Assembly);
builder.Services.AddAutoMapper(typeof(VehicleProfile).Assembly);

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

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
