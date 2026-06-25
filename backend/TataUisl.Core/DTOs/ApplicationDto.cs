using System;
using System.Collections.Generic;

namespace TataUisl.Core.DTOs
{
    public class ApplicationCreateRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string FatherName { get; set; } = string.Empty;
        public string MotherName { get; set; } = string.Empty;
        public string Gender { get; set; } = "Male";
        public DateTime DateOfBirth { get; set; }
        public string AadhaarNumber { get; set; } = string.Empty;
        public string PanNumber { get; set; } = string.Empty;
        public string Occupation { get; set; } = string.Empty;
        public decimal AnnualIncome { get; set; }

        public string AddressLine1 { get; set; } = string.Empty;
        public string AddressLine2 { get; set; } = string.Empty;
        public string PinCode { get; set; } = string.Empty;

        public int ConnectionTypeId { get; set; }
        public string ApplicationType { get; set; } = "New Connection";

        public string PropertyType { get; set; } = string.Empty;
        public string HouseNumber { get; set; } = string.Empty;
        public string WardNumber { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Landmark { get; set; } = string.Empty;

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
        public string FatherName { get; set; } = string.Empty;
        public string MotherName { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string AadhaarNumber { get; set; } = string.Empty;
        public string PanNumber { get; set; } = string.Empty;
        public string Occupation { get; set; } = string.Empty;
        public decimal AnnualIncome { get; set; }

        public string AddressLine1 { get; set; } = string.Empty;
        public string AddressLine2 { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string PinCode { get; set; } = string.Empty;

        public int ConnectionTypeId { get; set; }
        public string ConnectionTypeName { get; set; } = string.Empty;
        public string ConnectionCategory { get; set; } = string.Empty;
        public string ApplicationType { get; set; } = string.Empty;

        public string PropertyType { get; set; } = string.Empty;
        public string HouseNumber { get; set; } = string.Empty;
        public string WardNumber { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Landmark { get; set; } = string.Empty;

        public string CurrentStatus { get; set; } = string.Empty;
        public DateTime SubmittedDate { get; set; }
        public string AssignedOfficer { get; set; } = string.Empty;
        public int ProfileCompletion { get; set; }

        public List<DocumentResponse> Documents { get; set; } = new List<DocumentResponse>();
        public List<RemarkResponse> Remarks { get; set; } = new List<RemarkResponse>();
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
}
