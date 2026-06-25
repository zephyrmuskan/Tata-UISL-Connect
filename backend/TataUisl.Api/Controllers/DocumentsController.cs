using System;
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
    public class DocumentsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public DocumentsController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpPost("upload/{applicationId}")]
        public async Task<IActionResult> UploadDocument(int applicationId, [FromBody] DocumentUploadRequest request)
        {
            var application = await _unitOfWork.Applications.GetByIdAsync(applicationId);
            if (application == null) return NotFound(new { message = "Application not found" });

            // Create new document attachment
            var document = new Document
            {
                ApplicationId = applicationId,
                DocumentType = request.DocumentType,
                FileName = request.FileName,
                FilePath = "/uploads/" + request.FileName, // Mock save path
                FileSize = request.FileSize,
                VerificationStatus = "Pending",
                UploadedAt = DateTime.UtcNow
            };

            await _unitOfWork.Documents.AddAsync(document);
            
            // Recalculate profile completion percentages
            application.ProfileCompletion = Math.Min(100, application.ProfileCompletion + 10);
            _unitOfWork.Applications.Update(application);

            await _unitOfWork.CompleteAsync();

            var response = _mapper.Map<DocumentResponse>(document);
            return Ok(response);
        }

        [HttpPut("{id}/verify")]
        public async Task<IActionResult> VerifyDocument(int id, [FromBody] DocumentVerifyRequest request)
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            if (roleClaim == null || roleClaim.Value != "Admin") return Forbid();

            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var adminId = adminIdClaim != null ? int.Parse(adminIdClaim.Value) : 1;

            var document = await _unitOfWork.Documents.GetByIdAsync(id);
            if (document == null) return NotFound(new { message = "Document not found" });

            document.VerificationStatus = request.Status; // Verified or Rejected
            document.RejectionReason = request.Reason;
            _unitOfWork.Documents.Update(document);

            // Audit verification event
            var auditLog = new AuditLog
            {
                UserId = adminId,
                UserName = User.Identity?.Name ?? "Admin",
                Action = "Verify Document",
                TableName = "Documents",
                RecordId = id.ToString(),
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Details = $"Marked document ID {id} ({document.DocumentType}) as {request.Status}"
            };
            await _unitOfWork.AuditLogs.AddAsync(auditLog);

            // Send notification to customer
            var application = await _unitOfWork.Applications.GetByIdAsync(document.ApplicationId);
            if (application != null)
            {
                var notification = new Notification
                {
                    UserId = application.CustomerId,
                    Title = request.Status == "Rejected" ? "Document Rejected" : "Document Verified",
                    Message = request.Status == "Rejected" 
                        ? $"Your {document.DocumentType} was rejected. Reason: {request.Reason}"
                        : $"Your {document.DocumentType} was successfully verified.",
                    Type = request.Status == "Rejected" ? "Warning" : "Success",
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.Notifications.AddAsync(notification);
            }

            await _unitOfWork.CompleteAsync();
            return Ok(new { message = $"Document successfully marked as {request.Status}." });
        }
    }
}
