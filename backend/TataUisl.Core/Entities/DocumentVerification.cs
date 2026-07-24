using System;
using System.Collections.Generic;

namespace TataUisl.Core.Entities
{
    public class DocumentVerification
    {
        public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string ApplicationNumber { get; set; } = string.Empty;
        public int OverallScore { get; set; }
        public int IdentityMatchScore { get; set; }
        public int AddressMatchScore { get; set; }
        public int OcrConfidenceScore { get; set; }
        public int DocumentQualityScore { get; set; }
        public int TotalFieldsCompared { get; set; }
        public int ExactMatches { get; set; }
        public int PartialMatches { get; set; }
        public int Mismatches { get; set; }
        public int MissingFields { get; set; }
        public string VerificationStatus { get; set; } = "Pending";
        public string? Decision { get; set; }
        public string? DecisionRemarks { get; set; }
        public bool IsOverridden { get; set; }
        public int? VerifiedById { get; set; }
        public string? VerifiedByName { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Application Application { get; set; } = null!;
        public virtual ICollection<VerificationResult> Results { get; set; } = new List<VerificationResult>();
    }
}
