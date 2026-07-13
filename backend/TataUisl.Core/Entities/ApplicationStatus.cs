using System;

namespace TataUisl.Core.Entities
{
    public class ApplicationStatus
    {
        public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string Status { get; set; } = string.Empty; // Submitted, Under Review, etc.
        public string? Stage { get; set; } // Application Verification, Document Verification, etc.
        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
        public int UpdatedById { get; set; }
        public string Notes { get; set; } = string.Empty;

        // Navigation
        public virtual Application? Application { get; set; }
        public virtual User? UpdatedBy { get; set; }
    }
}
