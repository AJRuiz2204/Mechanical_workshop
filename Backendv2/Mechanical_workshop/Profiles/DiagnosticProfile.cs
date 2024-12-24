using AutoMapper;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;

namespace Mechanical_workshop.Profiles
{
    public class DiagnosticProfile : Profile
    {
        public DiagnosticProfile()
        {
            // Mapeo al crear
            CreateMap<DiagnosticCreateDto, Diagnostic>();

            // Mapeo al leer
            CreateMap<Diagnostic, DiagnosticReadDto>();

            
        }
    }
}
