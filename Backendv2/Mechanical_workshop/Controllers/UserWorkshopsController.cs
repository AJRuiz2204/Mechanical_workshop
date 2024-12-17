using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mechanical_workshop.Data;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using AutoMapper;

namespace Mechanical_workshop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserWorkshopsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public UserWorkshopsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpPost]
        public async Task<ActionResult<UserWorkshopReadDto>> CreateUserWorkshop(UserWorkshopCreateDto userWorkshopDto)
        {
            var userWorkshop = _mapper.Map<UserWorkshop>(userWorkshopDto);

            foreach (var vehicleDto in userWorkshopDto.Vehicles)
            {
                userWorkshop.Vehicles.Add(new Vehicle
                {
                    Vin = vehicleDto.Vin,
                    Make = vehicleDto.Make,
                    Model = vehicleDto.Model,
                    Year = vehicleDto.Year,
                    Engine = vehicleDto.Engine,
                    Plate = vehicleDto.Plate,
                    State = vehicleDto.State
                });
            }

            _context.UserWorkshops.Add(userWorkshop);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<UserWorkshopReadDto>(userWorkshop);
            return CreatedAtAction(nameof(GetUserWorkshop), new { id = userWorkshop.Id }, readDto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserWorkshopReadDto>> GetUserWorkshop(int id)
        {
            var userWorkshop = await _context.UserWorkshops
                .Include(uw => uw.Vehicles)
                .FirstOrDefaultAsync(uw => uw.Id == id);

            if (userWorkshop == null) return NotFound();

            return Ok(_mapper.Map<UserWorkshopReadDto>(userWorkshop));
        }
    }
}
