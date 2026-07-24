using System;

namespace TataUisl.Core.Entities
{
    public class VerificationAuditLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string? EmployeeId { get; set; }
        public string ApplicationNumber { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public int VerificationScore { get; set; }
        public string? PreviousStatus { get; set; }
        public string NewStatus { get; set; } = string.Empty;
        public bool IsOverride { get; set; }
        public string? Remarks { get; set; }
        public string? IpAddress { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
