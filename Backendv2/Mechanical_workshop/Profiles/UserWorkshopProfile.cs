using AutoMapper;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;

namespace Mechanical_workshop.Profiles
{
    public class UserWorkshopProfile : Profile
    {
        public UserWorkshopProfile()
        {
            // Mapeo entre UserWorkshop y UserWorkshopReadDto
            CreateMap<UserWorkshop, UserWorkshopReadDto>()
                .ForMember(dest => dest.Vehicles, opt => opt.MapFrom(src => src.Vehicles));

            // Mapeo entre UserWorkshopCreateDto y UserWorkshop
            CreateMap<UserWorkshopCreateDto, UserWorkshop>()
                .ForMember(dest => dest.Vehicles, opt => opt.Ignore()); // Las relaciones se manejarán manualmente

            // Mapeo entre Vehicle y VehicleDto
            CreateMap<Vehicle, VehicleDto>().ReverseMap();
        }
    }
}
