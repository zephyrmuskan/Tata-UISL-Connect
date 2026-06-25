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

            var connectionType = await _unitOfWork.ConnectionTypes.GetByIdAsync(request.ConnectionTypeId);
            if (connectionType == null)
            {
                return BadRequest(new { message = "Invalid Connection Type Selected." });
            }

            var appNum = "TATA-UISL-2026-" + new Random().Next(10000, 99999);
            var application = new Application
            {
                ApplicationNumber = appNum,
                CustomerId = customerId,
                FullName = request.FullName,
                FatherName = request.FatherName,
                MotherName = request.MotherName,
                Gender = request.Gender,
                DateOfBirth = request.DateOfBirth,
                AadhaarNumber = request.AadhaarNumber,
                PanNumber = request.PanNumber,
                Occupation = request.Occupation,
                AnnualIncome = request.AnnualIncome,

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

                CurrentStatus = "Submitted",
                SubmittedDate = DateTime.UtcNow,
                AssignedOfficer = "Unassigned",
                ProfileCompletion = 60
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
    }
}
