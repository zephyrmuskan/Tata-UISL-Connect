using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TataUisl.Core.Entities;
using TataUisl.Core.Interfaces;
using TataUisl.Core.Profiles;
using TataUisl.Infrastructure.Data;
using TataUisl.Infrastructure.Repositories;
using TataUisl.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure EF Core with SQL Server or SQLite depending on setting
var provider = builder.Configuration["DatabaseProvider"] ?? "SqlServer";
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<TataUislDbContext>(options =>
{
    if (provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        options.UseSqlite(connectionString ?? "Data Source=tatauisl.db");
    }
    else
    {
        options.UseSqlServer(connectionString ?? "Server=localhost;Database=TataUislDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true");
    }
});

// 2. Configure Dependency Injection Repositories & Services
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// 3. Configure AutoMapper Mapping Profiles
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// 4. Configure Authentication & JWT Tokens validation
var jwtSecretKey = "TATA_UISL_ENTERPRISE_APPLICATION_SECRET_JWT_KEY_SIGNATURE_2026";
var key = Encoding.ASCII.GetBytes(jwtSecretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true for production HTTPS
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

// 5. Configure Controllers & CORS permissions
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 6. Configure Swagger/OpenAPI details
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Tata UISL Utility Services REST API", Version = "v1" });
    
    // Configure secure JWT auth input inside Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Seed Database Roles and default users
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<TataUislDbContext>();
        context.Database.EnsureCreated(); // Auto create SQL Server Db if not exists
        
        // Seed Roles
        if (!context.Roles.Any())
        {
            context.Roles.Add(new Role { Name = "Admin" });
            context.Roles.Add(new Role { Name = "Customer" });
            context.SaveChanges();
        }

        // Seed Admin User (SHA256 of "Admin@123")
        if (!context.Users.Any(u => u.Email == "admin@tatauisl.com"))
        {
            context.Users.Add(new User
            {
                FullName = "Tata UISL System Admin",
                Email = "admin@tatauisl.com",
                PasswordHash = "e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7", // Hash of "Admin@123"
                MobileNumber = "18003456789",
                RoleId = 1, // Admin role
                IsActive = true,
                OfficerRole = "SuperAdmin"
            });
            context.SaveChanges();
        }

        // Seed Officer 1 (SHA256 of "Admin@123")
        if (!context.Users.Any(u => u.Email == "officer1@tatauisl.com"))
        {
            context.Users.Add(new User
            {
                FullName = "Officer 1 - Doc Verifier",
                Email = "officer1@tatauisl.com",
                PasswordHash = "e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7",
                MobileNumber = "9988776651",
                RoleId = 1,
                IsActive = true,
                OfficerRole = "Officer1"
            });
            context.SaveChanges();
        }

        // Seed Officer 2 (SHA256 of "Admin@123")
        if (!context.Users.Any(u => u.Email == "officer2@tatauisl.com"))
        {
            context.Users.Add(new User
            {
                FullName = "Officer 2 - Tech Surveyor",
                Email = "officer2@tatauisl.com",
                PasswordHash = "e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7",
                MobileNumber = "9988776652",
                RoleId = 1,
                IsActive = true,
                OfficerRole = "Officer2"
            });
            context.SaveChanges();
        }

        // Seed Officer 3 (SHA256 of "Admin@123")
        if (!context.Users.Any(u => u.Email == "officer3@tatauisl.com"))
        {
            context.Users.Add(new User
            {
                FullName = "Officer 3 - Approval Officer",
                Email = "officer3@tatauisl.com",
                PasswordHash = "e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7",
                MobileNumber = "9988776653",
                RoleId = 1,
                IsActive = true,
                OfficerRole = "Officer3"
            });
            context.SaveChanges();
        }

        // Seed default connection types
        if (!context.ConnectionTypes.Any())
        {
            context.ConnectionTypes.Add(new ConnectionType { Name = "Domestic New Connection", Category = "Domestic" });
            context.ConnectionTypes.Add(new ConnectionType { Name = "Commercial New Connection", Category = "Commercial" });
            context.ConnectionTypes.Add(new ConnectionType { Name = "Industrial Power Line", Category = "Industrial" });
            context.SaveChanges();
        }

        // Seed Workflow Routes and Stages
        if (!context.WorkflowRoutes.Any())
        {
            var routes = new List<WorkflowRoute>
            {
                new WorkflowRoute
                {
                    Name = "Low Tension Route R1",
                    LevelGroup = "LT G1",
                    Stages = new List<WorkflowStage>
                    {
                        new WorkflowStage { StageName = "Load Survey Details", SequenceOrder = 1, WorkflowLevel = "Level 1", Department = "Technical", RequiredAction = "Verify connected load and premises layout" },
                        new WorkflowStage { StageName = "Land Survey Details", SequenceOrder = 2, WorkflowLevel = "Level 1", Department = "Technical", RequiredAction = "Confirm boundary coordinates and clearance" },
                        new WorkflowStage { StageName = "Load Survey Approval", SequenceOrder = 3, WorkflowLevel = "Level 2", Department = "Technical", RequiredAction = "Approve surveyed capacity limit" },
                        new WorkflowStage { StageName = "Estimate Details", SequenceOrder = 4, WorkflowLevel = "Level 1", Department = "Engineering", RequiredAction = "Draft material cost estimates" },
                        new WorkflowStage { StageName = "Estimate Approval", SequenceOrder = 5, WorkflowLevel = "Level 2", Department = "Engineering", RequiredAction = "Verify and authorize estimated budget" },
                        new WorkflowStage { StageName = "Bill Verification Level 1", SequenceOrder = 6, WorkflowLevel = "Level 1", Department = "Accounts", RequiredAction = "Verify payment voucher clearance" },
                        new WorkflowStage { StageName = "Bill Verification Level 2", SequenceOrder = 7, WorkflowLevel = "Level 2", Department = "Accounts", RequiredAction = "Audit transaction details" },
                        new WorkflowStage { StageName = "Demand Note", SequenceOrder = 8, WorkflowLevel = "Level 1", Department = "Accounts", RequiredAction = "Issue official payment demand note" },
                        new WorkflowStage { StageName = "Job Allotment", SequenceOrder = 9, WorkflowLevel = "Level 1", Department = "Operations", RequiredAction = "Allot installation task to field team" },
                        new WorkflowStage { StageName = "RFC Entry", SequenceOrder = 10, WorkflowLevel = "Level 1", Department = "Operations", RequiredAction = "Log Ready For Commissioning state details" },
                        new WorkflowStage { StageName = "Energization", SequenceOrder = 11, WorkflowLevel = "Level 1", Department = "Operations", RequiredAction = "Commission connection and mount smart meter" },
                        new WorkflowStage { StageName = "Move-In", SequenceOrder = 12, WorkflowLevel = "Level 1", Department = "Customer Service", RequiredAction = "Activate consumer profile contract" }
                    }
                },
                new WorkflowRoute
                {
                    Name = "Low Tension Route R2",
                    LevelGroup = "LT G2",
                    Stages = new List<WorkflowStage>
                    {
                        new WorkflowStage { StageName = "Load Survey Details", SequenceOrder = 1, WorkflowLevel = "Level 1", Department = "Technical", RequiredAction = "Verify connected load layout" },
                        new WorkflowStage { StageName = "Estimate Details", SequenceOrder = 2, WorkflowLevel = "Level 1", Department = "Engineering", RequiredAction = "Draft material cost estimates" },
                        new WorkflowStage { StageName = "Estimate Approval", SequenceOrder = 3, WorkflowLevel = "Level 2", Department = "Engineering", RequiredAction = "Verify estimated budget" },
                        new WorkflowStage { StageName = "Demand Note", SequenceOrder = 4, WorkflowLevel = "Level 1", Department = "Accounts", RequiredAction = "Issue payment demand note" },
                        new WorkflowStage { StageName = "Energization", SequenceOrder = 5, WorkflowLevel = "Level 1", Department = "Operations", RequiredAction = "Energize and mount meter" }
                    }
                },
                new WorkflowRoute
                {
                    Name = "High Tension Route",
                    LevelGroup = "HT",
                    Stages = new List<WorkflowStage>
                    {
                        new WorkflowStage { StageName = "Load Survey Details", SequenceOrder = 1, WorkflowLevel = "Level 1", Department = "Technical", RequiredAction = "Verify connected load layout" },
                        new WorkflowStage { StageName = "Estimate Details", SequenceOrder = 2, WorkflowLevel = "Level 1", Department = "Engineering", RequiredAction = "Draft material cost estimates" },
                        new WorkflowStage { StageName = "Estimate Approval", SequenceOrder = 3, WorkflowLevel = "Level 2", Department = "Engineering", RequiredAction = "Verify estimated budget" },
                        new WorkflowStage { StageName = "Demand Note", SequenceOrder = 4, WorkflowLevel = "Level 1", Department = "Accounts", RequiredAction = "Issue payment demand note" },
                        new WorkflowStage { StageName = "Energization", SequenceOrder = 5, WorkflowLevel = "Level 1", Department = "Operations", RequiredAction = "Energize and mount meter" }
                    }
                },
                new WorkflowRoute
                {
                    Name = "Commercial Workflow",
                    LevelGroup = "Commercial",
                    Stages = new List<WorkflowStage>
                    {
                        new WorkflowStage { StageName = "Load Survey Details", SequenceOrder = 1, WorkflowLevel = "Level 1", Department = "Technical", RequiredAction = "Verify connected load layout" },
                        new WorkflowStage { StageName = "Estimate Details", SequenceOrder = 2, WorkflowLevel = "Level 1", Department = "Engineering", RequiredAction = "Draft material cost estimates" },
                        new WorkflowStage { StageName = "Estimate Approval", SequenceOrder = 3, WorkflowLevel = "Level 2", Department = "Engineering", RequiredAction = "Verify estimated budget" },
                        new WorkflowStage { StageName = "Demand Note", SequenceOrder = 4, WorkflowLevel = "Level 1", Department = "Accounts", RequiredAction = "Issue payment demand note" },
                        new WorkflowStage { StageName = "Energization", SequenceOrder = 5, WorkflowLevel = "Level 1", Department = "Operations", RequiredAction = "Energize and mount meter" }
                    }
                },
                new WorkflowRoute
                {
                    Name = "Industrial Workflow",
                    LevelGroup = "Industrial",
                    Stages = new List<WorkflowStage>
                    {
                        new WorkflowStage { StageName = "Load Survey Details", SequenceOrder = 1, WorkflowLevel = "Level 1", Department = "Technical", RequiredAction = "Verify connected load layout" },
                        new WorkflowStage { StageName = "Estimate Details", SequenceOrder = 2, WorkflowLevel = "Level 1", Department = "Engineering", RequiredAction = "Draft material cost estimates" },
                        new WorkflowStage { StageName = "Estimate Approval", SequenceOrder = 3, WorkflowLevel = "Level 2", Department = "Engineering", RequiredAction = "Verify estimated budget" },
                        new WorkflowStage { StageName = "Demand Note", SequenceOrder = 4, WorkflowLevel = "Level 1", Department = "Accounts", RequiredAction = "Issue payment demand note" },
                        new WorkflowStage { StageName = "Energization", SequenceOrder = 5, WorkflowLevel = "Level 1", Department = "Operations", RequiredAction = "Energize and mount meter" }
                    }
                }
            };
            context.WorkflowRoutes.AddRange(routes);
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred seeding the Tata UISL database.");
    }
}

// 8. Configure HTTP Request Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Tata UISL API v1"));
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
