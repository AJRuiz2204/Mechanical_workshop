using AutoMapper;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;

namespace MechanicalWorkshop.Profiles
{
    public class AccountingProfile : Profile
    {
        public AccountingProfile()
        {
            // Mapeo para AccountReceivable (ya existente)
            CreateMap<AccountReceivable, AccountReceivableResponseDto>()
                .ForMember(dest => dest.Customer, opt => opt.MapFrom(src => src.Customer))
                .ForMember(dest => dest.Vehicle, opt => opt.MapFrom(src => src.Estimate.Vehicle))
                .ForMember(dest => dest.Estimate, opt => opt.MapFrom(src => src.Estimate))
                .ForMember(dest => dest.Payments, opt => opt.MapFrom(src => src.Payments));
            CreateMap<AccountReceivableCreateDto, AccountReceivable>();
            CreateMap<AccountReceivableUpdateDto, AccountReceivable>();

            // Mapeo para Payment, incluyendo las propiedades de Customer, Vehicle,
            // RemainingBalance (saldo pendiente) y InitialBalance (saldo inicial)
            CreateMap<Payment, PaymentResponseDto>()
                .ForMember(dest => dest.Customer, opt => opt.MapFrom(src => src.AccountReceivable.Customer))
                .ForMember(dest => dest.Vehicle, opt => opt.MapFrom(src => src.AccountReceivable.Estimate.Vehicle))
                .ForMember(dest => dest.RemainingBalance, opt => opt.MapFrom(src => src.AccountReceivable.Balance))
                .ForMember(dest => dest.InitialBalance, opt => opt.MapFrom(src => src.AccountReceivable.OriginalAmount))
                .ForMember(dest => dest.Estimate, opt => opt.MapFrom(src => src.AccountReceivable.Estimate))
                // Nuevo mapeo para TechnicianDiagnostic
                .ForMember(dest => dest.TechnicianDiagnostic, opt => opt.MapFrom(src => src.AccountReceivable.Estimate.TechnicianDiagnostic));
            CreateMap<PaymentCreateDto, Payment>();
            CreateMap<PaymentUpdateDto, Payment>();

            CreateMap<TechnicianDiagnostic, TechnicianDiagnosticReadDto>();

            // Mapeos para los DTOs de soporte
            CreateMap<UserWorkshop, CustomerShortInfoDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.Name} {src.LastName}"))
                .ForMember(dest => dest.PrimaryPhone, opt => opt.MapFrom(src => src.PrimaryNumber));
            CreateMap<Vehicle, VehicleInfoDto>();

            // Nuevo mapeo para Estimate a EstimateFullDto (incluye TechnicianDiagnostic)
            CreateMap<Estimate, EstimateFullDto>()
                .ForMember(dest => dest.Vehicle, opt => opt.MapFrom(src => src.Vehicle))
                .ForMember(dest => dest.Owner, opt => opt.MapFrom(src => src.Vehicle.UserWorkshop))
                .ForMember(dest => dest.TechnicianDiagnostic, opt => opt.MapFrom(src => src.TechnicianDiagnostic))
                .ForMember(dest => dest.Parts, opt => opt.MapFrom(src => src.Parts))
                .ForMember(dest => dest.Labors, opt => opt.MapFrom(src => src.Labors))
                .ForMember(dest => dest.FlatFees, opt => opt.MapFrom(src => src.FlatFees));

            CreateMap<Estimate, EstimateInfoDto>();
        }
    }
}
