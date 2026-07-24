using System;

namespace TataUisl.Core.Entities
{
    public class UserSession
    {
        public string Id { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string? EmployeeId { get; set; }
        public string Role { get; set; } = string.Empty;
        public DateTime LoginTimestamp { get; set; }
        public DateTime? LogoutTimestamp { get; set; }
        public DateTime? BrowserClosureTimestamp { get; set; }
        public bool IsTimeout { get; set; } = false;
        public string? IpAddress { get; set; }
        public string? Browser { get; set; }
        public string? OperatingSystem { get; set; }
        public string? Device { get; set; }
        public int? SessionDuration { get; set; } // in seconds

        // Navigation
        public virtual User? User { get; set; }
    }
}