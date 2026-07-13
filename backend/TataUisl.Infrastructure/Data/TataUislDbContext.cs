using Microsoft.EntityFrameworkCore;
using TataUisl.Core.Entities;

namespace TataUisl.Infrastructure.Data
{
    public class TataUislDbContext : DbContext
    {
        public TataUislDbContext(DbContextOptions<TataUislDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
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
        }
    }
}
