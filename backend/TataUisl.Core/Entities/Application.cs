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
        public string? FullName { get; set; }
        public string? FatherName { get; set; }
        public string? MotherName { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? AadhaarNumber { get; set; }
        public string? PanNumber { get; set; }
        public string? Occupation { get; set; }
        public decimal? AnnualIncome { get; set; }

        public bool CreateNewBp { get; set; } = true;
        public string? ExistingBpNo { get; set; }
        public string? BusinessArea { get; set; }
        public string? OwnerOrgName { get; set; }
        public string? RelationshipType { get; set; }
        public string? RelationshipName { get; set; }
        public string? IdentityCardType { get; set; }
        public string? IdentityCardNumber { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AlternatePhoneNumber { get; set; }
        public string? EmailId { get; set; }
        public string? AlternateEmailId { get; set; }
        public string? VendorName { get; set; }
        public string? VendorCertificateNumber { get; set; }

        // Section 2 - Address
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; } = "Jamshedpur";
        public string? State { get; set; } = "Jharkhand";
        public string? District { get; set; } = "East Singhbhum";
        public string? PinCode { get; set; }

        // Section 3 - Connection Details
        public int? ConnectionTypeId { get; set; }
        public string? ApplicationType { get; set; } = "New Connection"; // New Connection, Name Transfer, Load Enhancement, Temporary Connection

        // Section 4 - Property Details
        public string? PropertyType { get; set; }
        public string? HouseNumber { get; set; }
        public string? WardNumber { get; set; }
        public string? Area { get; set; }
        public string? Landmark { get; set; }

        // Extra Connection & Property specifications
        public string? VoltageRequirement { get; set; }
        public string? LoadRequirement { get; set; }
        public string? PurposeOfConnection { get; set; }
        public string? OwnershipType { get; set; }
        public string? PlotNumber { get; set; }
        public string? SurveyNumber { get; set; }

        // System Workflow Fields
        public string CurrentStatus { get; set; } = "Draft"; // Draft, Submitted, Under Verification, etc.
        public string CurrentStage { get; set; } = "Application Verification"; // 14 stages
        public string Priority { get; set; } = "Medium"; // Low, Medium, High
        public DateTime? DueDate { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
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
