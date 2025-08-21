using AutoMapper;
using Mechanical_workshop.Models;
using Mechanical_workshop.DTOs;

namespace Mechanical_workshop.Profiles
{
    public class LaborTaxMarkupSettingsProfile : Profile
    {
        public LaborTaxMarkupSettingsProfile()
        {
             // De la entidad a los DTOs
            CreateMap<LaborTaxMarkupSettings, LaborTaxMarkupSettingsReadDto>();
            CreateMap<LaborTaxMarkupSettings, LaborTaxMarkupSettingsUpdateDto>();
            CreateMap<LaborTaxMarkupSettings, LaborTaxMarkupSettingsCreateDto>();

            // De los DTOs a la entidad
            CreateMap<LaborTaxMarkupSettingsCreateDto, LaborTaxMarkupSettings>();
            CreateMap<LaborTaxMarkupSettingsUpdateDto, LaborTaxMarkupSettings>();
        }
    }
}
