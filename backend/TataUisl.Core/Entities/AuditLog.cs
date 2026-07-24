using System;

namespace TataUisl.Core.Entities
{
    public class AuditLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string? EmployeeId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? Role { get; set; }
        public string? Module { get; set; }
        public string Action { get; set; } = string.Empty; // e.g. Login, Status Change, Insert
        public string TableName { get; set; } = string.Empty;
        public string? RecordId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string IpAddress { get; set; } = string.Empty;
        public string? Browser { get; set; }
        public string? OperatingSystem { get; set; }
        public string? Device { get; set; }
        public string? Status { get; set; }
        public string? TicketId { get; set; }
        public string? TicketNumber { get; set; }
        public string? ApprovedBy { get; set; }
        public string? BeforeJson { get; set; }
        public string? AfterJson { get; set; }
        public string Details { get; set; } = string.Empty;

        // Navigation
        public virtual User? User { get; set; }
    }
}
