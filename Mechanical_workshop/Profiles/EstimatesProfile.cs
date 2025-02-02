using AutoMapper;
using Mechanical_workshop.Models;
using Mechanical_workshop.Dtos;

namespace Mechanical_workshop.Profiles
{
    /// <summary>
    /// AutoMapper profile for mapping Estimate and related entities.
    /// This profile ensures that the Taxable property from the database is
    /// mapped to the front‑end properties (applyPartTax, applyLaborTax, etc.)
    /// and vice versa.
    /// </summary>
    public class EstimatesProfile : Profile
    {
        public EstimatesProfile()
        {
            // Mapping from Estimate to EstimateFullDto
            CreateMap<Estimate, EstimateFullDto>()
                .ForMember(dest => dest.Vehicle, opt => opt.MapFrom(src => src.Vehicle))
                .ForMember(dest => dest.Owner, opt => opt.MapFrom(src => src.UserWorkshop))
                .ForMember(dest => dest.TechnicianDiagnostic, opt => opt.MapFrom(src => src.TechnicianDiagnostic));

            // Mapping from EstimateCreateDto to Estimate
            CreateMap<EstimateCreateDto, Estimate>()
                .ForMember(dest => dest.Vehicle, opt => opt.Ignore())
                .ForMember(dest => dest.UserWorkshop, opt => opt.Ignore())
                .ForMember(dest => dest.TechnicianDiagnostic, opt => opt.MapFrom(src => src.TechnicianDiagnostic))
                .ForMember(dest => dest.Parts, opt => opt.MapFrom(src => src.Parts))
                .ForMember(dest => dest.Labors, opt => opt.MapFrom(src => src.Labors))
                .ForMember(dest => dest.FlatFees, opt => opt.MapFrom(src => src.FlatFees));

            // Mapping TechnicianDiagnostic DTOs
            CreateMap<TechnicianDiagnosticCreateDto, TechnicianDiagnostic>();
            CreateMap<TechnicianDiagnostic, TechnicianDiagnosticReadDto>().ReverseMap();

            // -----------------------------
            // Mappings for EstimatePart
            // -----------------------------
            CreateMap<EstimatePart, EstimatePartReadDto>()
                // Map the database property Taxable to the front-end property applyPartTax
                .ForMember(dest => dest.Taxable, opt => opt.MapFrom(src => src.Taxable))
                .ReverseMap()
                // When mapping back, map applyPartTax to Taxable
                .ForMember(dest => dest.Taxable, opt => opt.MapFrom(src => src.Taxable))
                .ForMember(dest => dest.ID, opt => opt.Ignore());

            CreateMap<EstimatePartCreateDto, EstimatePart>();

            // -----------------------------
            // Mappings for EstimateLabor
            // -----------------------------
            CreateMap<EstimateLabor, EstimateLaborReadDto>()
                // Map the database property Taxable to the front-end property applyLaborTax
                .ForMember(dest => dest.Taxable, opt => opt.MapFrom(src => src.Taxable))
                .ReverseMap()
                // When mapping back, map applyLaborTax to Taxable
                .ForMember(dest => dest.Taxable, opt => opt.MapFrom(src => src.Taxable))
                .ForMember(dest => dest.ID, opt => opt.Ignore());

            CreateMap<EstimateLaborCreateDto, EstimateLabor>();

            // -----------------------------
            // Mappings for EstimateFlatFee
            // -----------------------------
            CreateMap<EstimateFlatFee, EstimateFlatFeeReadDto>()
                // Map the database property Taxable to the front-end property taxable (or similar)
                .ForMember(dest => dest.Taxable, opt => opt.MapFrom(src => src.Taxable))
                .ReverseMap()
                // When mapping back, map taxable to Taxable
                .ForMember(dest => dest.Taxable, opt => opt.MapFrom(src => src.Taxable))
                .ForMember(dest => dest.ID, opt => opt.Ignore());

            CreateMap<EstimateFlatFeeCreateDto, EstimateFlatFee>();

            // Mapping for Vehicle and UserWorkshop
            CreateMap<Vehicle, VehicleReadDto>().ReverseMap();
            CreateMap<UserWorkshop, UserWorkshopReadDto>().ReverseMap();

            // Mapping for Diagnostic
            CreateMap<Diagnostic, DiagnosticReadDto>().ReverseMap();
        }
    }
}
