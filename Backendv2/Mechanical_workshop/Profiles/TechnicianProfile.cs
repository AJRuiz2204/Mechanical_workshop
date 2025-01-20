// Backend: MappingProfiles/TechnicianProfile.cs
using AutoMapper;
using Mechanical_workshop.Models;
using Mechanical_workshop.Dtos;

namespace Mechanical_workshop.MappingProfiles
{
    public class TechnicianProfile : Profile
    {
        public TechnicianProfile()
        {
            // Mapea de User a TechnicianDtos
            CreateMap<User, TechnicianDtos>();

            // Si necesitas mapear en sentido inverso, puedes agregar:
            // CreateMap<TechnicianDtos, User>();
        }
    }
}
