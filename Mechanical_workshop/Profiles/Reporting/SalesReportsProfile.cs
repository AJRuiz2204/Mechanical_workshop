using AutoMapper;
using Mechanical_workshop.Models;
using Mechanical_workshop.Dtos;

namespace MechanicalWorkshop.Profiles
{
    public class SalesReportProfile : Profile
    {
        public SalesReportProfile()
        {
            // Mapeo de SalesReport a SalesReportDto
            CreateMap<SalesReport, SalesReportDto>()
                .ForMember(dest => dest.SalesReportId, opt => opt.MapFrom(src => src.SalesReportId))
                .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.StartDate))
                .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.EndDate))
                .ForMember(dest => dest.TotalEstimates, opt => opt.MapFrom(src => src.TotalEstimates))
                .ForMember(dest => dest.TotalPartsRevenue, opt => opt.MapFrom(src => src.TotalPartsRevenue))
                .ForMember(dest => dest.TotalLaborRevenue, opt => opt.MapFrom(src => src.TotalLaborRevenue))
                .ForMember(dest => dest.TotalFlatFeeRevenue, opt => opt.MapFrom(src => src.TotalFlatFeeRevenue))
                .ForMember(dest => dest.TotalTaxCollected, opt => opt.MapFrom(src => src.TotalTaxCollected))
                .ForMember(dest => dest.TotalPaymentsCollected, opt => opt.MapFrom(src => src.TotalPaymentsCollected))
                .ForMember(dest => dest.TotalOutstanding, opt => opt.MapFrom(src => src.TotalOutstanding))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate))
                .ForMember(dest => dest.Details, opt => opt.MapFrom(src => src.Details));

            // Mapeo de SalesReportDetail a SalesReportDetailDto
            CreateMap<SalesReportDetail, SalesReportDetailDto>()
                .ForMember(dest => dest.SalesReportDetailId, opt => opt.MapFrom(src => src.SalesReportDetailId))
                .ForMember(dest => dest.EstimateId, opt => opt.MapFrom(src => src.EstimateId))
                .ForMember(dest => dest.EstimateDate, opt => opt.MapFrom(src => src.EstimateDate))
                .ForMember(dest => dest.Subtotal, opt => opt.MapFrom(src => src.Subtotal))
                .ForMember(dest => dest.Tax, opt => opt.MapFrom(src => src.Tax))
                .ForMember(dest => dest.Total, opt => opt.MapFrom(src => src.Total))
                .ForMember(dest => dest.OriginalAmount, opt => opt.MapFrom(src => src.OriginalAmount))
                .ForMember(dest => dest.RemainingBalance, opt => opt.MapFrom(src => src.RemainingBalance))
                .ForMember(dest => dest.TotalPayments, opt => opt.MapFrom(src => src.TotalPayments))
                // No se mapean CustomerName y VehicleInfo
                .ForMember(dest => dest.Estimate, opt => opt.MapFrom(src => src.Estimate));

            // Mapeo de SalesReportDetailDto a SalesReportDetail (se ignora la propiedad Estimate)
            CreateMap<SalesReportDetailDto, SalesReportDetail>()
                .ForMember(dest => dest.Estimate, opt => opt.Ignore());

            // Mapeo de Estimate a EstimateFullDto (sin cambios respecto a tu configuración actual)
            CreateMap<Estimate, EstimateFullDto>()
                .ForMember(dest => dest.ID, opt => opt.MapFrom(src => src.ID))
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Date))
                .ForMember(dest => dest.CustomerNote, opt => opt.MapFrom(src => src.CustomerNote))
                .ForMember(dest => dest.Subtotal, opt => opt.MapFrom(src => src.Subtotal))
                .ForMember(dest => dest.Tax, opt => opt.MapFrom(src => src.Tax))
                .ForMember(dest => dest.Total, opt => opt.MapFrom(src => src.Total))
                .ForMember(dest => dest.AuthorizationStatus, opt => opt.MapFrom(src => src.AuthorizationStatus))
                .ForMember(dest => dest.Vehicle, opt => opt.MapFrom(src => src.Vehicle))
                .ForMember(dest => dest.Owner, opt => opt.MapFrom(src => src.UserWorkshop))
                .ForMember(dest => dest.TechnicianDiagnostic, opt => opt.MapFrom(src => src.TechnicianDiagnostic))
                .ForMember(dest => dest.Parts, opt => opt.MapFrom(src => src.Parts))
                .ForMember(dest => dest.Labors, opt => opt.MapFrom(src => src.Labors))
                .ForMember(dest => dest.FlatFees, opt => opt.MapFrom(src => src.FlatFees));

            // Mapeo de SalesReportDto a SalesReport
            CreateMap<SalesReportDto, SalesReport>()
                .ForMember(dest => dest.SalesReportId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore());
        }
    }
}
