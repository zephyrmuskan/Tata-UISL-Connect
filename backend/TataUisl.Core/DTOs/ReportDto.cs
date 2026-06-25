using System;

namespace TataUisl.Core.DTOs
{
    public class ReportRowDto
    {
        public string ApplicationNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string ConnectionCategory { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime SubmittedDate { get; set; }
        public string AssignedOfficer { get; set; } = string.Empty;
        public decimal Income { get; set; }
    }
}
