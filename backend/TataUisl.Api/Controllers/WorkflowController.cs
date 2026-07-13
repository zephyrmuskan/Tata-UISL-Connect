using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TataUisl.Core.Entities;
using TataUisl.Infrastructure.Data;

namespace TataUisl.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WorkflowController : ControllerBase
    {
        private readonly TataUislDbContext _context;

        public WorkflowController(TataUislDbContext context)
        {
            _context = context;
        }

        [HttpGet("routes")]
        public async Task<IActionResult> GetRoutes()
        {
            var routes = await _context.WorkflowRoutes
                .Select(r => new {
                    r.Id,
                    r.Name,
                    r.LevelGroup,
                    Stages = r.Stages.Select(s => new {
                        s.Id,
                        s.RouteId,
                        s.StageName,
                        s.SequenceOrder,
                        s.WorkflowLevel,
                        s.Department,
                        s.RequiredAction
                    }).ToList()
                })
                .ToListAsync();
            return Ok(routes);
        }

        [HttpGet("stages")]
        public async Task<IActionResult> GetStages([FromQuery] int routeId)
        {
            var stages = await _context.WorkflowStages
                .Where(s => s.RouteId == routeId)
                .OrderBy(s => s.SequenceOrder)
                .ToListAsync();
            return Ok(stages);
        }

        [HttpGet("officers")]
        public async Task<IActionResult> GetOfficers()
        {
            var officers = await _context.Users
                .Where(u => u.OfficerRole != "Customer" && u.OfficerRole != "SuperAdmin")
                .ToListAsync();

            var officerDetails = new List<object>();
            foreach (var officer in officers)
            {
                var workload = await _context.Applications
                    .CountAsync(a => a.AssignedOfficer == officer.FullName && a.CurrentStatus != "Completed" && a.CurrentStatus != "Rejected");

                officerDetails.Add(new
                {
                    Id = officer.Id,
                    Name = officer.FullName,
                    EmployeeId = "EMP00" + officer.Id,
                    Department = GetOfficerDepartment(officer.OfficerRole),
                    Workload = workload,
                    AvailabilityStatus = officer.IsActive ? "Available" : "Unavailable"
                });
            }

            return Ok(officerDetails);
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignWorkflow([FromBody] WorkflowAssignRequest request)
        {
            if (string.IsNullOrEmpty(request.ApplicationId))
                return BadRequest("ApplicationId is required.");

            int.TryParse(request.ApplicationId, out int appId);

            // 1. Update or create ApplicationWorkflow status mapping
            var appWorkflow = await _context.ApplicationWorkflows
                .FirstOrDefaultAsync(w => w.ApplicationId == appId);

            if (appWorkflow == null)
            {
                appWorkflow = new ApplicationWorkflow
                {
                    ApplicationId = appId,
                    RouteId = request.RouteId,
                    LevelGroup = request.LevelGroup,
                    Status = "Pending"
                };
                _context.ApplicationWorkflows.Add(appWorkflow);
            }
            else
            {
                appWorkflow.RouteId = request.RouteId;
                appWorkflow.LevelGroup = request.LevelGroup;
            }

            // 2. Delete old stage assignments for this application
            var oldAssignments = await _context.OfficerAssignments
                .Where(a => a.ApplicationId == appId)
                .ToListAsync();
            _context.OfficerAssignments.RemoveRange(oldAssignments);

            // 3. Add new stage assignments
            foreach (var item in request.Assignments)
            {
                var assignment = new OfficerAssignment
                {
                    ApplicationId = appId,
                    StageName = item.StageName,
                    OfficerId = item.OfficerId
                };
                _context.OfficerAssignments.Add(assignment);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Workflow assignments saved successfully." });
        }

        [HttpPost("forward")]
        public async Task<IActionResult> ForwardWorkflow([FromBody] WorkflowAssignRequest request)
        {
            if (string.IsNullOrEmpty(request.ApplicationId))
                return BadRequest("ApplicationId is required.");

            // 1. Save assignments first
            await AssignWorkflow(request);

            // 2. Retrieve Application
            int.TryParse(request.ApplicationId, out int appId);
            var app = await _context.Applications
                .FirstOrDefaultAsync(a => a.Id == appId);
            if (app == null)
                return NotFound("Application not found.");

            // 3. Get Route stages
            var stages = await _context.WorkflowStages
                .Where(s => s.RouteId == request.RouteId)
                .OrderBy(s => s.SequenceOrder)
                .ToListAsync();

            if (!stages.Any())
                return BadRequest("No stages found for the selected route.");

            // 4. Find next stage sequence
            string nextStageName;
            int nextStageIdx = 0;
            
            if (app.CurrentStage == "Application Verification" || app.CurrentStage == "Draft")
            {
                // First stage in selected route
                nextStageName = stages[0].StageName;
            }
            else
            {
                var currentStageObj = stages.FirstOrDefault(s => s.StageName.Equals(app.CurrentStage, StringComparison.OrdinalIgnoreCase));
                if (currentStageObj == null)
                {
                    nextStageName = stages[0].StageName;
                }
                else
                {
                    nextStageIdx = stages.IndexOf(currentStageObj) + 1;
                    if (nextStageIdx < stages.Count)
                    {
                        nextStageName = stages[nextStageIdx].StageName;
                    }
                    else
                    {
                        nextStageName = "Completed";
                    }
                }
            }

            // 5. Update Application details
            string originalStage = app.CurrentStage;
            app.CurrentStage = nextStageName;
            app.LastUpdated = DateTime.UtcNow;

            User? targetOfficer = null;
            if (nextStageName != "Completed")
            {
                var nextStageObj = stages[nextStageIdx];
                var assignment = request.Assignments.FirstOrDefault(a => a.StageName.Equals(nextStageName, StringComparison.OrdinalIgnoreCase));
                
                if (assignment != null)
                {
                    targetOfficer = await _context.Users.FindAsync(assignment.OfficerId);
                }

                if (targetOfficer != null)
                {
                    app.AssignedOfficer = targetOfficer.FullName;
                    app.CurrentStatus = "Pending " + GetOfficerRoleLabel(targetOfficer.OfficerRole);
                }
                else
                {
                    // Fallback default assignments
                    app.AssignedOfficer = "Unassigned";
                    app.CurrentStatus = "Under Verification";
                }
            }
            else
            {
                app.AssignedOfficer = "Unassigned";
                app.CurrentStatus = "Completed";
            }

            // 6. Record AuditLog
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "System Officer";
            
            var auditLog = new AuditLog
            {
                Action = "Forward Stage",
                TableName = "Applications",
                RecordId = app.Id.ToString(),
                Details = $"Forwarded from stage '{originalStage}' to '{nextStageName}'. Assigned: {app.AssignedOfficer}",
                Timestamp = DateTime.UtcNow,
                UserName = userName,
                UserId = string.IsNullOrEmpty(userId) ? null : int.Parse(userId)
            };
            _context.AuditLogs.Add(auditLog);

            // 7. Add Stage History Log
            var statusLog = new ApplicationStatus
            {
                ApplicationId = app.Id,
                Status = app.CurrentStatus,
                Stage = nextStageName,
                Notes = $"Workflow forwarded successfully. Next target: {app.CurrentStage}",
                UpdatedDate = DateTime.UtcNow,
                UpdatedById = string.IsNullOrEmpty(userId) ? 1 : int.Parse(userId)
            };
            _context.ApplicationStatuses.Add(statusLog);

            // 8. Create Notification for new Officer if applicable
            if (targetOfficer != null)
            {
                var notification = new Notification
                {
                    UserId = targetOfficer.Id,
                    Title = "New Task Assigned: " + app.ApplicationNumber,
                    Message = $"Application {app.ApplicationNumber} has been forwarded to you for stage '{nextStageName}'. Required action: {stages[nextStageIdx].RequiredAction}",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow,
                    Type = "Task"
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
            return Ok(new
            {
                message = "Application forwarded successfully.",
                currentStage = app.CurrentStage,
                assignedOfficer = app.AssignedOfficer,
                currentStatus = app.CurrentStatus
            });
        }

        private string GetOfficerDepartment(string officerRole)
        {
            return officerRole switch
            {
                "Officer1" => "Technical Verification",
                "Officer2" => "Technical Survey",
                "Officer3" => "Approvals Department",
                _ => "Operations"
            };
        }

        [HttpPost("routes")]
        public async Task<IActionResult> AddRoute([FromBody] AddRouteRequest request)
        {
            if (string.IsNullOrEmpty(request.Name))
                return BadRequest("Route Name is required.");

            var route = new WorkflowRoute
            {
                Name = request.Name,
                LevelGroup = request.LevelGroup
            };

            int order = 1;
            foreach (var item in request.Stages)
            {
                var stage = new WorkflowStage
                {
                    StageName = item.StageName,
                    SequenceOrder = order++,
                    WorkflowLevel = item.Assignee, // Store default assignee in WorkflowLevel
                    Department = GetDepartmentForStage(item.StageName),
                    RequiredAction = "Required verification for " + item.StageName
                };
                route.Stages.Add(stage);
            }

            _context.WorkflowRoutes.Add(route);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Route added successfully.", id = route.Id });
        }

        private string GetDepartmentForStage(string stageName)
        {
            if (stageName.Contains("Survey")) return "Technical";
            if (stageName.Contains("Estimate")) return "Engineering";
            if (stageName.Contains("Bill") || stageName.Contains("Demand") || stageName.Contains("Payment")) return "Accounts";
            return "Operations";
        }

        private string GetOfficerRoleLabel(string officerRole)
        {
            return officerRole switch
            {
                "Officer1" => "Officer 1",
                "Officer2" => "Officer 2",
                "Officer3" => "Officer 3",
                _ => "Officer"
            };
        }

        [HttpPut("routes/{id}")]
        public async Task<IActionResult> UpdateRoute(int id, [FromBody] AddRouteRequest request)
        {
            var route = await _context.WorkflowRoutes
                .Include(r => r.Stages)
                .FirstOrDefaultAsync(r => r.Id == id);
            if (route == null) return NotFound("Route not found");

            route.Name = request.Name;
            route.LevelGroup = request.LevelGroup;

            // Remove existing stages
            _context.WorkflowStages.RemoveRange(route.Stages);

            // Add updated stages
            int order = 1;
            foreach (var item in request.Stages)
            {
                var stage = new WorkflowStage
                {
                    StageName = item.StageName,
                    SequenceOrder = order++,
                    WorkflowLevel = item.Assignee,
                    Department = GetDepartmentForStage(item.StageName),
                    RequiredAction = "Required verification for " + item.StageName
                };
                route.Stages.Add(stage);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Route updated successfully" });
        }

        [HttpDelete("routes/{id}")]
        public async Task<IActionResult> DeleteRoute(int id)
        {
            var route = await _context.WorkflowRoutes.FindAsync(id);
            if (route == null) return NotFound("Route not found");

            // Delete associated stages
            var stages = await _context.WorkflowStages.Where(s => s.RouteId == id).ToListAsync();
            _context.WorkflowStages.RemoveRange(stages);

            _context.WorkflowRoutes.Remove(route);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Route deleted successfully" });
        }
    }

    public class AddRouteRequest
    {
        public string Name { get; set; } = string.Empty;
        public string LevelGroup { get; set; } = string.Empty;
        public List<AddRouteStageDto> Stages { get; set; } = new();
    }

    public class AddRouteStageDto
    {
        public string StageName { get; set; } = string.Empty;
        public string Assignee { get; set; } = string.Empty;
    }

    public class WorkflowAssignRequest
    {
        public string ApplicationId { get; set; } = string.Empty;
        public int RouteId { get; set; }
        public string LevelGroup { get; set; } = string.Empty;
        public List<StageAssignmentDto> Assignments { get; set; } = new();
    }

    public class StageAssignmentDto
    {
        public string StageName { get; set; } = string.Empty;
        public int OfficerId { get; set; }
    }
}
