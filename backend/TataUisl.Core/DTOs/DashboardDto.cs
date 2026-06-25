using System.Collections.Generic;

namespace TataUisl.Core.DTOs
{
    public class CustomerDashboardSummary
    {
        public int TotalApplications { get; set; }
        public int PendingApplications { get; set; }
        public int ActiveConnections { get; set; }
        public int ProfileCompletion { get; set; }
        public List<ApplicationResponse> RecentApplications { get; set; } = new List<ApplicationResponse>();
        public List<NotificationDto> RecentNotifications { get; set; } = new List<NotificationDto>();
    }

    public class AdminDashboardSummary
    {
        public int TotalApplications { get; set; }
        public int PendingApplications { get; set; }
        public int ApprovedApplications { get; set; }
        public int RejectedApplications { get; set; }
        public int TodayApplications { get; set; }
        public int PendingDocuments { get; set; }

        public List<MonthlyVolumeDto> MonthlyVolumes { get; set; } = new List<MonthlyVolumeDto>();
        public List<CategoryDistributionDto> CategoryDistribution { get; set; } = new List<CategoryDistributionDto>();
        public List<ApplicationResponse> RecentSubmissions { get; set; } = new List<ApplicationResponse>();
    }

    public class NotificationDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
    }

    public class MonthlyVolumeDto
    {
        public string Month { get; set; } = string.Empty; // JAN, FEB
        public int Count { get; set; }
    }

    public class CategoryDistributionDto
    {
        public string Category { get; set; } = string.Empty; // Domestic, Commercial
        public int Count { get; set; }
        public int Percentage { get; set; }
    }
}
