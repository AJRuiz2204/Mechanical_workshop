// Profiles/UsersProfile.cs
using AutoMapper;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;

namespace Mechanical_workshop.Profiles
{
    public class UsersProfile : Profile
    {
        public UsersProfile()
        {
            // Mapeo de User a UserReadDto
            CreateMap<User, UserReadDto>();

            // Mapeo de UserCreateDto a User
            CreateMap<UserCreateDto, User>();

            // Mapeo de UserUpdateDto a User
            CreateMap<UserUpdateDto, User>();
            
        }
        
    }
}
