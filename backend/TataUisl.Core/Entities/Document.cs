using System;

namespace TataUisl.Core.Entities
{
    public class Document
    {
        public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string DocumentType { get; set; } = string.Empty; // Aadhaar, PAN, Owner Proof, Photo, Signature, Bill
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty; // Path on disk or cloud URI
        public long FileSize { get; set; }
        public string VerificationStatus { get; set; } = "Pending"; // Pending, Verified, Rejected
        public string? RejectionReason { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual Application? Application { get; set; }
    }
}
