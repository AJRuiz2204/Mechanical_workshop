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
                .ForMember(dest => dest.Vehicles, opt => opt.MapFrom(src => src.Vehicles))
                .ForMember(dest => dest.NoTax, opt => opt.MapFrom(src => src.NoTax))
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))
                .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
                .ForMember(dest => dest.State, opt => opt.MapFrom(src => src.State))
                .ForMember(dest => dest.Zip, opt => opt.MapFrom(src => src.Zip))
                .ForMember(dest => dest.PrimaryNumber, opt => opt.MapFrom(src => src.PrimaryNumber))
                .ForMember(dest => dest.SecondaryNumber, opt => opt.MapFrom(src => src.SecondaryNumber))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName));

            // Mapeo entre UserWorkshopCreateDto y UserWorkshop
            CreateMap<UserWorkshopCreateDto, UserWorkshop>()
                .ForMember(dest => dest.Vehicles, opt => opt.Ignore()); // Manejar manualmente para evitar duplicados

            // Mapeo entre Vehicle y VehicleDto
            CreateMap<Vehicle, VehicleDto>().ReverseMap();

            // Mapeo para crear
            CreateMap<UserWorkshopCreateDto, UserWorkshop>();
            CreateMap<VehicleDto, Vehicle>();

            // Mapeo para leer
            CreateMap<UserWorkshop, UserWorkshopReadDto>();
            CreateMap<Vehicle, VehicleDto>();

            // Mapeo para actualizar
            CreateMap<UserWorkshopUpdateDto, UserWorkshop>();
            CreateMap<VehicleDto, Vehicle>()
                .ForMember(dest => dest.UserWorkshopId, opt => opt.Ignore());

            // Mapeo para VehicleSearchDto
            CreateMap<Vehicle, VehicleSearchDto>()
                .ForMember(dest => dest.OwnerName, opt => opt.MapFrom(src => $"{src.UserWorkshop.Name} {src.UserWorkshop.LastName}"));
        }
    }
}
