using System;
using System.Collections.Generic;

namespace TataUisl.Core.DTOs
{
    public class ApplicationCreateRequest
    {
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

        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? PinCode { get; set; }

        public int? ConnectionTypeId { get; set; }
        public string? ApplicationType { get; set; } = "New Connection";

        public string? PropertyType { get; set; }
        public string? HouseNumber { get; set; }
        public string? WardNumber { get; set; }
        public string? Area { get; set; }
        public string? Landmark { get; set; }

        public string? VoltageRequirement { get; set; }
        public string? LoadRequirement { get; set; }
        public string? PurposeOfConnection { get; set; }
        public string? OwnershipType { get; set; }
        public string? PlotNumber { get; set; }
        public string? SurveyNumber { get; set; }

        public string CurrentStatus { get; set; } = "Submitted"; // Draft or Submitted
        public string Priority { get; set; } = "Medium";
        public string? CurrentStage { get; set; }
        public string? AssignedOfficer { get; set; }

        public List<DocumentUploadRequest> Documents { get; set; } = new List<DocumentUploadRequest>();
    }

    public class DocumentUploadRequest
    {
        public string DocumentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string FileBase64 { get; set; } = string.Empty;
    }

    public class ApplicationResponse
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationNumber { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerMobile { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;
        public string? FatherName { get; set; }
        public string? MotherName { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? AadhaarNumber { get; set; }
        public string? PanNumber { get; set; }
        public string? Occupation { get; set; }
        public decimal? AnnualIncome { get; set; }

        public bool CreateNewBp { get; set; }
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

        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? District { get; set; }
        public string? PinCode { get; set; }

        public int? ConnectionTypeId { get; set; }
        public string ConnectionTypeName { get; set; } = string.Empty;
        public string ConnectionCategory { get; set; } = string.Empty;
        public string? ApplicationType { get; set; }

        public string? PropertyType { get; set; }
        public string? HouseNumber { get; set; }
        public string? WardNumber { get; set; }
        public string? Area { get; set; }
        public string? Landmark { get; set; }

        public string? VoltageRequirement { get; set; }
        public string? LoadRequirement { get; set; }
        public string? PurposeOfConnection { get; set; }
        public string? OwnershipType { get; set; }
        public string? PlotNumber { get; set; }
        public string? SurveyNumber { get; set; }

        public string CurrentStatus { get; set; } = string.Empty;
        public string CurrentStage { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public DateTime LastUpdated { get; set; }
        public DateTime SubmittedDate { get; set; }
        public string AssignedOfficer { get; set; } = string.Empty;
        public int ProfileCompletion { get; set; }

        public List<DocumentResponse> Documents { get; set; } = new List<DocumentResponse>();
        public List<RemarkResponse> Remarks { get; set; } = new List<RemarkResponse>();
        public List<StatusHistoryResponse> StatusHistory { get; set; } = new List<StatusHistoryResponse>();
    }

    public class StatusHistoryResponse
    {
        public string Status { get; set; } = string.Empty;
        public string? Stage { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string UpdatedByName { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }

    public class DocumentResponse
    {
        public string Id { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string VerificationStatus { get; set; } = string.Empty;
        public string? RejectionReason { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    public class RemarkResponse
    {
        public string Id { get; set; } = string.Empty;
        public string OfficerName { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class StatusUpdateRequest
    {
        public string Status { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
    }

    public class OfficerAssignRequest
    {
        public string OfficerName { get; set; } = string.Empty;
    }

    public class DocumentVerifyRequest
    {
        public string Status { get; set; } = string.Empty; // Verified or Rejected
        public string? Reason { get; set; }
    }

    public class StageUpdateRequest
    {
        public string NewStage { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty; // Approve, Reject, Correction
        public string Remarks { get; set; } = string.Empty;
    }
}
