import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCw, Filter, Download, Eye, X, 
  Calendar, User as UserIcon, Shield, Database, 
  Clock, Check, Settings, Printer
} from 'lucide-react';
import { settingsService } from '../services/api';
import type { AuditLog } from '../services/mockData';
import { toast } from 'react-toastify';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [ticketFilter, setTicketFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');
  const [appNumberFilter, setAppNumberFilter] = useState('');

  // Daily Statistics State
  const [stats, setStats] = useState<any>({
    totalCreated: 0,
    totalDrafts: 0,
    totalSubmitted: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalReturned: 0,
    totalAccepted: 0,
    totalPending: 0,
    processedPerOfficer: {},
    avgProcessingTimeMinutes: 0
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters = {
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        user: userFilter || undefined,
        module: moduleFilter || undefined,
        actionType: actionFilter || undefined,
        ticketNumber: ticketFilter || undefined,
        ipAddress: ipFilter || undefined,
        applicationNumber: appNumberFilter || undefined
      };

      const [logsData, statsData] = await Promise.all([
        settingsService.getAuditLogs(filters),
        settingsService.getDailyStats()
      ]);

      setLogs(logsData);
      setStats(statsData);
    } catch (err) {
      toast.error('Error loading audit log data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [startDate, endDate, userFilter, moduleFilter, actionFilter, ticketFilter, ipFilter, appNumberFilter]);

  const handleClearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setUserFilter('');
    setModuleFilter('');
    setActionFilter('');
    setTicketFilter('');
    setIpFilter('');
    setAppNumberFilter('');
    toast.info('Filters cleared');
  };

  // General Client Search Fallback
  const filteredLogs = logs.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      l.userName.toLowerCase().includes(s) ||
      (l.employeeId && l.employeeId.toLowerCase().includes(s)) ||
      l.action.toLowerCase().includes(s) ||
      l.tableName.toLowerCase().includes(s) ||
      l.details.toLowerCase().includes(s) ||
      (l.recordId && l.recordId.toLowerCase().includes(s))
    );
  });

  // Action Badges Helper
  const getActionBadgeColor = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('login')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
    if (a.includes('logout') || a.includes('close')) return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800';
    if (a.includes('insert') || a.includes('create') || a.includes('submit')) return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30';
    if (a.includes('update') || a.includes('modify') || a.includes('edit')) return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30';
    if (a.includes('delete') || a.includes('remove') || a.includes('reject')) return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
    if (a.includes('return') || a.includes('correction')) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
    return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-750';
  };

  // OS / Browser Icon Helper
  const getOsLabel = (os?: string) => {
    if (!os) return '-';
    if (os.toLowerCase().includes('windows')) return 'Win';
    if (os.toLowerCase().includes('mac') || os.toLowerCase().includes('ios')) return 'Apple';
    if (os.toLowerCase().includes('android')) return 'Android';
    if (os.toLowerCase().includes('linux')) return 'Linux';
    return os;
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      const headers = ['Timestamp', 'UserName', 'UserID', 'EmployeeID', 'Role', 'Module', 'Action', 'Table', 'RecordID', 'TicketID', 'IPAddress', 'Browser', 'OS', 'Status', 'Details'];
      const rows = filteredLogs.map(l => [
        l.timestamp,
        l.userName,
        l.userId || '',
        l.employeeId || '',
        l.role || '',
        l.module || l.tableName,
        l.action,
        l.tableName,
        l.recordId || '',
        l.ticketId || '',
        l.ipAddress,
        l.browser || '',
        l.operatingSystem || '',
        l.status || 'Success',
        l.details.replace(/"/g, '""')
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(',')].concat(rows.map(r => r.map(val => `"${val}"`).join(','))).join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Tata_UISL_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Logs exported to CSV successfully');
    } catch (e) {
      toast.error('Export to CSV failed');
    }
  };

  // JSON Diff Renderer
  const renderJsonDiff = (beforeStr?: string, afterStr?: string) => {
    if (!beforeStr && !afterStr) {
      return (
        <div className="text-center py-6 border border-gray-100 dark:border-slate-800 rounded-xl text-gray-400 dark:text-gray-500 italic bg-gray-50/50 dark:bg-slate-900/30">
          No JSON state changes captured for this operation
        </div>
      );
    }
    try {
      const beforeObj = beforeStr ? JSON.parse(beforeStr) : {};
      const afterObj = afterStr ? JSON.parse(afterStr) : {};
      const allKeys = Array.from(new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]));

      return (
        <div className="overflow-hidden border border-gray-200 dark:border-slate-700/60 rounded-xl shadow-sm bg-white dark:bg-slate-900">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-55/80 dark:bg-slate-800/80 border-b border-gray-250 dark:border-slate-700/80 font-bold text-gray-500 dark:text-gray-300">
                <th className="p-3 w-1/4 border-r border-gray-200 dark:border-slate-750">Property Name</th>
                <th className="p-3 w-3/8 border-r border-gray-200 dark:border-slate-750 text-red-650 bg-red-50/20 dark:bg-red-950/5">Before Value</th>
                <th className="p-3 w-3/8 text-green-650 bg-green-50/20 dark:bg-green-950/5">After Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-slate-800">
              {allKeys.map(key => {
                const beforeVal = beforeObj[key];
                const afterVal = afterObj[key];
                const isDiff = JSON.stringify(beforeVal) !== JSON.stringify(afterVal);
                
                return (
                  <tr 
                    key={key} 
                    className={`transition-colors ${isDiff ? 'bg-amber-50/15 dark:bg-amber-950/5' : 'hover:bg-gray-50/30 dark:hover:bg-slate-800/20'}`}
                  >
                    <td className="p-3 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-slate-750 bg-gray-50/30 dark:bg-slate-900/30">
                      {key}
                    </td>
                    <td className={`p-3 font-mono text-[10px] leading-relaxed border-r border-gray-200 dark:border-slate-750 ${
                      isDiff ? 'bg-red-50/40 dark:bg-red-950/20 text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {beforeVal !== undefined ? (typeof beforeVal === 'object' ? JSON.stringify(beforeVal, null, 1) : String(beforeVal)) : <span className="text-gray-350 dark:text-gray-600 italic">null</span>}
                    </td>
                    <td className={`p-3 font-mono text-[10px] leading-relaxed ${
                      isDiff ? 'bg-green-50/40 dark:bg-green-950/20 text-green-600 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {afterVal !== undefined ? (typeof afterVal === 'object' ? JSON.stringify(afterVal, null, 1) : String(afterVal)) : <span className="text-gray-350 dark:text-gray-600 italic">null</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    } catch (e) {
      return (
        <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
          <div className="p-3 bg-red-50/40 dark:bg-red-950/10 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl">
            <div className="font-bold mb-1 border-b border-red-100 dark:border-red-950 pb-1 uppercase">Before State:</div>
            <pre className="whitespace-pre-wrap">{beforeStr || 'No Data'}</pre>
          </div>
          <div className="p-3 bg-green-50/40 dark:bg-green-950/10 text-green-650 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-xl">
            <div className="font-bold mb-1 border-b border-green-100 dark:border-green-950 pb-1 uppercase">After State:</div>
            <pre className="whitespace-pre-wrap">{afterStr || 'No Data'}</pre>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 text-left pb-10">
      
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="text-tata-blue dark:text-blue-400" size={26} />
            Central Security & Audit Trail
          </h1>
          <p className="text-xs text-gray-450 mt-1 uppercase font-bold tracking-wider">
            Immutable system logs, login sessions, daily metrics, and database change auditing.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-xl shadow-sm text-xs font-bold transition ${
              showFilters 
                ? 'bg-tata-blue text-white border-tata-blue' 
                : 'bg-white hover:bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-750'
            }`}
          >
            <Filter size={14} />
            Filters {showFilters ? 'Active' : 'Closed'}
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 border border-gray-200 dark:text-white dark:hover:bg-slate-750 rounded-xl shadow-sm text-xs font-bold transition"
            title="Export current filter results to Excel-compatible CSV"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button 
            onClick={fetchLogs}
            className="p-2 border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-700 dark:text-gray-200 rounded-xl shadow-sm transition"
            title="Refresh Logs List"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Daily Application Statistics Dashboard Card */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total stats Card */}
        <div className="bg-gradient-to-br from-tata-blue/5 to-transparent dark:from-blue-950/10 dark:to-transparent bg-white dark:bg-slate-800 p-4 border border-gray-100 dark:border-slate-700/50 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-tata-blue/10 dark:bg-blue-900/20 text-tata-blue dark:text-blue-400 rounded-xl">
            <Database size={20} />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Created Apps</div>
            <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{stats.totalCreated}</div>
            <div className="text-[9px] text-gray-400 mt-0.5">{stats.totalSubmitted} Submitted</div>
          </div>
        </div>

        {/* Draft stats Card */}
        <div className="bg-white dark:bg-slate-800 p-4 border border-gray-100 dark:border-slate-700/50 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-xl">
            <Settings size={20} />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Drafts & Pending</div>
            <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{stats.totalDrafts + stats.totalPending}</div>
            <div className="text-[9px] text-gray-450 mt-0.5">{stats.totalDrafts} Drafts | {stats.totalPending} Active</div>
          </div>
        </div>

        {/* Approved Stats Card */}
        <div className="bg-white dark:bg-slate-800 p-4 border border-gray-100 dark:border-slate-700/50 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl">
            <Check size={20} />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase font-black">Approved / Completed</div>
            <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{stats.totalApproved}</div>
            <div className="text-[9px] text-red-500 font-semibold">{stats.totalRejected} Rejected</div>
          </div>
        </div>

        {/* Return & Accept Stats Card */}
        <div className="bg-white dark:bg-slate-800 p-4 border border-gray-100 dark:border-slate-700/50 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Returned & Accepted</div>
            <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{stats.totalReturned} / {stats.totalAccepted}</div>
            <div className="text-[9px] text-gray-450 mt-0.5">Workflow loops captured</div>
          </div>
        </div>

        {/* Avg Processing Time */}
        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-800 p-4 border border-gray-100 dark:border-slate-700/50 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Avg Processing Time</div>
            <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{stats.avgProcessingTimeMinutes} min</div>
            <div className="text-[9px] text-purple-650 font-bold mt-0.5">SLA verification benchmark</div>
          </div>
        </div>

      </div>

      {/* 3. Collapsible Advanced Filters Section */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 p-5 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-down">
          
          {/* Date range start */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1"><Calendar size={12} /> Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* Date range end */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1"><Calendar size={12} /> End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* User ID / UserName / Employee ID */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1"><UserIcon size={12} /> User Name / ID / Emp ID</label>
            <input 
              type="text" 
              placeholder="e.g. EMP001, Priya, Admin"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* Table / Module */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1"><Database size={12} /> Module Name</label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
            >
              <option value="">All Modules</option>
              <option value="Users">Users & Authentication</option>
              <option value="Applications">Applications</option>
              <option value="Documents">Documents</option>
              <option value="Settings">Settings / Configurations</option>
              <option value="UserSessions">User Sessions</option>
              <option value="ApplicationRemarks">Remarks</option>
            </select>
          </div>

          {/* Action Type */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-600 dark:text-gray-300">Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
            >
              <option value="">All Actions</option>
              <option value="Login">Login</option>
              <option value="Logout">Logout</option>
              <option value="Browser Closure">Browser Closure</option>
              <option value="Insert">Insert (Create)</option>
              <option value="Update">Update (Modify)</option>
              <option value="Delete">Delete (Remove)</option>
              <option value="Forward Stage">Workflow Forward</option>
              <option value="Return">Workflow Return</option>
            </select>
          </div>

          {/* Ticket ID */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-600 dark:text-gray-300">Ticket Number / ID</label>
            <input 
              type="text" 
              placeholder="e.g. TC-9824"
              value={ticketFilter}
              onChange={(e) => setTicketFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* IP Address */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-600 dark:text-gray-300">IP Address</label>
            <input 
              type="text" 
              placeholder="e.g. 192.168.1.45"
              value={ipFilter}
              onChange={(e) => setIpFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* Application ID / Number */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-600 dark:text-gray-300">Application / Record ID</label>
            <input 
              type="text" 
              placeholder="e.g. app_001, TATA-UISL-..."
              value={appNumberFilter}
              onChange={(e) => setAppNumberFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-end gap-2 border-t border-gray-100 dark:border-slate-700 pt-4 mt-2">
            <button 
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-250 dark:border-slate-700 text-gray-600 dark:text-gray-200 hover:bg-gray-55/60 dark:hover:bg-slate-750 text-xs font-bold rounded-xl shadow-xs transition"
            >
              Reset Filters
            </button>
            <button 
              onClick={fetchLogs}
              className="px-4 py-2 bg-tata-blue text-white hover:bg-tata-blue-hover text-xs font-bold rounded-xl shadow-xs transition"
            >
              Apply Filter
            </button>
          </div>

        </div>
      )}

      {/* Search and results status bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Search size={14} /></span>
          <input 
            type="text" 
            placeholder="Type username, action type, target table, detail keyword..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
          />
        </div>
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-between sm:justify-start gap-4">
          <span>Total Compiled: {logs.length}</span>
          <span>Matched View: {filteredLogs.length}</span>
        </div>
      </div>

      {/* 4. Main Audit Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700/80 bg-gray-50/50 dark:bg-slate-900/50 text-gray-450 font-bold uppercase tracking-wider">
                <th className="p-4">Timestamp (UTC)</th>
                <th className="p-4">Trigger User Details</th>
                <th className="p-4">Module & Action</th>
                <th className="p-4">Resource Target ID</th>
                <th className="p-4">Ticket Link</th>
                <th className="p-4">Terminal & IP</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-xs text-gray-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-3 text-tata-blue" />
                    Fetching audit logs from the immutable directory database...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-xs text-gray-400 dark:text-gray-500 italic">
                    No logs match your filter queries.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/40 dark:hover:bg-slate-750/10 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="p-4 font-mono text-[10px] text-gray-400">
                      {new Date(log.timestamp).toUTCString()}
                    </td>

                    {/* Trigger User */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-white flex items-center gap-1">
                          {log.userName}
                        </span>
                        {log.employeeId ? (
                          <span className="text-[10px] text-gray-450 dark:text-gray-400 font-semibold">{log.employeeId} ({log.role || 'Admin'})</span>
                        ) : (
                          <span className="text-[9px] text-gray-350 italic">Customer User</span>
                        )}
                      </div>
                    </td>

                    {/* Module & Action */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                          {log.module || log.tableName}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                    </td>

                    {/* Target Record ID */}
                    <td className="p-4 font-mono text-gray-500 dark:text-gray-400 font-bold">
                      {log.recordId || <span className="text-gray-300 dark:text-gray-600">-</span>}
                    </td>

                    {/* Ticket Link */}
                    <td className="p-4">
                      {log.ticketNumber ? (
                        <div className="flex flex-col">
                          <span className="px-1.5 py-0.5 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-450 border border-yellow-250 dark:border-yellow-900/30 rounded font-mono text-[9px] font-bold">
                            {log.ticketNumber}
                          </span>
                          {log.approvedBy && (
                            <span className="text-[8px] text-gray-400 mt-0.5">Appr: {log.approvedBy}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 font-semibold italic text-[10px]">NULL</span>
                      )}
                    </td>

                    {/* Network details */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400">{log.ipAddress}</span>
                        {log.browser && (
                          <span className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wide font-bold">
                            {log.browser} / {getOsLabel(log.operatingSystem)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        (log.status || 'Success').toLowerCase() === 'success'
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {log.status || 'Success'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-1 text-gray-400 hover:text-tata-blue dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                        title="View details and audit before/after comparison"
                      >
                        <Eye size={15} />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Detailed Audit Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-150 dark:border-slate-700/60 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="text-tata-blue dark:text-blue-400" size={18} />
                  Audit Log details: {selectedLog.action}
                </h2>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">UID: {selectedLog.id}</p>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Detailed Grid Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Section A: User details */}
                <div className="bg-gray-50/50 dark:bg-slate-900/30 p-4 border border-gray-100 dark:border-slate-700/40 rounded-xl space-y-2.5">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon size={13} className="text-gray-400" />
                    Trigger Details
                  </h3>
                  <div className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                    <div><span className="text-gray-400 font-semibold">User:</span> {selectedLog.userName}</div>
                    <div><span className="text-gray-400 font-semibold">User ID:</span> {selectedLog.userId || 'N/A'}</div>
                    {selectedLog.employeeId && (
                      <div><span className="text-gray-400 font-semibold">Employee ID:</span> {selectedLog.employeeId}</div>
                    )}
                    <div><span className="text-gray-400 font-semibold">Role:</span> {selectedLog.role || 'Customer'}</div>
                  </div>
                </div>

                {/* Section B: Environment Details */}
                <div className="bg-gray-50/50 dark:bg-slate-900/30 p-4 border border-gray-100 dark:border-slate-700/40 rounded-xl space-y-2.5">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Printer size={13} className="text-gray-400" />
                    Terminal Details
                  </h3>
                  <div className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                    <div><span className="text-gray-400 font-semibold">IP Address:</span> {selectedLog.ipAddress}</div>
                    <div><span className="text-gray-400 font-semibold">Browser:</span> {selectedLog.browser || 'Unknown'}</div>
                    <div><span className="text-gray-400 font-semibold">OS:</span> {selectedLog.operatingSystem || 'Unknown'}</div>
                    <div><span className="text-gray-400 font-semibold">Device:</span> {selectedLog.device || 'Desktop'}</div>
                  </div>
                </div>

                {/* Section C: Target & Tickets */}
                <div className="bg-gray-50/50 dark:bg-slate-900/30 p-4 border border-gray-100 dark:border-slate-700/40 rounded-xl space-y-2.5">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Database size={13} className="text-gray-400" />
                    Context Details
                  </h3>
                  <div className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                    <div><span className="text-gray-400 font-semibold">Target Module:</span> {selectedLog.module || selectedLog.tableName}</div>
                    <div><span className="text-gray-400 font-semibold">Record ID:</span> {selectedLog.recordId || 'N/A'}</div>
                    {selectedLog.ticketNumber ? (
                      <>
                        <div><span className="text-gray-400 font-semibold text-yellow-600">Ticket Number:</span> {selectedLog.ticketNumber}</div>
                        {selectedLog.approvedBy && (
                          <div><span className="text-gray-400 font-semibold">Approved By:</span> {selectedLog.approvedBy}</div>
                        )}
                      </>
                    ) : (
                      <div><span className="text-gray-450 italic font-semibold">No Ticket Linkage</span></div>
                    )}
                  </div>
                </div>

              </div>

              {/* Event Description Details */}
              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Log Narrative Details:</div>
                <div className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-750 text-gray-700 dark:text-gray-350 rounded-xl">
                  {selectedLog.details}
                </div>
              </div>

              {/* Before and After JSON Compare */}
              <div className="space-y-2">
                <div className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">
                  Database Record Snapshots Diff (Before vs After)
                </div>
                {renderJsonDiff(selectedLog.beforeJson, selectedLog.afterJson)}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-100 dark:border-slate-750 bg-gray-55/20 dark:bg-slate-900/10">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-gray-700 dark:text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
