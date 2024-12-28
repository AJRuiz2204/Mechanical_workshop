using AutoMapper;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;

namespace Mechanical_workshop.Profiles
{
    public class DiagnosticProfile : Profile
    {
        public DiagnosticProfile()
        {
            // Vehicle -> VehicleReadDto
            CreateMap<Vehicle, VehicleReadDto>();

            // Diagnostic -> DiagnosticReadDto
            CreateMap<Diagnostic, DiagnosticReadDto>()
                .ForMember(dest => dest.Vehicle, opt => opt.MapFrom(src => src.Vehicle));
        }
    }
}   
