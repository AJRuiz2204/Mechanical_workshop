using AutoMapper;
using Mechanical_workshop.Models;
using Mechanical_workshop.Dtos;

namespace Mechanical_workshop.Profiles
{
    public class EstimatesProfile : Profile
    {
        public EstimatesProfile()
        {
            // Mapeo de Estimate a EstimateFullDto
            CreateMap<Estimate, EstimateFullDto>()
                .ForMember(dest => dest.Vehicle, opt => opt.MapFrom(src => src.Vehicle))
                .ForMember(dest => dest.Owner, opt => opt.MapFrom(src => src.UserWorkshop))
                .ForMember(dest => dest.TechnicianDiagnostic, opt => opt.MapFrom(src => src.TechnicianDiagnostic));

            // Mapeo de EstimateCreateDto a Estimate
            CreateMap<EstimateCreateDto, Estimate>()
                .ForMember(dest => dest.Vehicle, opt => opt.Ignore())
                .ForMember(dest => dest.UserWorkshop, opt => opt.Ignore())
                .ForMember(dest => dest.TechnicianDiagnostic, opt => opt.MapFrom(src => src.TechnicianDiagnostic))
                // Habilitar mapeo de listas
                .ForMember(dest => dest.Parts, opt => opt.MapFrom(src => src.Parts))
                .ForMember(dest => dest.Labors, opt => opt.MapFrom(src => src.Labors))
                .ForMember(dest => dest.FlatFees, opt => opt.MapFrom(src => src.FlatFees));

            // Mapeo de TechnicianDiagnosticCreateDto a TechnicianDiagnostic
            CreateMap<TechnicianDiagnosticCreateDto, TechnicianDiagnostic>();

            // Mapeo de TechnicianDiagnostic a TechnicianDiagnosticReadDto y viceversa
            CreateMap<TechnicianDiagnostic, TechnicianDiagnosticReadDto>().ReverseMap();

            // Mapeo de EstimatePart a EstimatePartReadDto y viceversa
            CreateMap<EstimatePart, EstimatePartReadDto>()
                .ReverseMap()
                .ForMember(dest => dest.ID, opt => opt.Ignore());
            CreateMap<EstimatePartCreateDto, EstimatePart>();

            // Mapeo de EstimateLabor a EstimateLaborReadDto y viceversa
            CreateMap<EstimateLabor, EstimateLaborReadDto>()
                .ReverseMap()
                .ForMember(dest => dest.ID, opt => opt.Ignore());
            CreateMap<EstimateLaborCreateDto, EstimateLabor>();

            // Mapeo de EstimateFlatFee a EstimateFlatFeeReadDto y viceversa
            CreateMap<EstimateFlatFee, EstimateFlatFeeReadDto>()
                .ReverseMap()
                .ForMember(dest => dest.ID, opt => opt.Ignore());
            CreateMap<EstimateFlatFeeCreateDto, EstimateFlatFee>();

            // Mapeo de Vehicle a VehicleReadDto y viceversa
            CreateMap<Vehicle, VehicleReadDto>().ReverseMap();

            // Mapeo de UserWorkshop a UserWorkshopReadDto y viceversa
            CreateMap<UserWorkshop, UserWorkshopReadDto>().ReverseMap();

            // Mapeo de Diagnostic a DiagnosticReadDto y viceversa
            CreateMap<Diagnostic, DiagnosticReadDto>().ReverseMap();
        }
    }
}
