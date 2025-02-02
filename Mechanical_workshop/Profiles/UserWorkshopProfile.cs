using AutoMapper;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;

namespace Mechanical_workshop.Profiles
{
    public class UserWorkshopProfile : Profile
    {
        public UserWorkshopProfile()
        {
            // Mapping between UserWorkshop and UserWorkshopReadDto
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

            // Mapping between UserWorkshopCreateDto and UserWorkshop
            CreateMap<UserWorkshopCreateDto, UserWorkshop>()
                .ForMember(dest => dest.Vehicles, opt => opt.Ignore()); // Handle manually to avoid duplicates

            // Mapping between Vehicle and VehicleDto with reverse mapping
            CreateMap<Vehicle, VehicleDto>().ReverseMap();

            // Mapping for creation
            CreateMap<UserWorkshopCreateDto, UserWorkshop>();
            CreateMap<VehicleDto, Vehicle>();

            // Mapping for reading
            CreateMap<UserWorkshop, UserWorkshopReadDto>();
            CreateMap<Vehicle, VehicleDto>();

            // Mapping for updating
            CreateMap<UserWorkshopUpdateDto, UserWorkshop>();
            CreateMap<VehicleDto, Vehicle>()
                .ForMember(dest => dest.UserWorkshopId, opt => opt.Ignore());

            // Mapping for VehicleSearchDto
            CreateMap<Vehicle, VehicleSearchDto>()
                .ForMember(dest => dest.OwnerName, opt => opt.MapFrom(src => $"{src.UserWorkshop.Name} {src.UserWorkshop.LastName}"));

            // Additional mappings for updating UserWorkshop
            CreateMap<UserWorkshopUpdateDto, UserWorkshop>()
                .ForMember(dest => dest.Vehicles, opt => opt.Ignore());

            CreateMap<VehicleDto, Vehicle>()
                .ForMember(dest => dest.UserWorkshop, opt => opt.Ignore());

            // Mapping for updating UserWorkshop, ignoring Vehicles to handle manually
            CreateMap<UserWorkshopUpdateDto, UserWorkshop>()
                .ForMember(dest => dest.Vehicles, opt => opt.Ignore());

            // Mapping for updating Vehicles, ignoring UserWorkshop to avoid circular references
            CreateMap<VehicleDto, Vehicle>()
                .ForMember(dest => dest.UserWorkshop, opt => opt.Ignore()) // Ignore UserWorkshop to avoid circular references
                .ForMember(dest => dest.UserWorkshopId, opt => opt.Ignore()); // Ignore UserWorkshopId to avoid circular references

            CreateMap<VehicleDto, Vehicle>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())  // Ignora el Id para no modificarlo
                .ForMember(dest => dest.UserWorkshop, opt => opt.Ignore())
                .ForMember(dest => dest.UserWorkshopId, opt => opt.Ignore());
        }
    }
}
