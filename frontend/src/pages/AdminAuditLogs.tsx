import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { settingsService } from '../services/api';
import type { AuditLog } from '../services/mockData';
import { toast } from 'react-toastify';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      toast.error('Error fetching audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Security & Audit Logs</h1>
          <p className="text-xs text-gray-400 mt-1">Audit security logins, configuration edits, status changes, and administrator approvals.</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="p-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg shadow-sm transition"
          title="Refresh Logs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Action Bars */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Search size={14} /></span>
          <input 
            type="text" 
            placeholder="Search by action, user, table, details..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
          />
        </div>
        <div className="text-xs text-gray-450 font-bold">
          Logs Compiled: {filteredLogs.length}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-400 font-bold uppercase">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Trigger User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Resource Target</th>
                <th className="p-4">Incident Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-xs text-gray-400">Loading logs directory...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-xs text-gray-400">No logs match query.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="p-4 font-mono text-[10px] text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gray-800 dark:text-white">{log.userName}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 font-semibold">{log.tableName}</td>
                    <td className="p-4 text-gray-400 max-w-xs truncate leading-normal" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
