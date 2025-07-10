// Profiles/TechnicianDiagnosticProfile.cs

using AutoMapper;
using Mechanical_workshop.Models;
using Mechanical_workshop.Dtos;

namespace Mechanical_workshop.Profiles
{
    public class TechnicianDiagnosticProfile : Profile
    {
        public TechnicianDiagnosticProfile()
        {
            CreateMap<TechnicianDiagnostic, TechnicianDiagnosticReadDto>()
                .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.Notes))
                .ForMember(dest => dest.ReasonForVisit, opt => opt.MapFrom(src => src.Diagnostic != null ? src.Diagnostic.ReasonForVisit : ""))
                .ForMember(dest => dest.VehicleId, opt => opt.MapFrom(src => src.Diagnostic != null ? src.Diagnostic.VehicleId : 0));
            CreateMap<TechnicianDiagnosticCreateDto, TechnicianDiagnostic>();


        }
    }
}
