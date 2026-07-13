using System.Threading.Tasks;
using TataUisl.Core.Entities;
using TataUisl.Core.Interfaces;
using TataUisl.Infrastructure.Data;

namespace TataUisl.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly TataUislDbContext _context;

        public UnitOfWork(TataUislDbContext context)
        {
            _context = context;
            Users = new Repository<User>(_context);
            Roles = new Repository<Role>(_context);
            Applications = new Repository<Application>(_context);
            Documents = new Repository<Document>(_context);
            Notifications = new Repository<Notification>(_context);
            AuditLogs = new Repository<AuditLog>(_context);
            ConnectionTypes = new Repository<ConnectionType>(_context);
            ApplicationRemarks = new Repository<ApplicationRemark>(_context);
            ApplicationStatuses = new Repository<ApplicationStatus>(_context);
            Settings = new Repository<Setting>(_context);
        }

        public IRepository<User> Users { get; private set; }
        public IRepository<Role> Roles { get; private set; }
        public IRepository<Application> Applications { get; private set; }
        public IRepository<Document> Documents { get; private set; }
        public IRepository<Notification> Notifications { get; private set; }
        public IRepository<AuditLog> AuditLogs { get; private set; }
        public IRepository<ConnectionType> ConnectionTypes { get; private set; }
        public IRepository<ApplicationRemark> ApplicationRemarks { get; private set; }
        public IRepository<ApplicationStatus> ApplicationStatuses { get; private set; }
        public IRepository<Setting> Settings { get; private set; }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
