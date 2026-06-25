using System;
using System.Collections.Generic;

namespace TataUisl.Core.Entities
{
    public class Application
    {
        public int Id { get; set; }
        public string ApplicationNumber { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        
        // Section 1 - Personal Information
        public string FullName { get; set; } = string.Empty;
        public string FatherName { get; set; } = string.Empty;
        public string MotherName { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string AadhaarNumber { get; set; } = string.Empty;
        public string PanNumber { get; set; } = string.Empty;
        public string Occupation { get; set; } = string.Empty;
        public decimal AnnualIncome { get; set; }

        // Section 2 - Address
        public string AddressLine1 { get; set; } = string.Empty;
        public string AddressLine2 { get; set; } = string.Empty;
        public string City { get; set; } = "Jamshedpur";
        public string State { get; set; } = "Jharkhand";
        public string District { get; set; } = "East Singhbhum";
        public string PinCode { get; set; } = string.Empty;

        // Section 3 - Connection Details
        public int ConnectionTypeId { get; set; }
        public string ApplicationType { get; set; } = "New Connection"; // New Connection, Name Transfer, Load Enhancement, Temporary Connection

        // Section 4 - Property Details
        public string PropertyType { get; set; } = string.Empty;
        public string HouseNumber { get; set; } = string.Empty;
        public string WardNumber { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Landmark { get; set; } = string.Empty;

        // System Workflow Fields
        public string CurrentStatus { get; set; } = "Submitted"; // Submitted, Document Verification, Under Review, Approved, Rejected, Connection Completed
        public DateTime SubmittedDate { get; set; } = DateTime.UtcNow;
        public string AssignedOfficer { get; set; } = "Unassigned";
        public int ProfileCompletion { get; set; } = 0;

        // Navigation properties
        public virtual User? Customer { get; set; }
        public virtual ConnectionType? ConnectionType { get; set; }
        public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
        public virtual ICollection<ApplicationRemark> Remarks { get; set; } = new List<ApplicationRemark>();
        public virtual ICollection<ApplicationStatus> StatusHistory { get; set; } = new List<ApplicationStatus>();
    }
}
