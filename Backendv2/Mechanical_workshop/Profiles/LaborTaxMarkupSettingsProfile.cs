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
            CreateMap<PartLaborSettings, LaborTaxMarkupSettingsReadDto>();
            CreateMap<PartLaborSettings, LaborTaxMarkupSettingsUpdateDto>();
            CreateMap<PartLaborSettings, LaborTaxMarkupSettingsCreateDto>();

            // De los DTOs a la entidad
            CreateMap<LaborTaxMarkupSettingsCreateDto, PartLaborSettings>();
            CreateMap<LaborTaxMarkupSettingsUpdateDto, PartLaborSettings>();
        }
    }
}
