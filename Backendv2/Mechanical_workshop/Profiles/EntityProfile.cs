// Profiles/EntityProfile.cs
using AutoMapper;
using Mechanical_workshop.Models;
using Mechanical_workshop.Dtos;
using System.Linq;

namespace Mechanical_workshop.Profiles
{
    public class EntityProfile : Profile
    {
        public EntityProfile()
        {
            // Mapping entre Vehicle y VehicleReadDto
            CreateMap<Vehicle, VehicleReadDto>().ReverseMap();

            // Mapping entre Diagnostic y DiagnosticReadDto
            CreateMap<Diagnostic, DiagnosticReadDto>()
                .ForMember(dest => dest.Vehicle, opt => opt.MapFrom(src => src.Vehicle))
                .ForMember(dest => dest.TechDiagnosticId, opt => opt.MapFrom(src => 
                    src.TechnicianDiagnostics.Any() ? src.TechnicianDiagnostics.First().Id : (int?)null
                ));

            // Mapping entre DiagnosticCreateDto y Diagnostic
            CreateMap<DiagnosticCreateDto, Diagnostic>();

            // Mapping entre TechnicianDiagnostic y TechnicianDiagnosticReadDto
            CreateMap<TechnicianDiagnostic, TechnicianDiagnosticReadDto>()
                .ForMember(dest => dest.ReasonForVisit, opt => opt.MapFrom(src => src.Diagnostic != null ? src.Diagnostic.ReasonForVisit : ""))
                .ForMember(dest => dest.VehicleId, opt => opt.MapFrom(src => src.Diagnostic != null ? src.Diagnostic.VehicleId : 0));

            // Mapping entre TechnicianDiagnosticCreateDto y TechnicianDiagnostic
            CreateMap<TechnicianDiagnosticCreateDto, TechnicianDiagnostic>();
        }
    }
}
