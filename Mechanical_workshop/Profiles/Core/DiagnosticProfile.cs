using AutoMapper;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;

namespace Mechanical_workshop.Profiles
{
    public class DiagnosticProfile : Profile
    {
        public DiagnosticProfile()
        {
            // Mapeo de Vehicle a VehicleReadDto
            CreateMap<Vehicle, VehicleReadDto>();
            // Mapeo de UserWorkshop a UserWorkshopReadDto (definido en UserWorkshopDtos.cs)
            CreateMap<UserWorkshop, UserWorkshopReadDto>();

            // Mapeo de Diagnostic a DiagnosticReadDto, incluyendo la propiedad UserWorkshop
            CreateMap<Diagnostic, DiagnosticReadDto>()
                .ForMember(dest => dest.Vehicle, opt => opt.MapFrom(src => src.Vehicle))
                .ForMember(dest => dest.UserWorkshop, opt => opt.MapFrom(src => src.Vehicle.UserWorkshop))
                // Nuevo mapeo para AssignedTechnician
                .ForMember(dest => dest.AssignedTechnician, opt => opt.MapFrom(src => src.AssignedTechnician));
        }
    }
}
