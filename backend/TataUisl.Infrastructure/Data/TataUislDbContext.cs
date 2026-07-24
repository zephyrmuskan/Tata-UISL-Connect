using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using TataUisl.Core.Entities;

namespace TataUisl.Infrastructure.Data
{
    public class TataUislDbContext : DbContext
    {
        private readonly IHttpContextAccessor? _httpContextAccessor;

        public TataUislDbContext(DbContextOptions<TataUislDbContext> options, IHttpContextAccessor? httpContextAccessor = null) : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<UserSession> UserSessions { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<Application> Applications { get; set; } = null!;
        public DbSet<ApplicationStatus> ApplicationStatuses { get; set; } = null!;
        public DbSet<Document> Documents { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;
        public DbSet<ConnectionType> ConnectionTypes { get; set; } = null!;
        public DbSet<ApplicationRemark> ApplicationRemarks { get; set; } = null!;
        public DbSet<Setting> Settings { get; set; } = null!;
        public DbSet<WorkflowRoute> WorkflowRoutes { get; set; } = null!;
        public DbSet<WorkflowStage> WorkflowStages { get; set; } = null!;
        public DbSet<OfficerAssignment> OfficerAssignments { get; set; } = null!;
        public DbSet<ApplicationWorkflow> ApplicationWorkflows { get; set; } = null!;
        public DbSet<DocumentVerification> DocumentVerifications { get; set; } = null!;
        public DbSet<VerificationResult> VerificationResults { get; set; } = null!;
        public DbSet<OcrExtractedData> OcrExtractedDataRecords { get; set; } = null!;
        public DbSet<DocumentQualityMetric> DocumentQualityMetrics { get; set; } = null!;
        public DbSet<VerificationAuditLog> VerificationAuditLogs { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).HasMaxLength(100).IsRequired();
                entity.Property(e => e.FullName).HasMaxLength(100).IsRequired();
                entity.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired();
                entity.Property(e => e.MobileNumber).HasMaxLength(20);
                entity.Property(e => e.OfficerRole).HasMaxLength(50).IsRequired().HasDefaultValue("Customer");

                entity.HasOne(d => d.Role)
                    .WithMany(p => p.Users)
                    .HasForeignKey(d => d.RoleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Role configuration
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(50).IsRequired();
            });

            // ConnectionType configuration
            modelBuilder.Entity<ConnectionType>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Category).HasMaxLength(50).IsRequired();
            });

            // Application configuration
            modelBuilder.Entity<Application>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ApplicationNumber).IsUnique();
                entity.Property(e => e.ApplicationNumber).HasMaxLength(50).IsRequired();
                entity.Property(e => e.FullName).HasMaxLength(100).IsRequired(false);
                entity.Property(e => e.FatherName).HasMaxLength(100);
                entity.Property(e => e.MotherName).HasMaxLength(100);
                entity.Property(e => e.Gender).HasMaxLength(10);
                entity.Property(e => e.AadhaarNumber).HasMaxLength(12).IsRequired(false);
                entity.Property(e => e.PanNumber).HasMaxLength(10).IsRequired(false);
                entity.Property(e => e.AnnualIncome).HasPrecision(18, 2);

                entity.Property(e => e.CreateNewBp).IsRequired();
                entity.Property(e => e.ExistingBpNo).HasMaxLength(50);
                entity.Property(e => e.BusinessArea).HasMaxLength(100).IsRequired(false);
                entity.Property(e => e.OwnerOrgName).HasMaxLength(100).IsRequired(false);
                entity.Property(e => e.RelationshipType).HasMaxLength(50).IsRequired(false);
                entity.Property(e => e.RelationshipName).HasMaxLength(100).IsRequired(false);
                entity.Property(e => e.IdentityCardType).HasMaxLength(50).IsRequired(false);
                entity.Property(e => e.IdentityCardNumber).HasMaxLength(100).IsRequired(false);
                entity.Property(e => e.PhoneNumber).HasMaxLength(20).IsRequired(false);
                entity.Property(e => e.AlternatePhoneNumber).HasMaxLength(20);
                entity.Property(e => e.EmailId).HasMaxLength(100).IsRequired(false);
                entity.Property(e => e.AlternateEmailId).HasMaxLength(100);
                entity.Property(e => e.VendorName).HasMaxLength(100);
                entity.Property(e => e.VendorCertificateNumber).HasMaxLength(100);
                entity.Property(e => e.AddressLine1).HasMaxLength(255).IsRequired(false);
                entity.Property(e => e.AddressLine2).HasMaxLength(255);
                entity.Property(e => e.City).HasMaxLength(100);
                entity.Property(e => e.State).HasMaxLength(100);
                entity.Property(e => e.District).HasMaxLength(100);
                entity.Property(e => e.PinCode).HasMaxLength(6).IsRequired(false);
                entity.Property(e => e.PropertyType).HasMaxLength(50);
                entity.Property(e => e.HouseNumber).HasMaxLength(50);
                entity.Property(e => e.WardNumber).HasMaxLength(50);
                entity.Property(e => e.Area).HasMaxLength(100);
                entity.Property(e => e.Landmark).HasMaxLength(100);
                entity.Property(e => e.VoltageRequirement).HasMaxLength(50);
                entity.Property(e => e.LoadRequirement).HasMaxLength(50);
                entity.Property(e => e.PurposeOfConnection).HasMaxLength(100);
                entity.Property(e => e.OwnershipType).HasMaxLength(50);
                entity.Property(e => e.PlotNumber).HasMaxLength(100);
                entity.Property(e => e.SurveyNumber).HasMaxLength(100);
                entity.Property(e => e.CurrentStatus).HasMaxLength(50);
                entity.Property(e => e.CurrentStage).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Priority).HasMaxLength(50).IsRequired();
                entity.Property(e => e.AssignedOfficer).HasMaxLength(100);

                entity.HasOne(d => d.Customer)
                    .WithMany(p => p.Applications)
                    .HasForeignKey(d => d.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.ConnectionType)
                    .WithMany()
                    .HasForeignKey(d => d.ConnectionTypeId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);
            });

            // Document configuration
            modelBuilder.Entity<Document>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.DocumentType).HasMaxLength(100).IsRequired();
                entity.Property(e => e.FileName).HasMaxLength(255).IsRequired();
                entity.Property(e => e.FilePath).HasMaxLength(500).IsRequired();
                entity.Property(e => e.VerificationStatus).HasMaxLength(50);

                entity.HasOne(d => d.Application)
                    .WithMany(p => p.Documents)
                    .HasForeignKey(d => d.ApplicationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ApplicationRemark configuration
            modelBuilder.Entity<ApplicationRemark>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OfficerName).HasMaxLength(100).IsRequired();

                entity.HasOne(d => d.Application)
                    .WithMany(p => p.Remarks)
                    .HasForeignKey(d => d.ApplicationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ApplicationStatus configuration
            modelBuilder.Entity<ApplicationStatus>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Stage).HasMaxLength(100);

                entity.HasOne(d => d.Application)
                    .WithMany(p => p.StatusHistory)
                    .HasForeignKey(d => d.ApplicationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.UpdatedBy)
                    .WithMany()
                    .HasForeignKey(d => d.UpdatedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Notification configuration
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Type).HasMaxLength(50);

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Notifications)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // AuditLog configuration
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Action).HasMaxLength(100).IsRequired();
                entity.Property(e => e.TableName).HasMaxLength(100).IsRequired();
                entity.Property(e => e.IpAddress).HasMaxLength(50);
                entity.Property(e => e.UserName).HasMaxLength(100);
                entity.Property(e => e.EmployeeId).HasMaxLength(50);
                entity.Property(e => e.Role).HasMaxLength(50);
                entity.Property(e => e.Module).HasMaxLength(100);
                entity.Property(e => e.Browser).HasMaxLength(255);
                entity.Property(e => e.OperatingSystem).HasMaxLength(100);
                entity.Property(e => e.Device).HasMaxLength(100);
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.TicketId).HasMaxLength(100);
                entity.Property(e => e.TicketNumber).HasMaxLength(100);
                entity.Property(e => e.ApprovedBy).HasMaxLength(100);

                entity.HasOne(d => d.User)
                    .WithMany(p => p.AuditLogs)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Setting configuration
            modelBuilder.Entity<Setting>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Key).IsUnique();
                entity.Property(e => e.Key).HasMaxLength(100).IsRequired();
            });

            // WorkflowRoute configuration
            modelBuilder.Entity<WorkflowRoute>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.LevelGroup).HasMaxLength(50).IsRequired();
            });

            // WorkflowStage configuration
            modelBuilder.Entity<WorkflowStage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.StageName).HasMaxLength(100).IsRequired();
                entity.Property(e => e.WorkflowLevel).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Department).HasMaxLength(100).IsRequired();
                entity.Property(e => e.RequiredAction).HasMaxLength(255).IsRequired();

                entity.HasOne(d => d.Route)
                    .WithMany(p => p.Stages)
                    .HasForeignKey(d => d.RouteId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // OfficerAssignment configuration
            modelBuilder.Entity<OfficerAssignment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ApplicationId).IsRequired();
                entity.Property(e => e.StageName).HasMaxLength(100).IsRequired();

                entity.HasOne(d => d.Officer)
                    .WithMany()
                    .HasForeignKey(d => d.OfficerId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ApplicationWorkflow configuration
            modelBuilder.Entity<ApplicationWorkflow>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ApplicationId).IsRequired();
                entity.Property(e => e.LevelGroup).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Status).HasMaxLength(50).IsRequired();

                entity.HasOne(d => d.Route)
                    .WithMany()
                    .HasForeignKey(d => d.RouteId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Application)
                    .WithMany()
                    .HasForeignKey(d => d.ApplicationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // UserSession configuration
            modelBuilder.Entity<UserSession>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Role).HasMaxLength(50).IsRequired();
                entity.Property(e => e.IpAddress).HasMaxLength(50);
                entity.Property(e => e.Browser).HasMaxLength(255);
                entity.Property(e => e.OperatingSystem).HasMaxLength(100);
                entity.Property(e => e.Device).HasMaxLength(100);
                entity.Property(e => e.EmployeeId).HasMaxLength(50);

                entity.HasOne(d => d.User)
                    .WithMany()
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var auditEntries = OnBeforeSaveChanges();
            var result = await base.SaveChangesAsync(cancellationToken);
            await OnAfterSaveChanges(auditEntries);
            return result;
        }

        private List<AuditEntry> OnBeforeSaveChanges()
        {
            ChangeTracker.DetectChanges();
            var auditEntries = new List<AuditEntry>();

            int? userId = null;
            string userName = "System";
            string? employeeId = null;
            string? role = null;
            string? ipAddress = "127.0.0.1";
            string? browser = null;
            string? os = null;
            string? device = null;
            string? ticketId = null;
            string? ticketNumber = null;
            string? approvedBy = null;

            if (_httpContextAccessor?.HttpContext != null)
            {
                var httpContext = _httpContextAccessor.HttpContext;
                var userClaims = httpContext.User;
                if (userClaims?.Identity?.IsAuthenticated == true)
                {
                    var userIdClaim = userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                    if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int id))
                    {
                        userId = id;
                    }
                    userName = userClaims.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? userClaims.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "System";
                    employeeId = userClaims.FindFirst("EmployeeId")?.Value;
                    role = userClaims.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                }

                ipAddress = httpContext.Connection?.RemoteIpAddress?.ToString();
                var userAgent = httpContext.Request?.Headers["User-Agent"].ToString() ?? "";

                if (userAgent.Contains("Windows")) os = "Windows";
                else if (userAgent.Contains("Macintosh") || userAgent.Contains("Mac OS")) os = "macOS";
                else if (userAgent.Contains("Android")) os = "Android";
                else if (userAgent.Contains("iPhone") || userAgent.Contains("iPad")) os = "iOS";
                else if (userAgent.Contains("Linux")) os = "Linux";
                else os = "Unknown OS";

                if (userAgent.Contains("Firefox")) browser = "Firefox";
                else if (userAgent.Contains("Chrome")) browser = "Chrome";
                else if (userAgent.Contains("Safari") && !userAgent.Contains("Chrome")) browser = "Safari";
                else if (userAgent.Contains("Edge")) browser = "Edge";
                else browser = "Unknown Browser";

                device = userAgent.Contains("Mobile") ? "Mobile" : "Desktop";

                ticketId = httpContext.Request?.Headers["X-Ticket-ID"];
                ticketNumber = httpContext.Request?.Headers["X-Ticket-Number"];
                approvedBy = httpContext.Request?.Headers["X-Approved-By"];
            }

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog || entry.Entity is UserSession || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                    continue;

                var auditEntry = new AuditEntry(entry)
                {
                    UserId = userId,
                    UserName = userName,
                    EmployeeId = employeeId,
                    Role = role,
                    IpAddress = ipAddress ?? "127.0.0.1",
                    Browser = browser,
                    OperatingSystem = os,
                    Device = device,
                    TicketId = ticketId,
                    TicketNumber = ticketNumber,
                    ApprovedBy = approvedBy,
                    Timestamp = DateTime.UtcNow
                };
                auditEntries.Add(auditEntry);

                foreach (var property in entry.Properties)
                {
                    string propertyName = property.Metadata.Name;
                    if (property.Metadata.IsPrimaryKey())
                    {
                        auditEntry.KeyValues[propertyName] = property.CurrentValue;
                        continue;
                    }

                    switch (entry.State)
                    {
                        case EntityState.Added:
                            auditEntry.AuditType = "Insert";
                            auditEntry.NewValues[propertyName] = property.CurrentValue;
                            break;

                        case EntityState.Deleted:
                            auditEntry.AuditType = "Delete";
                            auditEntry.OldValues[propertyName] = property.OriginalValue;
                            break;

                        case EntityState.Modified:
                            if (property.IsModified)
                            {
                                auditEntry.AuditType = "Update";
                                auditEntry.OldValues[propertyName] = property.OriginalValue;
                                auditEntry.NewValues[propertyName] = property.CurrentValue;
                            }
                            break;
                    }
                }
            }

            foreach (var auditEntry in auditEntries)
            {
                AuditLogs.Add(auditEntry.ToAuditLog());
            }

            return auditEntries;
        }

        private Task OnAfterSaveChanges(List<AuditEntry> auditEntries)
        {
            if (auditEntries == null || auditEntries.Count == 0)
                return Task.CompletedTask;

            foreach (var entry in auditEntries)
            {
                if (entry.AuditType == "Insert")
                {
                    foreach (var prop in entry.Entry.Properties)
                    {
                        if (prop.Metadata.IsPrimaryKey())
                        {
                            entry.KeyValues[prop.Metadata.Name] = prop.CurrentValue;
                        }
                    }
                    var matchingLog = AuditLogs.Local.FirstOrDefault(l => l.Timestamp == entry.Timestamp && l.TableName == entry.TableName && l.RecordId == null);
                    if (matchingLog != null)
                    {
                        matchingLog.RecordId = string.Join(",", entry.KeyValues.Values);
                    }
                }
            }
            return base.SaveChangesAsync();
        }
    }

    public class AuditEntry
    {
        public AuditEntry(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
        {
            Entry = entry;
        }

        public Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry Entry { get; }
        public int? UserId { get; set; }
        public string? EmployeeId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? Role { get; set; }
        public string AuditType { get; set; } = string.Empty;
        public string TableName => Entry.Metadata.ClrType.Name;
        public DateTime Timestamp { get; set; }
        public string IpAddress { get; set; } = string.Empty;
        public string? Browser { get; set; }
        public string? OperatingSystem { get; set; }
        public string? Device { get; set; }
        public string? TicketId { get; set; }
        public string? TicketNumber { get; set; }
        public string? ApprovedBy { get; set; }
        public Dictionary<string, object?> KeyValues { get; } = new();
        public Dictionary<string, object?> OldValues { get; } = new();
        public Dictionary<string, object?> NewValues { get; } = new();

        public AuditLog ToAuditLog()
        {
            return new AuditLog
            {
                UserId = UserId,
                EmployeeId = EmployeeId,
                UserName = UserName,
                Role = Role,
                Module = TableName,
                Action = AuditType,
                TableName = TableName,
                RecordId = KeyValues.Count > 0 ? string.Join(",", KeyValues.Values) : null,
                Timestamp = Timestamp,
                IpAddress = IpAddress,
                Browser = Browser,
                OperatingSystem = OperatingSystem,
                Device = Device,
                Status = "Success",
                TicketId = TicketId,
                TicketNumber = TicketNumber,
                ApprovedBy = ApprovedBy,
                BeforeJson = OldValues.Count > 0 ? JsonSerializer.Serialize(OldValues) : null,
                AfterJson = NewValues.Count > 0 ? JsonSerializer.Serialize(NewValues) : null,
                Details = $"{AuditType} operation on {TableName}"
            };
        }
    }
}
