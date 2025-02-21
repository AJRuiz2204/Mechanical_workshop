// Controllers/VehicleDiagnosticController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Models;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Data;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehicleDiagnosticController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VehicleDiagnosticController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/VehicleDiagnostic
        [HttpGet]
        public async Task<IActionResult> GetVehicleDiagnostics()
        {
            // Se incluyen las relaciones: Owner (UserWorkshop), Diagnósticos y dentro de éstos, la colección TechnicianDiagnostics
            var vehicles = await _context.Vehicles
                .Include(v => v.UserWorkshop)
                .Include(v => v.Diagnostics)
                    .ThenInclude(d => d.TechnicianDiagnostics)
                .ToListAsync();

            var result = vehicles.Select(v => new VehicleDiagnosticOwnerDto
            {
                Vehicle = new VehicleDto
                {
                    Id = v.Id,
                    Vin = v.Vin,
                    Make = v.Make,
                    Model = v.Model,
                    Year = v.Year,
                    Engine = v.Engine,
                    Plate = v.Plate,
                    State = v.State,
                    Status = v.Status
                },
                Owner = new UserWorkshopReadDto
                {
                    Id = v.UserWorkshop.Id,
                    Email = v.UserWorkshop.Email,
                    Name = v.UserWorkshop.Name,
                    Username = v.UserWorkshop.Email, // Ajusta según sea necesario
                    LastName = v.UserWorkshop.LastName,
                    NoTax = v.UserWorkshop.NoTax,
                    Address = v.UserWorkshop.Address,
                    City = v.UserWorkshop.City,
                    State = v.UserWorkshop.State,
                    Zip = v.UserWorkshop.Zip,
                    PrimaryNumber = v.UserWorkshop.PrimaryNumber,
                    SecondaryNumber = v.UserWorkshop.SecondaryNumber,
                    Vehicles = new List<VehicleDto>() // Si requieres mapear la lista de vehículos
                },
                // Mapeo de todos los diagnósticos asociados a este vehículo
                Diagnostics = v.Diagnostics.Select(d => new DiagnosticInfoDto
                {
                    DiagnosticId = d.Id,
                    ReasonForVisit = d.ReasonForVisit,
                    AssignedTechnician = d.AssignedTechnician,
                    TechnicianDiagnostics = d.TechnicianDiagnostics?.Select(td => new TechnicianDiagnosticReadDto
                    {
                        Id = td.Id,
                        DiagnosticId = d.Id,
                        // Opción: puedes utilizar td.ReasonForVisit si existe, o mantener d.ReasonForVisit
                        ReasonForVisit = d.ReasonForVisit,
                        Mileage = td.Mileage,
                        ExtendedDiagnostic = td.ExtendedDiagnostic,
                        VehicleId = d.VehicleId,
                    }).ToList() ?? new List<TechnicianDiagnosticReadDto>()
                }).ToList()
            }).ToList();

            return Ok(result);
        }
    }
}
