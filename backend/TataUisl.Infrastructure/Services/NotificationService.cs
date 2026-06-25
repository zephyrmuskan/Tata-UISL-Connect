using System;
using System.Threading.Tasks;
using TataUisl.Core.Interfaces;

namespace TataUisl.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        public Task SendEmailAsync(string email, string subject, string body)
        {
            // Simulate SMTP server logs or mock integrations
            Console.WriteLine($"[EMAIL SENT TO {email}]");
            Console.WriteLine($"Subject: {subject}");
            Console.WriteLine($"Body: {body}");
            return Task.CompletedTask;
        }

        public Task SendSmsAsync(string mobileNumber, string message)
        {
            // Simulate SMS gateway API logs or mock integrations
            Console.WriteLine($"[SMS DISPATCHED TO {mobileNumber}]: {message}");
            return Task.CompletedTask;
        }
    }
}
