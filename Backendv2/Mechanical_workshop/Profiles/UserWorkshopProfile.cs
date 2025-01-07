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
                .ForMember(dest => dest.NoTax, opt => opt.MapFrom(src => src.NoTax));

            // Mapeo entre UserWorkshopCreateDto y UserWorkshop
            CreateMap<UserWorkshopCreateDto, UserWorkshop>()
                .ForMember(dest => dest.Vehicles, opt => opt.Ignore()); // Las relaciones se manejarán manualmente

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

            // Mapeo para leer UserWorkshop
            CreateMap<UserWorkshop, UserWorkshopReadDto>()
                .ForMember(dest => dest.Vehicles, opt => opt.MapFrom(src => src.Vehicles));

            // Mapeo para crear UserWorkshop
            CreateMap<UserWorkshopCreateDto, UserWorkshop>()
                .ForMember(dest => dest.Vehicles, opt => opt.Ignore());

            // Mapeo para Vehicle y VehicleDto
            CreateMap<Vehicle, VehicleDto>().ReverseMap();

            // Mapeo para actualizar UserWorkshop
            CreateMap<UserWorkshopUpdateDto, UserWorkshop>()
                .ForMember(dest => dest.Vehicles, opt => opt.Ignore());

            // Mapeo para VehicleSearchDto
            CreateMap<Vehicle, VehicleSearchDto>()
                .ForMember(dest => dest.OwnerName, opt => opt.MapFrom(src => $"{src.UserWorkshop.Name} {src.UserWorkshop.LastName}"));
        }
    }
}
