using System;

namespace TataUisl.Core.Entities
{
    public class VerificationResult
    {
        public int Id { get; set; }
        public int VerificationId { get; set; }
        public string FieldName { get; set; } = string.Empty;
        public string? ApplicationValue { get; set; }
        public string? DocumentValue { get; set; }
        public string MatchType { get; set; } = "Exact"; // Exact, Fuzzy, Semantic
        public string MatchStatus { get; set; } = "Exact Match"; // Exact Match, Partial Match, Mismatch, Missing
        public int ConfidenceScore { get; set; }
        public string Severity { get; set; } = "Low"; // Low, Medium, High
        public string? DifferenceNote { get; set; }
        public string? SuggestedAction { get; set; }
        public string? DocumentType { get; set; }

        public virtual DocumentVerification DocumentVerification { get; set; } = null!;
    }
}
