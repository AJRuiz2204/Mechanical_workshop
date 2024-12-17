using AutoMapper;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;

namespace Mechanical_workshop.Profiles
{
    public class UserWorkshopProfile : Profile
    {
        public UserWorkshopProfile()
        {
            CreateMap<UserWorkshop, UserWorkshopReadDto>();
            CreateMap<UserWorkshopCreateDto, UserWorkshop>();
            CreateMap<VehicleDto, Vehicle>();
            CreateMap<Vehicle, VehicleDto>();
        }
    }
}
