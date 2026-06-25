using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TataUisl.Core.Interfaces;
using TataUisl.Core.Profiles;
using TataUisl.Infrastructure.Data;
using TataUisl.Infrastructure.Repositories;
using TataUisl.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure EF Core with SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=(localdb)\\mssqllocaldb;Database=TataUislDb;Trusted_Connection=True;MultipleActiveResultSets=true";
builder.Services.AddDbContext<TataUislDbContext>(options =>
    options.UseSqlServer(connectionString));

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
            context.Roles.Add(new Role { Id = 1, Name = "Admin" });
            context.Roles.Add(new Role { Id = 2, Name = "Customer" });
            context.SaveChanges();
        }

        // Seed Admin User (SHA256 of "Admin@123")
        if (!context.Users.Any(u => u.Email == "admin@tatauisl.com"))
        {
            context.Users.Add(new User
            {
                FullName = "Tata UISL System Admin",
                Email = "admin@tatauisl.com",
                PasswordHash = "c7d24a9e403d159048a1b5c5e88863f698e6f1df02e21c81ef40d43a68393fd4", // Hash of "Admin@123"
                MobileNumber = "18003456789",
                RoleId = 1, // Admin role
                IsActive = true
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
