using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TataUisl.Core.Entities;
using TataUisl.Core.Interfaces;

namespace TataUisl.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public SettingsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _unitOfWork.Settings.GetAllAsync();
            var supportEmail = settings.FirstOrDefault(s => s.Key == "support_email")?.Value ?? "support.uisl@tatasteel.com";
            var supportPhone = settings.FirstOrDefault(s => s.Key == "support_phone")?.Value ?? "1800-345-6789";
            var allowReg = settings.FirstOrDefault(s => s.Key == "allow_registration")?.Value ?? "true";
            
            var requiredDocs = new List<string> { "Aadhaar Card", "PAN Card", "Passport Size Photo", "Address Proof", "Ownership Proof", "Electricity Bill", "Signature" };

            return Ok(new
            {
                requiredDocuments = requiredDocs,
                allowRegistration = allowReg,
                supportEmail,
                supportPhone
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsRequest request)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var adminId = adminIdClaim != null ? int.Parse(adminIdClaim.Value) : 1;

            var settings = await _unitOfWork.Settings.GetAllAsync();
            
            var emailSetting = settings.FirstOrDefault(s => s.Key == "support_email");
            if (emailSetting == null)
            {
                emailSetting = new Setting { Key = "support_email", Value = request.SupportEmail, Description = "Emergency support mail" };
                await _unitOfWork.Settings.AddAsync(emailSetting);
            }
            else
            {
                emailSetting.Value = request.SupportEmail;
                _unitOfWork.Settings.Update(emailSetting);
            }

            var phoneSetting = settings.FirstOrDefault(s => s.Key == "support_phone");
            if (phoneSetting == null)
            {
                phoneSetting = new Setting { Key = "support_phone", Value = request.SupportPhone, Description = "Emergency toll line" };
                await _unitOfWork.Settings.AddAsync(phoneSetting);
            }
            else
            {
                phoneSetting.Value = request.SupportPhone;
                _unitOfWork.Settings.Update(phoneSetting);
            }

            // Audit
            var auditLog = new AuditLog
            {
                UserId = adminId,
                UserName = User.Identity?.Name ?? "Admin",
                Action = "Update Settings",
                TableName = "Settings",
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Details = $"Updated support email to {request.SupportEmail} and phone to {request.SupportPhone}"
            };
            await _unitOfWork.AuditLogs.AddAsync(auditLog);

            await _unitOfWork.CompleteAsync();
            return Ok(new { message = "Settings updated successfully." });
        }

        [HttpGet("connection-types")]
        public async Task<IActionResult> GetConnectionTypes()
        {
            var types = await _unitOfWork.ConnectionTypes.GetAllAsync();
            return Ok(types);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("connection-types")]
        public async Task<IActionResult> SaveConnectionType([FromBody] ConnectionType request)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var adminId = adminIdClaim != null ? int.Parse(adminIdClaim.Value) : 1;

            if (request.Id > 0)
            {
                var existing = await _unitOfWork.ConnectionTypes.GetByIdAsync(request.Id);
                if (existing != null)
                {
                    existing.Name = request.Name;
                    existing.Category = request.Category;
                    _unitOfWork.ConnectionTypes.Update(existing);
                }
            }
            else
            {
                var newType = new ConnectionType
                {
                    Name = request.Name,
                    Category = request.Category
                };
                await _unitOfWork.ConnectionTypes.AddAsync(newType);
            }

            // Audit
            var auditLog = new AuditLog
            {
                UserId = adminId,
                UserName = User.Identity?.Name ?? "Admin",
                Action = "Save Connection Type",
                TableName = "ConnectionTypes",
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Details = $"Saved connection type category: {request.Name}"
            };
            await _unitOfWork.AuditLogs.AddAsync(auditLog);

            await _unitOfWork.CompleteAsync();

            var types = await _unitOfWork.ConnectionTypes.GetAllAsync();
            return Ok(types);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("connection-types/{id}")]
        public async Task<IActionResult> DeleteConnectionType(int id)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var adminId = adminIdClaim != null ? int.Parse(adminIdClaim.Value) : 1;

            var existing = await _unitOfWork.ConnectionTypes.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Type not found" });

            _unitOfWork.ConnectionTypes.Delete(existing);

            // Audit
            var auditLog = new AuditLog
            {
                UserId = adminId,
                UserName = User.Identity?.Name ?? "Admin",
                Action = "Delete Connection Type",
                TableName = "ConnectionTypes",
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Details = $"Deleted connection type ID: {id}"
            };
            await _unitOfWork.AuditLogs.AddAsync(auditLog);

            await _unitOfWork.CompleteAsync();

            var types = await _unitOfWork.ConnectionTypes.GetAllAsync();
            return Ok(types);
        }
    }

    public class UpdateSettingsRequest
    {
        public string SupportEmail { get; set; } = string.Empty;
        public string SupportPhone { get; set; } = string.Empty;
    }
}
