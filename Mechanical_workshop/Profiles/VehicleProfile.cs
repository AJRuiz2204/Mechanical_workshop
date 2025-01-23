using AutoMapper;
using Mechanical_workshop.Models;
using Mechanical_workshop.Dtos;

public class VehicleProfile : Profile
{
    public VehicleProfile()
    {
        CreateMap<Vehicle, VehicleReadDto>();
        CreateMap<VehicleDto, Vehicle>();
        CreateMap<UserWorkshop, UserWorkshopReadDto>();

        CreateMap<Vehicle, VehicleDto>().ReverseMap();

        CreateMap<UserWorkshopCreateDto, UserWorkshop>()
            .ForMember(dest => dest.Vehicles, opt => opt.Ignore());

        CreateMap<UserWorkshopUpdateDto, UserWorkshop>()
            .ForMember(dest => dest.Vehicles, opt => opt.Ignore());

    }
}
