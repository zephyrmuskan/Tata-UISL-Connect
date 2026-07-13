using System;
using System.Threading.Tasks;
using TataUisl.Core.Entities;

namespace TataUisl.Core.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<User> Users { get; }
        IRepository<Role> Roles { get; }
        IRepository<Application> Applications { get; }
        IRepository<Document> Documents { get; }
        IRepository<Notification> Notifications { get; }
        IRepository<AuditLog> AuditLogs { get; }
        IRepository<ConnectionType> ConnectionTypes { get; }
        IRepository<ApplicationRemark> ApplicationRemarks { get; }
        IRepository<ApplicationStatus> ApplicationStatuses { get; }
        IRepository<Setting> Settings { get; }

        Task<int> CompleteAsync();
    }
}
