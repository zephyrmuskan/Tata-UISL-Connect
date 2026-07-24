using System;

namespace TataUisl.Core.Entities
{
    public class DocumentQualityMetric
    {
        public int Id { get; set; }
        public int DocumentId { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public int BlurScore { get; set; } = 95;
        public int ResolutionScore { get; set; } = 98;
        public int RotationAngle { get; set; } = 0;
        public bool IsCropped { get; set; } = false;
        public bool IsDuplicate { get; set; } = false;
        public bool HasWatermark { get; set; } = false;
        public int ReadabilityScore { get; set; } = 96;
        public int OverallQualityScore { get; set; } = 96;
        public string QualityStatus { get; set; } = "High Quality";

        public virtual Document Document { get; set; } = null!;
    }
}
