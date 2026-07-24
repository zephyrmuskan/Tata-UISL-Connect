using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TataUisl.Core.Entities;
using TataUisl.Infrastructure.Data;

namespace TataUisl.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")] // Restrict to admin users
    public class AuditLogsController : ControllerBase
    {
        private readonly TataUislDbContext _dbContext;

        public AuditLogsController(TataUislDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? user,
            [FromQuery] string? module,
            [FromQuery] string? actionType,
            [FromQuery] string? ticketNumber,
            [FromQuery] string? ipAddress,
            [FromQuery] string? applicationNumber)
        {
            try
            {
                var query = _dbContext.AuditLogs.AsQueryable();

                if (startDate.HasValue)
                {
                    query = query.Where(l => l.Timestamp >= startDate.Value);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(l => l.Timestamp <= endDate.Value);
                }

                if (!string.IsNullOrEmpty(user))
                {
                    query = query.Where(l => l.UserName.Contains(user) || (l.UserId != null && l.UserId.ToString() == user) || (l.EmployeeId != null && l.EmployeeId.Contains(user)));
                }

                if (!string.IsNullOrEmpty(module))
                {
                    query = query.Where(l => l.Module == module || l.TableName == module);
                }

                if (!string.IsNullOrEmpty(actionType))
                {
                    query = query.Where(l => l.Action == actionType);
                }

                if (!string.IsNullOrEmpty(ticketNumber))
                {
                    query = query.Where(l => l.TicketNumber.Contains(ticketNumber) || l.TicketId == ticketNumber);
                }

                if (!string.IsNullOrEmpty(ipAddress))
                {
                    query = query.Where(l => l.IpAddress.Contains(ipAddress));
                }

                if (!string.IsNullOrEmpty(applicationNumber))
                {
                    query = query.Where(l => l.RecordId == applicationNumber || l.Details.Contains(applicationNumber));
                }

                var logs = await query.OrderByDescending(l => l.Timestamp).ToListAsync();
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching audit logs", error = ex.Message });
            }
        }

        [HttpGet("daily-stats")]
        [AllowAnonymous] // Allow access for demo, frontend dashboard checks
        public async Task<IActionResult> GetDailyStats()
        {
            try
            {
                var totalCreated = await _dbContext.Applications.CountAsync();
                var totalDrafts = await _dbContext.Applications.CountAsync(a => a.CurrentStatus == "Draft");
                var totalSubmitted = await _dbContext.Applications.CountAsync(a => a.CurrentStatus != "Draft");
                var totalApproved = await _dbContext.Applications.CountAsync(a => a.CurrentStatus == "Approved" || a.CurrentStatus == "Completed");
                var totalRejected = await _dbContext.Applications.CountAsync(a => a.CurrentStatus == "Rejected");
                var totalPending = await _dbContext.Applications.CountAsync(a => a.CurrentStatus != "Draft" && a.CurrentStatus != "Completed" && a.CurrentStatus != "Approved" && a.CurrentStatus != "Rejected");

                // Count returned/accepted from audit logs
                var totalReturned = await _dbContext.AuditLogs.CountAsync(l => l.Action == "Return" || l.Action == "Returned" || l.Action == "Correction Required");
                var totalAccepted = await _dbContext.AuditLogs.CountAsync(l => l.Action == "Accept" || l.Action == "Accepted" || l.Action == "Assign" || l.Action == "Approve");

                // Processed per officer (grouping by UserName for Actions involving status change/forward)
                var officerLogs = await _dbContext.AuditLogs
                    .Where(l => l.Action == "Approve" || l.Action == "Reject" || l.Action == "Forward Stage" || l.Action == "Update Application")
                    .GroupBy(l => l.UserName)
                    .Select(g => new { OfficerName = g.Key, Count = g.Count() })
                    .ToListAsync();

                var processedPerOfficer = new Dictionary<string, int>();
                foreach (var ol in officerLogs)
                {
                    if (!string.IsNullOrEmpty(ol.OfficerName) && ol.OfficerName != "System")
                    {
                        processedPerOfficer[ol.OfficerName] = ol.Count;
                    }
                }

                // Average processing time (in minutes) for completed/approved applications
                var completedApps = await _dbContext.Applications
                    .Where(a => (a.CurrentStatus == "Completed" || a.CurrentStatus == "Approved") && a.SubmittedDate != null)
                    .Select(a => new { a.SubmittedDate, a.LastUpdated })
                    .ToListAsync();

                double avgProcessingTimeMin = 0;
                if (completedApps.Any())
                {
                    var totalTime = completedApps.Sum(a => (a.LastUpdated - a.SubmittedDate).TotalMinutes);
                    avgProcessingTimeMin = totalTime / completedApps.Count;
                }

                return Ok(new
                {
                    totalCreated,
                    totalDrafts,
                    totalSubmitted,
                    totalApproved,
                    totalRejected,
                    totalReturned,
                    totalAccepted,
                    totalPending,
                    processedPerOfficer,
                    avgProcessingTimeMinutes = Math.Round(avgProcessingTimeMin, 1)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error calculating stats", error = ex.Message });
            }
        }
    }

    public class DailyStatsResponse
    {
        public int TotalCreated { get; set; }
        public int TotalDrafts { get; set; }
        public int TotalSubmitted { get; set; }
        public int TotalApproved { get; set; }
        public int TotalRejected { get; set; }
        public int TotalReturned { get; set; }
        public int TotalAccepted { get; set; }
        public int TotalPending { get; set; }
        public Dictionary<string, int> ProcessedPerOfficer { get; set; } = new();
        public double AvgProcessingTimeMinutes { get; set; }
    }
}