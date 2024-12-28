using AutoMapper;
using Mechanical_workshop.Models;
using Mechanical_workshop.Dtos;

public class VehicleProfile : Profile
{
    public VehicleProfile()
    {
        // De Vehicle -> VehicleReadDto
        CreateMap<Vehicle, VehicleReadDto>();

        // De VehicleDto -> Vehicle
        CreateMap<VehicleDto, Vehicle>();
    }
}
