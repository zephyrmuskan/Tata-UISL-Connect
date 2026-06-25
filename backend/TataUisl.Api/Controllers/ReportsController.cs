using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TataUisl.Core.DTOs;
using TataUisl.Core.Interfaces;

namespace TataUisl.Api.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ReportsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("export")]
        public async Task<IActionResult> GetReportRows()
        {
            var apps = await _unitOfWork.Applications.GetAllAsync();
            var rows = apps.Select(a => new ReportRowDto
            {
                ApplicationNumber = a.ApplicationNumber,
                CustomerName = a.FullName,
                Email = a.Customer?.Email ?? string.Empty,
                Mobile = a.Customer?.MobileNumber ?? string.Empty,
                ConnectionCategory = a.ConnectionType?.Name ?? string.Empty,
                Status = a.CurrentStatus,
                SubmittedDate = a.SubmittedDate,
                AssignedOfficer = a.AssignedOfficer,
                Income = a.AnnualIncome
            });

            return Ok(rows);
        }
    }
}
