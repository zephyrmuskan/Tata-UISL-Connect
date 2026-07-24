using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TataUisl.Core.Entities;
using TataUisl.Core.Interfaces;

namespace TataUisl.Infrastructure.Services
{
    public class TokenService : ITokenService
    {
        // For production, this should be sourced from secure settings (e.g. appsettings.json or keyvaults)
        private const string SecretKey = "TATA_UISL_ENTERPRISE_APPLICATION_SECRET_JWT_KEY_SIGNATURE_2026";

        public string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(SecretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role?.Name ?? "Customer"),
                    new Claim("EmployeeId", user.EmployeeId ?? string.Empty)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
