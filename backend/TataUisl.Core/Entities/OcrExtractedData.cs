using System;

namespace TataUisl.Core.Entities
{
    public class OcrExtractedData
    {
        public int Id { get; set; }
        public int DocumentId { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string? RawText { get; set; }
        public string ExtractedFieldsJson { get; set; } = "{}";
        public string OcrEngine { get; set; } = "Engine Standard OCR";
        public int ConfidenceScore { get; set; } = 95;
        public DateTime ExtractedAt { get; set; } = DateTime.UtcNow;

        public virtual Document Document { get; set; } = null!;
    }
}
