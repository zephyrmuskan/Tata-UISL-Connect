using System.Collections.Generic;
using System.Threading.Tasks;
using TataUisl.Core.Entities;

namespace TataUisl.Core.Interfaces
{
    public interface IVerificationService
    {
        Task<DocumentVerification> ProcessDocumentVerificationAsync(int applicationId);
        Task<DocumentVerification?> GetVerificationResultsAsync(int applicationId);
        Task<bool> SubmitVerificationDecisionAsync(int applicationId, string decision, string? remarks, bool isOverride, int userId, string userName);
        Task<IEnumerable<VerificationAuditLog>> GetVerificationAuditLogsAsync(string applicationNumber);
    }
}
