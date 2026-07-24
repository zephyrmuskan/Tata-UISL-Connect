using System;
using System.Collections.Generic;

namespace TataUisl.Core.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string OfficerRole { get; set; } = "Customer"; // SuperAdmin, Officer1, Officer2, Officer3, Customer
        public string? EmployeeId { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Role? Role { get; set; }
        public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}
