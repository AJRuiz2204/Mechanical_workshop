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
                .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.Notes));
            CreateMap<TechnicianDiagnosticCreateDto, TechnicianDiagnostic>();


        }
    }
}
