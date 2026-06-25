using System.Threading.Tasks;

namespace TataUisl.Core.Interfaces
{
    public interface INotificationService
    {
        Task SendEmailAsync(string email, string subject, string body);
        Task SendSmsAsync(string mobileNumber, string message);
    }
}
