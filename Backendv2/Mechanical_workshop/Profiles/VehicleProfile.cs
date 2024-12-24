using AutoMapper;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;

namespace Mechanical_workshop.Profiles
{
    public class VehicleProfile : Profile
    {
        public VehicleProfile()
        {
            CreateMap<Vehicle, VehicleReadDto>()
                .ForMember(dest => dest.UserWorkshop, opt => opt.MapFrom(src => src.UserWorkshop));

            CreateMap<UserWorkshop, UserWorkshopReadDto>();
        }
    }
}
