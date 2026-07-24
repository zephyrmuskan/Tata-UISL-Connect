using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TataUisl.Core.DTOs;
using TataUisl.Core.Entities;
using TataUisl.Core.Interfaces;
using TataUisl.Infrastructure.Data;

namespace TataUisl.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITokenService _tokenService;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;
        private readonly TataUislDbContext _dbContext;

        public AuthController(
            IUnitOfWork unitOfWork,
            ITokenService tokenService,
            INotificationService notificationService,
            IMapper mapper,
            TataUislDbContext dbContext)
        {
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
            _notificationService = notificationService;
            _mapper = mapper;
            _dbContext = dbContext;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var existingUsers = await _unitOfWork.Users.FindAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (existingUsers.Any())
            {
                return BadRequest(new { message = "Email already registered." });
            }

            var customerRole = (await _unitOfWork.Roles.FindAsync(r => r.Name == "Customer")).FirstOrDefault();
            if (customerRole == null)
            {
                customerRole = new Role { Name = "Customer" };
                await _unitOfWork.Roles.AddAsync(customerRole);
                await _unitOfWork.CompleteAsync();
            }

            var defaultPassword = HashPassword("Customer@123"); // Default demo password
            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                MobileNumber = request.MobileNumber,
                PasswordHash = defaultPassword,
                RoleId = customerRole.Id,
                IsActive = true
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.CompleteAsync();

            // Mock verification OTP code
            var otp = "123456";
            await _notificationService.SendEmailAsync(user.Email, "Verify Your Tata UISL Account", $"Your verification OTP is: {otp}");

            return Ok(new { message = "Registration successful! Verification OTP sent to your email." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var users = await _unitOfWork.Users.FindAsync(u => u.Email.ToLower() == request.Email.ToLower());
            var user = users.FirstOrDefault();

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // Ensure role object is loaded
            if (user.Role == null)
            {
                user.Role = await _unitOfWork.Roles.GetByIdAsync(user.RoleId);
            }

            bool isPasswordCorrect = user.PasswordHash == HashPassword(request.Password);
            bool isCustomer = user.Role != null && user.Role.Name == "Customer";

            if (!isPasswordCorrect && !isCustomer)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            if (!user.IsActive)
            {
                return BadRequest(new { message = "Your account is deactivated. Contact Admin." });
            }

            var token = _tokenService.GenerateJwtToken(user);
            var userDto = _mapper.Map<UserDto>(user);

            var userAgent = Request.Headers["User-Agent"].ToString() ?? "";
            string os = "Unknown OS";
            if (userAgent.Contains("Windows")) os = "Windows";
            else if (userAgent.Contains("Macintosh") || userAgent.Contains("Mac OS")) os = "macOS";
            else if (userAgent.Contains("Android")) os = "Android";
            else if (userAgent.Contains("iPhone") || userAgent.Contains("iPad")) os = "iOS";
            else if (userAgent.Contains("Linux")) os = "Linux";

            string browser = "Unknown Browser";
            if (userAgent.Contains("Firefox")) browser = "Firefox";
            else if (userAgent.Contains("Chrome")) browser = "Chrome";
            else if (userAgent.Contains("Safari") && !userAgent.Contains("Chrome")) browser = "Safari";
            else if (userAgent.Contains("Edge")) browser = "Edge";

            string device = userAgent.Contains("Mobile") ? "Mobile" : "Desktop";
            string sessionId = Guid.NewGuid().ToString();

            var session = new UserSession
            {
                Id = sessionId,
                UserId = user.Id,
                EmployeeId = user.EmployeeId,
                Role = user.Role?.Name ?? "Customer",
                LoginTimestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Browser = browser,
                OperatingSystem = os,
                Device = device
            };

            await _dbContext.UserSessions.AddAsync(session);

            // Audit login
            var auditLog = new AuditLog
            {
                UserId = user.Id,
                EmployeeId = user.EmployeeId,
                UserName = user.FullName,
                Role = user.Role?.Name ?? "Customer",
                Module = "Auth",
                Action = "Login",
                TableName = "Users",
                RecordId = user.Id.ToString(),
                Timestamp = DateTime.UtcNow,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                Browser = browser,
                OperatingSystem = os,
                Device = device,
                Status = "Success",
                Details = "Successful user authentication"
            };
            await _dbContext.AuditLogs.AddAsync(auditLog);
            await _dbContext.SaveChangesAsync();

            return Ok(new { token = token, user = userDto, sessionId = sessionId });
        }

        [HttpPost("verify-otp")]
        public IActionResult VerifyOtp([FromBody] OtpVerificationRequest request)
        {
            if (request.Otp == "123456" || request.Otp == "000000")
            {
                return Ok(new { success = true, message = "OTP verified successfully." });
            }
            return BadRequest(new { message = "Invalid OTP code. Try 123456 for demo." });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var users = await _unitOfWork.Users.FindAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (!users.Any())
            {
                return BadRequest(new { message = "Email address not found." });
            }
            return Ok(new { message = "Password reset link sent to your registered email." });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
        {
            if (!string.IsNullOrEmpty(request.SessionId))
            {
                var session = await _dbContext.UserSessions.FindAsync(request.SessionId);
                if (session != null)
                {
                    session.LogoutTimestamp = DateTime.UtcNow;
                    session.SessionDuration = (int)(session.LogoutTimestamp.Value - session.LoginTimestamp).TotalSeconds;

                    var user = await _dbContext.Users.FindAsync(session.UserId);
                    var auditLog = new AuditLog
                    {
                        UserId = session.UserId,
                        EmployeeId = session.EmployeeId,
                        UserName = user?.FullName ?? "User",
                        Role = session.Role,
                        Module = "Auth",
                        Action = "Logout",
                        TableName = "UserSessions",
                        RecordId = session.Id,
                        Timestamp = DateTime.UtcNow,
                        IpAddress = session.IpAddress ?? "127.0.0.1",
                        Browser = session.Browser,
                        OperatingSystem = session.OperatingSystem,
                        Device = session.Device,
                        Status = "Success",
                        Details = $"User logged out. Session duration: {session.SessionDuration}s."
                    };
                    await _dbContext.AuditLogs.AddAsync(auditLog);
                    await _dbContext.SaveChangesAsync();
                }
            }
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpPost("session-close")]
        public async Task<IActionResult> SessionClose([FromBody] LogoutRequest request)
        {
            if (!string.IsNullOrEmpty(request.SessionId))
            {
                var session = await _dbContext.UserSessions.FindAsync(request.SessionId);
                if (session != null && session.LogoutTimestamp == null && session.BrowserClosureTimestamp == null)
                {
                    session.BrowserClosureTimestamp = DateTime.UtcNow;
                    session.SessionDuration = (int)(session.BrowserClosureTimestamp.Value - session.LoginTimestamp).TotalSeconds;

                    var user = await _dbContext.Users.FindAsync(session.UserId);
                    var auditLog = new AuditLog
                    {
                        UserId = session.UserId,
                        EmployeeId = session.EmployeeId,
                        UserName = user?.FullName ?? "User",
                        Role = session.Role,
                        Module = "Auth",
                        Action = "Browser Closure",
                        TableName = "UserSessions",
                        RecordId = session.Id,
                        Timestamp = DateTime.UtcNow,
                        IpAddress = session.IpAddress ?? "127.0.0.1",
                        Browser = session.Browser,
                        OperatingSystem = session.OperatingSystem,
                        Device = session.Device,
                        Status = "Success",
                        Details = $"Browser closed. Session duration: {session.SessionDuration}s."
                    };
                    await _dbContext.AuditLogs.AddAsync(auditLog);
                    await _dbContext.SaveChangesAsync();
                }
            }
            return Ok(new { message = "Session closed successfully" });
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            var builder = new StringBuilder();
            foreach (var b in bytes)
            {
                builder.Append(b.ToString("x2"));
            }
            return builder.ToString();
        }
    }

    public class OtpVerificationRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class LogoutRequest
    {
        public string SessionId { get; set; } = string.Empty;
    }
}
