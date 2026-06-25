using System;
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
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AdminController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomers()
        {
            var customerRole = (await _unitOfWork.Roles.FindAsync(r => r.Name == "Customer")).FirstOrDefault();
            if (customerRole == null) return Ok(Enumerable.Empty<UserDto>());

            var customers = await _unitOfWork.Users.FindAsync(u => u.RoleId == customerRole.Id);
            var response = _mapper.Map<System.Collections.Generic.IEnumerable<UserDto>>(customers);
            return Ok(response);
        }

        [HttpPut("customers/{id}/toggle")]
        public async Task<IActionResult> ToggleCustomerStatus(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "User not found" });

            user.IsActive = !user.IsActive;
            _unitOfWork.Users.Update(user);

            // Audit
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var adminId = adminIdClaim != null ? int.Parse(adminIdClaim.Value) : 1;
            var auditLog = new AuditLog
            {
                UserId = adminId,
                UserName = User.Identity?.Name ?? "Admin",
                Action = "Toggle Active Status",
                TableName = "Users",
                RecordId = id.ToString(),
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Details = $"Toggled customer status of {user.Email} to {(user.IsActive ? "Active" : "Deactivated")}"
            };
            await _unitOfWork.AuditLogs.AddAsync(auditLog);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = $"User status set to {(user.IsActive ? "Active" : "Deactivated")}." });
        }

        [HttpPost("customers/{id}/reset-password")]
        public async Task<IActionResult> ResetCustomerPassword(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "User not found" });

            // Audit
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var adminId = adminIdClaim != null ? int.Parse(adminIdClaim.Value) : 1;
            var auditLog = new AuditLog
            {
                UserId = adminId,
                UserName = User.Identity?.Name ?? "Admin",
                Action = "Reset Password",
                TableName = "Users",
                RecordId = id.ToString(),
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Details = $"Requested administrative password reset for: {user.Email}"
            };
            await _unitOfWork.AuditLogs.AddAsync(auditLog);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = $"Password reset link/token generated successfully for {user.FullName}." });
        }

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs()
        {
            var logs = await _unitOfWork.AuditLogs.GetAllAsync();
            var sortedLogs = logs.OrderByDescending(l => l.Timestamp);
            return Ok(sortedLogs);
        }

        [HttpPost("notifications")]
        public async Task<IActionResult> SendCustomNotification([FromBody] CustomNotificationRequest request)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var adminId = adminIdClaim != null ? int.Parse(adminIdClaim.Value) : 1;

            var notification = new Notification
            {
                UserId = request.UserId,
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Notifications.AddAsync(notification);

            // Audit
            var auditLog = new AuditLog
            {
                UserId = adminId,
                UserName = User.Identity?.Name ?? "Admin",
                Action = "Send Notification",
                TableName = "Notifications",
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Details = $"Sent custom notification to User ID {request.UserId}"
            };
            await _unitOfWork.AuditLogs.AddAsync(auditLog);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Notification sent successfully." });
        }
    }

    public class CustomNotificationRequest
    {
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "Info";
    }
}
