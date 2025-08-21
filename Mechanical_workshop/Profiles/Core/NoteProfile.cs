using AutoMapper;
using Mechanical_workshop.Dtos;
using Mechanical_workshop.Models;
using static Mechanical_workshop.Dtos.NoteDto;

namespace Mechanical_workshop.Profiles
{
    public class NoteProfile : Profile
    {
        public NoteProfile()
        {
            // Source -> Target
            CreateMap<Note, NoteReadDto>();
            CreateMap<NoteCreateDto, Note>();
            CreateMap<NoteUpdateDto, Note>();
        }
    }
}