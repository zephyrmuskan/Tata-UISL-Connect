using AutoMapper;
using TataUisl.Core.Entities;
using TataUisl.Core.DTOs;

namespace TataUisl.Core.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role != null ? src.Role.Name : string.Empty))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role != null ? src.Role.Name : string.Empty));

            CreateMap<Document, DocumentResponse>();

            CreateMap<ApplicationRemark, RemarkResponse>();

            CreateMap<ApplicationStatus, StatusHistoryResponse>()
                .ForMember(dest => dest.UpdatedByName, opt => opt.MapFrom(src => src.UpdatedBy != null ? src.UpdatedBy.FullName : string.Empty));

            CreateMap<Application, ApplicationResponse>()
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.FullName : string.Empty))
                .ForMember(dest => dest.CustomerEmail, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Email : string.Empty))
                .ForMember(dest => dest.CustomerMobile, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.MobileNumber : string.Empty))
                .ForMember(dest => dest.ConnectionTypeName, opt => opt.MapFrom(src => src.ConnectionType != null ? src.ConnectionType.Name : string.Empty))
                .ForMember(dest => dest.ConnectionCategory, opt => opt.MapFrom(src => src.ConnectionType != null ? src.ConnectionType.Category : string.Empty));

            CreateMap<Notification, NotificationDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToString("o")));
        }
    }
}
