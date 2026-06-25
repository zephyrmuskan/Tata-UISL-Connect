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
                entity.Property(e => e.FullName).HasMaxLength(100).IsRequired();
                entity.Property(e => e.FatherName).HasMaxLength(100);
                entity.Property(e => e.MotherName).HasMaxLength(100);
                entity.Property(e => e.Gender).HasMaxLength(10);
                entity.Property(e => e.AadhaarNumber).HasMaxLength(12).IsRequired();
                entity.Property(e => e.PanNumber).HasMaxLength(10).IsRequired();
                entity.Property(e => e.AnnualIncome).HasPrecision(18, 2);
                entity.Property(e => e.AddressLine1).HasMaxLength(255).IsRequired();
                entity.Property(e => e.AddressLine2).HasMaxLength(255);
                entity.Property(e => e.City).HasMaxLength(100);
                entity.Property(e => e.State).HasMaxLength(100);
                entity.Property(e => e.District).HasMaxLength(100);
                entity.Property(e => e.PinCode).HasMaxLength(6).IsRequired();
                entity.Property(e => e.PropertyType).HasMaxLength(50);
                entity.Property(e => e.HouseNumber).HasMaxLength(50);
                entity.Property(e => e.WardNumber).HasMaxLength(50);
                entity.Property(e => e.Area).HasMaxLength(100);
                entity.Property(e => e.Landmark).HasMaxLength(100);
                entity.Property(e => e.CurrentStatus).HasMaxLength(50);
                entity.Property(e => e.AssignedOfficer).HasMaxLength(100);

                entity.HasOne(d => d.Customer)
                    .WithMany(p => p.Applications)
                    .HasForeignKey(d => d.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.ConnectionType)
                    .WithMany()
                    .HasForeignKey(d => d.ConnectionTypeId)
                    .OnDelete(DeleteBehavior.Restrict);
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
        }
    }
}
