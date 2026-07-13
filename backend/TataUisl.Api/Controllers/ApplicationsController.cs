using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TataUisl.Core.DTOs;
using TataUisl.Core.Entities;
using TataUisl.Core.Interfaces;

namespace TataUisl.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;

        public ApplicationsController(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _notificationService = notificationService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateApplication([FromBody] ApplicationCreateRequest request)
        {
            var customerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (customerIdClaim == null) return Unauthorized();
            var customerId = int.Parse(customerIdClaim.Value);

            if (request.CurrentStatus != "Draft")
            {
                if (!request.ConnectionTypeId.HasValue)
                {
                    return BadRequest(new { message = "Connection Type is required." });
                }
                var connectionType = await _unitOfWork.ConnectionTypes.GetByIdAsync(request.ConnectionTypeId.Value);
                if (connectionType == null)
                {
                    return BadRequest(new { message = "Invalid Connection Type Selected." });
                }
            }

            var appNum = "TATA-UISL-2026-" + new Random().Next(10000, 99999);
            var isDraft = request.CurrentStatus == "Draft";

            var application = new Application
            {
                ApplicationNumber = appNum,
                CustomerId = customerId,
                FullName = request.FullName,
                FatherName = request.RelationshipType == "Father" ? request.RelationshipName : (request.FatherName ?? string.Empty),
                MotherName = request.MotherName ?? string.Empty,
                Gender = request.Gender ?? "Male",
                DateOfBirth = request.DateOfBirth,
                AadhaarNumber = request.IdentityCardType == "Aadhaar Card" ? request.IdentityCardNumber : (request.AadhaarNumber ?? string.Empty),
                PanNumber = request.IdentityCardType == "PAN Card" ? request.IdentityCardNumber : (request.PanNumber ?? string.Empty),
                Occupation = request.Occupation ?? string.Empty,
                AnnualIncome = request.AnnualIncome,

                CreateNewBp = request.CreateNewBp,
                ExistingBpNo = request.ExistingBpNo,
                BusinessArea = request.BusinessArea,
                OwnerOrgName = request.OwnerOrgName,
                RelationshipType = request.RelationshipType,
                RelationshipName = request.RelationshipName,
                IdentityCardType = request.IdentityCardType,
                IdentityCardNumber = request.IdentityCardNumber,
                PhoneNumber = request.PhoneNumber,
                AlternatePhoneNumber = request.AlternatePhoneNumber,
                EmailId = request.EmailId,
                AlternateEmailId = request.AlternateEmailId,
                VendorName = request.VendorName,
                VendorCertificateNumber = request.VendorCertificateNumber,

                AddressLine1 = request.AddressLine1,
                AddressLine2 = request.AddressLine2,
                PinCode = request.PinCode,

                ConnectionTypeId = request.ConnectionTypeId,
                ApplicationType = request.ApplicationType,

                PropertyType = request.PropertyType,
                HouseNumber = request.HouseNumber,
                WardNumber = request.WardNumber,
                Area = request.Area,
                Landmark = request.Landmark,

                VoltageRequirement = request.VoltageRequirement,
                LoadRequirement = request.LoadRequirement,
                PurposeOfConnection = request.PurposeOfConnection,
                OwnershipType = request.OwnershipType,
                PlotNumber = request.PlotNumber,
                SurveyNumber = request.SurveyNumber,

                CurrentStatus = isDraft ? "Draft" : "Pending Officer 1",
                CurrentStage = "Application Verification",
                Priority = request.Priority ?? "Medium",
                DueDate = isDraft ? null : DateTime.UtcNow.AddDays(7),
                LastUpdated = DateTime.UtcNow,
                SubmittedDate = DateTime.UtcNow,
                AssignedOfficer = isDraft ? "Unassigned" : "Officer 1 - Doc Verifier",
                ProfileCompletion = isDraft ? 25 : 50
            };

            await _unitOfWork.Applications.AddAsync(application);
            await _unitOfWork.CompleteAsync();

            // Save documents if any
            foreach (var docRequest in request.Documents)
            {
                var doc = new Document
                {
                    ApplicationId = application.Id,
                    DocumentType = docRequest.DocumentType,
                    FileName = docRequest.FileName,
                    FilePath = "/uploads/" + docRequest.FileName, // Mock save path
                    FileSize = docRequest.FileSize,
                    VerificationStatus = "Pending",
                    UploadedAt = DateTime.UtcNow
                };
                await _unitOfWork.Documents.AddAsync(doc);
            }
            await _unitOfWork.CompleteAsync();

            // Send notification
            var notification = new Notification
            {
                UserId = customerId,
                Title = "Application Registered",
                Message = $"Connection application {appNum} has been successfully submitted.",
                Type = "Success",
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Notifications.AddAsync(notification);

            // Audit submit
            var auditLog = new AuditLog
            {
                UserId = customerId,
                UserName = User.Identity?.Name ?? "Customer",
                Action = "Submit Application",
                TableName = "Applications",
                RecordId = application.Id.ToString(),
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Details = $"Submitted application number: {appNum}"
            };
            await _unitOfWork.AuditLogs.AddAsync(auditLog);
            await _unitOfWork.CompleteAsync();

            var response = _mapper.Map<ApplicationResponse>(application);
            return CreatedAtAction(nameof(GetApplicationById), new { id = application.Id }, response);
        }

        [HttpGet]
        public async Task<IActionResult> GetApplications()
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || roleClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var role = roleClaim.Value;

            IEnumerable<Application> apps;
            if (role == "Admin")
            {
                apps = await _unitOfWork.Applications.GetAllAsync();
            }
            else
            {
                apps = await _unitOfWork.Applications.FindAsync(a => a.CustomerId == userId);
            }

            var response = _mapper.Map<IEnumerable<ApplicationResponse>>(apps);
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetApplicationById(int id)
        {
            var application = await _unitOfWork.Applications.GetByIdAsync(id);
            if (application == null) return NotFound(new { message = "Application not found" });

            var response = _mapper.Map<ApplicationResponse>(application);
            return Ok(response);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateRequest request)
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            if (roleClaim == null || roleClaim.Value != "Admin") return Forbid();

            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var adminId = adminIdClaim != null ? int.Parse(adminIdClaim.Value) : 1;

            var application = await _unitOfWork.Applications.GetByIdAsync(id);
            if (application == null) return NotFound(new { message = "Application not found" });

            application.CurrentStatus = request.Status;
            
            // Add remark
            if (!string.IsNullOrEmpty(request.Remarks))
            {
                var remark = new ApplicationRemark
                {
                    ApplicationId = id,
                    OfficerName = User.Identity?.Name ?? "Review Officer",
                    Remarks = request.Remarks,
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.ApplicationRemarks.AddAsync(remark);
            }

            // Log status transition history
            var history = new ApplicationStatus
            {
                ApplicationId = id,
                Status = request.Status,
                UpdatedById = adminId,
                UpdatedDate = DateTime.UtcNow,
                Notes = request.Remarks
            };
            await _unitOfWork.ApplicationStatuses.AddAsync(history);

            // Add customer notification
            var notification = new Notification
            {
                UserId = application.CustomerId,
                Title = $"Status Updated: {request.Status}",
                Message = $"Your application {application.ApplicationNumber} status changed to {request.Status}.",
                Type = request.Status == "Rejected" ? "Error" : "Info",
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Notifications.AddAsync(notification);

            // Audit
            var auditLog = new AuditLog
            {
                UserId = adminId,
                UserName = User.Identity?.Name ?? "Admin",
                Action = "Status Change",
                TableName = "Applications",
                RecordId = id.ToString(),
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Details = $"Updated application {application.ApplicationNumber} status to {request.Status}"
            };
            await _unitOfWork.AuditLogs.AddAsync(auditLog);
            await _unitOfWork.CompleteAsync();

            // Simulate dispatching email/SMS notifications
            await _notificationService.SendEmailAsync(
                application.Customer?.Email ?? "customer@tata.com", 
                "Tata UISL Application Status Update", 
                $"Your request status is now: {request.Status}. Remarks: {request.Remarks}"
            );

            var response = _mapper.Map<ApplicationResponse>(application);
            return Ok(response);
        }

        [HttpPost("{id}/remarks")]
        public async Task<IActionResult> AddRemark(int id, [FromBody] AddRemarkRequest request)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var adminId = adminIdClaim != null ? int.Parse(adminIdClaim.Value) : 1;

            var application = await _unitOfWork.Applications.GetByIdAsync(id);
            if (application == null) return NotFound(new { message = "Application not found" });

            if (!string.IsNullOrEmpty(request.Remarks))
            {
                var remark = new ApplicationRemark
                {
                    ApplicationId = id,
                    OfficerName = User.Identity?.Name ?? "Review Officer",
                    Remarks = request.Remarks,
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.ApplicationRemarks.AddAsync(remark);

                var history = new ApplicationStatus
                {
                    ApplicationId = id,
                    Status = application.CurrentStatus,
                    UpdatedById = adminId,
                    UpdatedDate = DateTime.UtcNow,
                    Notes = $"Feedback Added: {request.Remarks}"
                };
                await _unitOfWork.ApplicationStatuses.AddAsync(history);
                await _unitOfWork.CompleteAsync();
            }

            var response = _mapper.Map<ApplicationResponse>(application);
            return Ok(response);
        }

        [HttpPut("{id}/assign")]
        public async Task<IActionResult> AssignOfficer(int id, [FromBody] OfficerAssignRequest request)
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            if (roleClaim == null || roleClaim.Value != "Admin") return Forbid();

            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var adminId = adminIdClaim != null ? int.Parse(adminIdClaim.Value) : 1;

            var application = await _unitOfWork.Applications.GetByIdAsync(id);
            if (application == null) return NotFound(new { message = "Application not found" });

            application.AssignedOfficer = request.OfficerName;
            
            // Audit
            var auditLog = new AuditLog
            {
                UserId = adminId,
                UserName = User.Identity?.Name ?? "Admin",
                Action = "Assign Officer",
                TableName = "Applications",
                RecordId = id.ToString(),
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Details = $"Assigned officer {request.OfficerName} to application {application.ApplicationNumber}"
            };
            await _unitOfWork.AuditLogs.AddAsync(auditLog);
            await _unitOfWork.CompleteAsync();

            var response = _mapper.Map<ApplicationResponse>(application);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteApplication(int id)
        {
            var customerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (customerIdClaim == null) return Unauthorized();
            var customerId = int.Parse(customerIdClaim.Value);

            var application = await _unitOfWork.Applications.GetByIdAsync(id);
            if (application == null) return NotFound(new { message = "Application not found" });

            if (application.CustomerId != customerId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            if (application.CurrentStatus != "Draft")
            {
                return BadRequest(new { message = "Only draft applications can be deleted." });
            }

            _unitOfWork.Applications.Delete(application);
            await _unitOfWork.CompleteAsync();

            var auditLog = new AuditLog
            {
                UserId = customerId,
                UserName = User.Identity?.Name ?? "Customer",
                Action = "Delete Draft",
                TableName = "Applications",
                RecordId = id.ToString(),
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Details = $"Deleted draft connection request: {application.ApplicationNumber}"
            };
            await _unitOfWork.AuditLogs.AddAsync(auditLog);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Draft deleted successfully" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateApplication(int id, [FromBody] ApplicationCreateRequest request)
        {
            var customerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (customerIdClaim == null) return Unauthorized();
            var customerId = int.Parse(customerIdClaim.Value);

            var application = await _unitOfWork.Applications.GetByIdAsync(id);
            if (application == null) return NotFound(new { message = "Application not found" });

            if (application.CustomerId != customerId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            application.FullName = request.FullName;
            application.FatherName = request.RelationshipType == "Father" ? request.RelationshipName : (request.FatherName ?? application.FatherName);
            application.MotherName = request.MotherName ?? application.MotherName;
            application.Gender = request.Gender ?? application.Gender;
            application.DateOfBirth = request.DateOfBirth ?? application.DateOfBirth;
            application.AadhaarNumber = request.IdentityCardType == "Aadhaar Card" ? request.IdentityCardNumber : (request.AadhaarNumber ?? application.AadhaarNumber);
            application.PanNumber = request.IdentityCardType == "PAN Card" ? request.IdentityCardNumber : (request.PanNumber ?? application.PanNumber);
            application.Occupation = request.Occupation ?? application.Occupation;
            application.AnnualIncome = request.AnnualIncome ?? application.AnnualIncome;

            application.CreateNewBp = request.CreateNewBp;
            application.ExistingBpNo = request.ExistingBpNo ?? application.ExistingBpNo;
            application.BusinessArea = request.BusinessArea ?? application.BusinessArea;
            application.OwnerOrgName = request.OwnerOrgName ?? application.OwnerOrgName;
            application.RelationshipType = request.RelationshipType ?? application.RelationshipType;
            application.RelationshipName = request.RelationshipName ?? application.RelationshipName;
            application.IdentityCardType = request.IdentityCardType ?? application.IdentityCardType;
            application.IdentityCardNumber = request.IdentityCardNumber ?? application.IdentityCardNumber;
            application.PhoneNumber = request.PhoneNumber ?? application.PhoneNumber;
            application.AlternatePhoneNumber = request.AlternatePhoneNumber ?? application.AlternatePhoneNumber;
            application.EmailId = request.EmailId ?? application.EmailId;
            application.AlternateEmailId = request.AlternateEmailId ?? application.AlternateEmailId;
            application.VendorName = request.VendorName ?? application.VendorName;
            application.VendorCertificateNumber = request.VendorCertificateNumber ?? application.VendorCertificateNumber;

            application.AddressLine1 = request.AddressLine1 ?? application.AddressLine1;
            application.AddressLine2 = request.AddressLine2 ?? application.AddressLine2;
            application.PinCode = request.PinCode ?? application.PinCode;

            if (request.ConnectionTypeId.HasValue)
            {
                application.ConnectionTypeId = request.ConnectionTypeId;
            }
            application.ApplicationType = request.ApplicationType ?? application.ApplicationType;

            application.PropertyType = request.PropertyType ?? application.PropertyType;
            application.HouseNumber = request.HouseNumber ?? application.HouseNumber;
            application.WardNumber = request.WardNumber ?? application.WardNumber;
            application.Area = request.Area ?? application.Area;
            application.Landmark = request.Landmark ?? application.Landmark;

            application.VoltageRequirement = request.VoltageRequirement ?? application.VoltageRequirement;
            application.LoadRequirement = request.LoadRequirement ?? application.LoadRequirement;
            application.PurposeOfConnection = request.PurposeOfConnection ?? application.PurposeOfConnection;
            application.OwnershipType = request.OwnershipType ?? application.OwnershipType;
            application.PlotNumber = request.PlotNumber ?? application.PlotNumber;
            application.SurveyNumber = request.SurveyNumber ?? application.SurveyNumber;

            if (User.IsInRole("Admin"))
            {
                if (!string.IsNullOrEmpty(request.CurrentStatus))
                {
                    application.CurrentStatus = request.CurrentStatus;
                }
                if (!string.IsNullOrEmpty(request.CurrentStage))
                {
                    application.CurrentStage = request.CurrentStage;
                }
                if (!string.IsNullOrEmpty(request.Priority))
                {
                    application.Priority = request.Priority;
                }
                if (!string.IsNullOrEmpty(request.AssignedOfficer))
                {
                    application.AssignedOfficer = request.AssignedOfficer;
                }
            }

            application.LastUpdated = DateTime.UtcNow;

            if (request.CurrentStatus == "Submitted")
            {
                if (application.CurrentStatus == "Correction Required" && !string.IsNullOrEmpty(application.AssignedOfficer) && application.AssignedOfficer != "Unassigned")
                {
                    if (application.AssignedOfficer.Contains("Officer 1"))
                        application.CurrentStatus = "Pending Officer 1";
                    else if (application.AssignedOfficer.Contains("Officer 2"))
                        application.CurrentStatus = "Pending Officer 2";
                    else if (application.AssignedOfficer.Contains("Officer 3"))
                        application.CurrentStatus = "Pending Officer 3";
                    else
                        application.CurrentStatus = "Pending Officer 1";
                }
                else
                {
                    application.CurrentStatus = "Pending Officer 1";
                    application.CurrentStage = "Application Verification";
                    application.AssignedOfficer = "Officer 1 - Doc Verifier";
                    application.DueDate = DateTime.UtcNow.AddDays(7);
                }

                // Add documents if any
                foreach (var docRequest in request.Documents)
                {
                    var doc = new Document
                    {
                        ApplicationId = application.Id,
                        DocumentType = docRequest.DocumentType,
                        FileName = docRequest.FileName,
                        FilePath = "/uploads/" + docRequest.FileName,
                        FileSize = docRequest.FileSize,
                        VerificationStatus = "Pending",
                        UploadedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.Documents.AddAsync(doc);
                }

                // Add status history
                var history = new ApplicationStatus
                {
                    ApplicationId = application.Id,
                    Status = application.CurrentStatus,
                    Stage = application.CurrentStage,
                    UpdatedById = customerId,
                    UpdatedDate = DateTime.UtcNow,
                    Notes = "Application submitted after correction/draft edit."
                };
                await _unitOfWork.ApplicationStatuses.AddAsync(history);

                // Add notification
                var notif = new Notification
                {
                    UserId = customerId,
                    Title = "Application Submitted",
                    Message = $"Your application {application.ApplicationNumber} has been successfully submitted.",
                    Type = "Success",
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.Notifications.AddAsync(notif);
            }
            else
            {
                application.CurrentStatus = "Draft";
            }

            await _unitOfWork.CompleteAsync();

            var response = _mapper.Map<ApplicationResponse>(application);
            return Ok(response);
        }

        [HttpPut("{id}/update-stage")]
        public async Task<IActionResult> UpdateStage(int id, [FromBody] StageUpdateRequest request)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var adminId = adminIdClaim != null ? int.Parse(adminIdClaim.Value) : 1;

            var application = await _unitOfWork.Applications.GetByIdAsync(id);
            if (application == null) return NotFound(new { message = "Application not found" });

            if (request.Action == "Reject")
            {
                application.CurrentStatus = "Rejected";
                application.CurrentStage = "Completed";
                application.AssignedOfficer = "Unassigned";
            }
            else if (request.Action == "Correction")
            {
                application.CurrentStatus = "Correction Required";
                // Keep AssignedOfficer so the customer returns it back to this officer on resubmit
            }
            else // Approve
            {
                // Sequence logic
                if (application.CurrentStage == "Application Verification")
                {
                    application.CurrentStage = "Document Verification";
                    application.CurrentStatus = "Pending Officer 1";
                }
                else if (application.CurrentStage == "Document Verification")
                {
                    application.CurrentStage = "Load Survey";
                    application.CurrentStatus = "Pending Officer 2";
                    application.AssignedOfficer = "Officer 2 - Tech Surveyor";
                }
                else if (application.CurrentStage == "Load Survey")
                {
                    application.CurrentStage = "Land Survey";
                    application.CurrentStatus = "Pending Officer 2";
                }
                else if (application.CurrentStage == "Land Survey")
                {
                    application.CurrentStage = "Bill Verification";
                    application.CurrentStatus = "Pending Officer 2";
                }
                else if (application.CurrentStage == "Bill Verification")
                {
                    application.CurrentStage = "Estimate Details";
                    application.CurrentStatus = "Pending Officer 2";
                }
                else if (application.CurrentStage == "Estimate Details")
                {
                    application.CurrentStage = "Estimate Approval";
                    application.CurrentStatus = "Pending Officer 2";
                }
                else if (application.CurrentStage == "Estimate Approval")
                {
                    application.CurrentStage = "Demand Note";
                    application.CurrentStatus = "Pending Officer 3";
                    application.AssignedOfficer = "Officer 3 - Approval Officer";
                }
                else if (application.CurrentStage == "Demand Note")
                {
                    application.CurrentStage = "Connection Approval";
                    application.CurrentStatus = "Pending Officer 3";
                }
                else if (application.CurrentStage == "Connection Approval")
                {
                    application.CurrentStage = "Job Allotment";
                    application.CurrentStatus = "Pending Officer 3";
                }
                else if (application.CurrentStage == "Job Allotment")
                {
                    application.CurrentStage = "RFC Entry";
                    application.CurrentStatus = "Pending Officer 3";
                }
                else if (application.CurrentStage == "RFC Entry")
                {
                    application.CurrentStage = "Energization";
                    application.CurrentStatus = "Pending Officer 3";
                }
                else if (application.CurrentStage == "Energization")
                {
                    application.CurrentStage = "Move-In";
                    application.CurrentStatus = "Pending Officer 3";
                }
                else if (application.CurrentStage == "Move-In")
                {
                    application.CurrentStage = "Completed";
                    application.CurrentStatus = "Completed";
                    application.AssignedOfficer = "Unassigned";
                }
            }

            application.LastUpdated = DateTime.UtcNow;
            application.DueDate = application.CurrentStatus.StartsWith("Pending") ? DateTime.UtcNow.AddDays(7) : null;

            // Remarks
            if (!string.IsNullOrEmpty(request.Remarks))
            {
                var remark = new ApplicationRemark
                {
                    ApplicationId = id,
                    OfficerName = User.Identity?.Name ?? "Verification Officer",
                    Remarks = request.Remarks,
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.ApplicationRemarks.AddAsync(remark);
            }

            // History
            var statusLog = new ApplicationStatus
            {
                ApplicationId = id,
                Status = application.CurrentStatus,
                Stage = application.CurrentStage,
                UpdatedById = adminId,
                UpdatedDate = DateTime.UtcNow,
                Notes = request.Remarks ?? $"Stage transitioned to {application.CurrentStage}"
            };
            await _unitOfWork.ApplicationStatuses.AddAsync(statusLog);

            // Notify Customer
            var notif = new Notification
            {
                UserId = application.CustomerId,
                Title = $"Stage Update: {application.CurrentStage}",
                Message = $"Your application {application.ApplicationNumber} has transitioned to {application.CurrentStage}. Status: {application.CurrentStatus}",
                Type = request.Action == "Reject" ? "Error" : (request.Action == "Correction" ? "Warning" : "Success"),
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Notifications.AddAsync(notif);

            // Audit Log
            var audit = new AuditLog
            {
                UserId = adminId,
                UserName = User.Identity?.Name ?? "Officer",
                Action = $"Workflow - {request.Action}",
                TableName = "Applications",
                RecordId = id.ToString(),
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Details = $"Transitioned stage of application {application.ApplicationNumber} to {application.CurrentStage} ({application.CurrentStatus})"
            };
            await _unitOfWork.AuditLogs.AddAsync(audit);

            await _unitOfWork.CompleteAsync();

            var response = _mapper.Map<ApplicationResponse>(application);
            return Ok(response);
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> BulkImportApplications([FromBody] IEnumerable<ApplicationImportDto> requests)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            var adminId = int.Parse(userIdClaim.Value);

            var imported = new List<Application>();
            var connectionTypes = await _unitOfWork.ConnectionTypes.GetAllAsync();
            var defaultConnType = connectionTypes.FirstOrDefault();

            var users = await _unitOfWork.Users.GetAllAsync();

            foreach (var req in requests)
            {
                var customer = users.FirstOrDefault(u => 
                    (!string.IsNullOrEmpty(req.CustomerEmail) && u.Email.Equals(req.CustomerEmail, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrEmpty(req.CustomerMobile) && u.MobileNumber == req.CustomerMobile)
                );
                
                int targetCustomerId = customer?.Id ?? adminId;

                var connType = connectionTypes.FirstOrDefault(t => 
                    (!string.IsNullOrEmpty(req.ConnectionTypeName) && t.Name.Contains(req.ConnectionTypeName, StringComparison.OrdinalIgnoreCase))
                ) ?? defaultConnType;

                var app = new Application
                {
                    ApplicationNumber = req.ApplicationNumber ?? ("TATA-UISL-2026-" + new Random().Next(10000, 99999)),
                    CustomerId = targetCustomerId,
                    FullName = req.FullName ?? req.CustomerName ?? "Imported Applicant",
                    FatherName = string.Empty,
                    MotherName = string.Empty,
                    Gender = "Male",
                    DateOfBirth = DateTime.UtcNow.AddYears(-30),
                    AadhaarNumber = string.Empty,
                    PanNumber = string.Empty,
                    Occupation = "Business",
                    AnnualIncome = 500000,
                    CreateNewBp = true,
                    ExistingBpNo = req.ExistingBpNo,
                    BusinessArea = req.BusinessArea ?? "JAMSHEDPUR",
                    OwnerOrgName = string.Empty,
                    PhoneNumber = req.CustomerMobile ?? "8271039154",
                    EmailId = req.CustomerEmail ?? "applicant@tata.com",
                    AddressLine1 = req.AddressLine1 ?? "Jamshedpur Road",
                    AddressLine2 = req.AddressLine2 ?? string.Empty,
                    City = "Jamshedpur",
                    State = "Jharkhand",
                    District = "East Singhbhum",
                    PinCode = "831001",
                    ConnectionTypeId = connType?.Id,
                    ApplicationType = req.ApplicationType ?? "New Connection",
                    PropertyType = "Owned",
                    HouseNumber = string.Empty,
                    WardNumber = string.Empty,
                    Area = string.Empty,
                    Landmark = string.Empty,
                    VoltageRequirement = "230V",
                    LoadRequirement = "2 kW",
                    CurrentStatus = req.CurrentStatus ?? "Pending Officer 1",
                    CurrentStage = req.CurrentStage ?? "Application Verification",
                    Priority = req.Priority ?? "Medium",
                    DueDate = DateTime.UtcNow.AddDays(7),
                    LastUpdated = DateTime.UtcNow,
                    SubmittedDate = req.SubmittedDate ?? DateTime.UtcNow,
                    AssignedOfficer = req.AssignedOfficer ?? "Officer 1 - Doc Verifier",
                    ProfileCompletion = 50
                };

                app.StatusHistory.Add(new ApplicationStatus
                {
                    Status = app.CurrentStatus,
                    Stage = app.CurrentStage,
                    UpdatedDate = DateTime.UtcNow,
                    UpdatedById = adminId,
                    Notes = "Imported via CSV template."
                });

                await _unitOfWork.Applications.AddAsync(app);
                imported.Add(app);
            }

            await _unitOfWork.CompleteAsync();

            return Ok(new { message = $"Successfully imported {imported.Count} applications.", count = imported.Count });
        }
    }

    public class ApplicationImportDto
    {
        public string? ApplicationNumber { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerMobile { get; set; }
        public string? FullName { get; set; }
        public string? ExistingBpNo { get; set; }
        public string? BusinessArea { get; set; }
        public string? Division { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? ConnectionTypeName { get; set; }
        public string? ApplicationType { get; set; }
        public string? CurrentStatus { get; set; }
        public string? CurrentStage { get; set; }
        public string? Priority { get; set; }
        public string? AssignedOfficer { get; set; }
        public DateTime? SubmittedDate { get; set; }
    }

    public class AddRemarkRequest
    {
        public string Remarks { get; set; } = string.Empty;
    }
}
