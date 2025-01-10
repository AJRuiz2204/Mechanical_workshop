// MappingProfiles/WorkshopSettingsProfile.cs

using AutoMapper;
using Mechanical_workshop.DTOs;
using Mechanical_workshop.Models;

namespace Mechanical_workshop.MappingProfiles
{
    /// <summary>
    /// AutoMapper profile for WorkshopSettings.
    /// </summary>
    public class WorkshopSettingsProfile : Profile
    {
        public WorkshopSettingsProfile()
        {
            // Mapping from WorkshopSettings to WorkshopSettingsReadDto
            CreateMap<WorkshopSettings, WorkshopSettingsReadDto>();

            // Mapping from WorkshopSettingsCreateDto to WorkshopSettings
            CreateMap<WorkshopSettingsCreateDto, WorkshopSettings>();

            // Mapping from WorkshopSettingsUpdateDto to WorkshopSettings
            CreateMap<WorkshopSettingsUpdateDto, WorkshopSettings>();
        }
    }
}
