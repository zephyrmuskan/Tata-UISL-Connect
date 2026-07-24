using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TataUisl.Core.Interfaces;

namespace TataUisl.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VerificationController : ControllerBase
    {
        private readonly IVerificationService _verificationService;

        public VerificationController(IVerificationService verificationService)
        {
            _verificationService = verificationService;
        }

        [HttpPost("process/{applicationId}")]
        public async Task<IActionResult> ProcessVerification(int applicationId)
        {
            try
            {
                var result = await _verificationService.ProcessDocumentVerificationAsync(applicationId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("results/{applicationId}")]
        public async Task<IActionResult> GetVerificationResults(int applicationId)
        {
            var result = await _verificationService.GetVerificationResultsAsync(applicationId);
            if (result == null)
            {
                result = await _verificationService.ProcessDocumentVerificationAsync(applicationId);
            }
            return Ok(result);
        }

        public class VerificationDecisionDto
        {
            public int ApplicationId { get; set; }
            public string Action { get; set; } = string.Empty;
            public string? Remarks { get; set; }
            public bool IsOverride { get; set; }
            public int UserId { get; set; }
            public string UserName { get; set; } = string.Empty;
        }

        [HttpPost("action")]
        public async Task<IActionResult> SubmitAction([FromBody] VerificationDecisionDto dto)
        {
            if ((dto.IsOverride || dto.Action == "Manual Override") && string.IsNullOrWhiteSpace(dto.Remarks))
            {
                return BadRequest(new { message = "Mandatory remarks required for Manual Override." });
            }

            var success = await _verificationService.SubmitVerificationDecisionAsync(
                dto.ApplicationId, dto.Action, dto.Remarks, dto.IsOverride, dto.UserId, dto.UserName);

            if (!success) return NotFound(new { message = "Application not found" });
            return Ok(new { success = true, message = $"Action '{dto.Action}' submitted successfully." });
        }

        [HttpGet("audit/{applicationNumber}")]
        public async Task<IActionResult> GetAuditLogs(string applicationNumber)
        {
            var logs = await _verificationService.GetVerificationAuditLogsAsync(applicationNumber);
            return Ok(logs);
        }
    }
}
