using System;

namespace TataUisl.Core.Entities
{
    public class ApplicationRemark
    {
        public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string OfficerName { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual Application? Application { get; set; }
    }
}
