// Profiles/EstimatesProfile.cs

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
                .ForMember(dest => dest.Owner, opt => opt.MapFrom(src => src.Vehicle.UserWorkshop));

            // Mapeo de EstimateCreateDto a Estimate
            CreateMap<EstimateCreateDto, Estimate>()
                .ForMember(dest => dest.Vehicle, opt => opt.Ignore())
                .ForMember(dest => dest.UserWorkshop, opt => opt.Ignore());

            // Mapeo de EstimatePart a EstimatePartReadDto y viceversa
            CreateMap<EstimatePart, EstimatePartReadDto>().ReverseMap();
            CreateMap<EstimatePartCreateDto, EstimatePart>();

            // Mapeo de EstimateLabor a EstimateLaborReadDto y viceversa
            CreateMap<EstimateLabor, EstimateLaborReadDto>().ReverseMap();
            CreateMap<EstimateLaborCreateDto, EstimateLabor>();

            // Mapeo de EstimateFlatFee a EstimateFlatFeeReadDto y viceversa
            CreateMap<EstimateFlatFee, EstimateFlatFeeReadDto>().ReverseMap();
            CreateMap<EstimateFlatFeeCreateDto, EstimateFlatFee>();

            // Mapeo de Vehicle a VehicleReadDto y viceversa
            CreateMap<Vehicle, VehicleReadDto>().ReverseMap();

            // Mapeo de UserWorkshop a UserWorkshopReadDto y viceversa
            CreateMap<UserWorkshop, UserWorkshopReadDto>().ReverseMap();
        }
    }
}
