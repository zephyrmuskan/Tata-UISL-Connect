using System;

namespace TataUisl.Core.Entities
{
    public class AuditLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty; // e.g. Login, Status Change
        public string TableName { get; set; } = string.Empty;
        public string? RecordId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string IpAddress { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;

        // Navigation
        public virtual User? User { get; set; }
    }
}
