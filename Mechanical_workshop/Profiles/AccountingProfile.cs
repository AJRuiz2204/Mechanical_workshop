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
                .ForMember(dest => dest.Estimate, opt => opt.MapFrom(src => src.Estimate));
            CreateMap<AccountReceivableCreateDto, AccountReceivable>();
            CreateMap<AccountReceivableUpdateDto, AccountReceivable>();

            // Mapeo para Payment, incluyendo las propiedades de Customer, Vehicle,
            // RemainingBalance (saldo pendiente) y InitialBalance (saldo inicial)
            CreateMap<Payment, PaymentResponseDto>()
                .ForMember(dest => dest.Customer, opt => opt.MapFrom(src => src.AccountReceivable.Customer))
                .ForMember(dest => dest.Vehicle, opt => opt.MapFrom(src => src.AccountReceivable.Estimate.Vehicle))
                .ForMember(dest => dest.RemainingBalance, opt => opt.MapFrom(src => src.AccountReceivable.Balance))
                .ForMember(dest => dest.InitialBalance, opt => opt.MapFrom(src => src.AccountReceivable.OriginalAmount));
            CreateMap<PaymentCreateDto, Payment>();
            CreateMap<PaymentUpdateDto, Payment>();

            // Mapeos para los DTOs de soporte
            CreateMap<UserWorkshop, CustomerShortInfoDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.Name} {src.LastName}"))
                .ForMember(dest => dest.PrimaryPhone, opt => opt.MapFrom(src => src.PrimaryNumber));
            CreateMap<Vehicle, VehicleInfoDto>();
            CreateMap<Estimate, EstimateInfoDto>();
        }
    }
}
