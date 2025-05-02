using AutoMapper;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;

namespace Mechanical_workshop.MappingProfiles
{
    public class EstimateMappingProfile : Profile
    {
        public EstimateMappingProfile()
        {
            // Mapeo de PARTS -> DTO
            CreateMap<EstimatePart, EstimateLineDto>()
                .ForMember(dest => dest.CreateTime, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.EstimateId, opt => opt.MapFrom(src => src.EstimateID))
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.NetPrice, opt => opt.MapFrom(src => src.NetPrice))
                .ForMember(dest => dest.ListPrice, opt => opt.MapFrom(src => src.ListPrice))
                .ForMember(dest => dest.PriceTo, opt => opt.MapFrom(src => src.ExtendedPrice))
                // Para PARTS, labor y shopSupplies no aplican
                .ForMember(dest => dest.Labor, opt => opt.MapFrom(src => (decimal?)0))
                .ForMember(dest => dest.ShopSupplies, opt => opt.MapFrom(src => (decimal?)0))
                // El VIN viene de Vehicle, no de la propia parte
                .ForMember(dest => dest.Vin, opt => opt.Ignore());

            // Mapeo de LABOR -> DTO
            CreateMap<EstimateLabor, EstimateLineDto>()
                .ForMember(dest => dest.CreateTime, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.EstimateId, opt => opt.MapFrom(src => src.EstimateID))
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => (int?)null))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                // Normalmente no se maneja net/list price en labor
                .ForMember(dest => dest.NetPrice, opt => opt.MapFrom(src => (decimal?)0))
                .ForMember(dest => dest.ListPrice, opt => opt.MapFrom(src => (decimal?)0))
                .ForMember(dest => dest.PriceTo, opt => opt.MapFrom(src => (decimal?)0))
                .ForMember(dest => dest.Labor, opt => opt.MapFrom(src => src.ExtendedPrice))
                .ForMember(dest => dest.ShopSupplies, opt => opt.MapFrom(src => (decimal?)0))
                .ForMember(dest => dest.Vin, opt => opt.Ignore());

            // Mapeo de FLAT FEES -> DTO
            CreateMap<EstimateFlatFee, EstimateLineDto>()
                .ForMember(dest => dest.CreateTime, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.EstimateId, opt => opt.MapFrom(src => src.EstimateID))
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => (int?)null))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.NetPrice, opt => opt.MapFrom(src => (decimal?)0))
                .ForMember(dest => dest.ListPrice, opt => opt.MapFrom(src => (decimal?)0))
                .ForMember(dest => dest.PriceTo, opt => opt.MapFrom(src => (decimal?)0))
                .ForMember(dest => dest.Labor, opt => opt.MapFrom(src => (decimal?)0))
                .ForMember(dest => dest.ShopSupplies, opt => opt.MapFrom(src => src.ExtendedPrice))
                .ForMember(dest => dest.Vin, opt => opt.Ignore());

            // Ignorar TechnicianDiagnostic en mapeo de creación y actualización
            CreateMap<EstimateCreateDto, Estimate>()
                .ForMember(dest => dest.TechnicianDiagnostic, opt => opt.Ignore())
                .ForMember(dest => dest.TechnicianDiagnosticID, opt => opt.Ignore());
            CreateMap<EstimateUpdateDto, Estimate>()
                .ForMember(dest => dest.TechnicianDiagnostic, opt => opt.Ignore())
                .ForMember(dest => dest.TechnicianDiagnosticID, opt => opt.Ignore());
        }
    }
}
