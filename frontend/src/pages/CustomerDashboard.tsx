import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, FileText, Clipboard, CheckCircle2, 
  Clock, AlertTriangle, HelpCircle, Bell
} from 'lucide-react';
import { applicationService, notificationService } from '../services/api';
import type { Application, Notification } from '../services/mockData';
import { toast } from 'react-toastify';

export const CustomerDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('tata_current_user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apps = await applicationService.getApplications();
        setApplications(apps);
        
        const notifs = await notificationService.getNotifications();
        setNotifications(notifs.slice(0, 5)); // Show recent 5
      } catch (err: any) {
        toast.error('Error fetching dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: Application['currentStatus']) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400';
      case 'Under Verification': 
      case 'Pending Officer 1': return 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950/20 dark:text-yellow-400';
      case 'Pending Officer 2':
      case 'Pending Officer 3': return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400';
      case 'Approved': return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-950/20 dark:text-green-400';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  // Find if any document is rejected in any application
  const rejectedDocs = applications.flatMap(app => 
    app.documents.filter(doc => doc.verificationStatus === 'Rejected').map(doc => ({ app, doc }))
  );

  const activeApplications = applications.filter(a => a.currentStatus !== 'Completed' && a.currentStatus !== 'Rejected');
  const completedConnections = applications.filter(a => a.currentStatus === 'Completed');

  // Profile completion is average profile completion of applications, or 100 if none
  const profileCompletion = applications.length > 0 
    ? Math.round(applications.reduce((acc, a) => acc + a.profileCompletion, 0) / applications.length)
    : 100;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tata-blue"></div>
        <p className="text-xs text-gray-400 font-semibold">Loading Portal Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Welcome Heading Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-tata-blue/10 to-transparent p-6 rounded-2xl border border-tata-blue/10">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center">
            Welcome back, {user.fullName}! <span className="ml-2 text-lg">👋</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage connection requests, load details, and verify active meter status.</p>
        </div>
        <Link 
          to="/customer/apply" 
          className="mt-4 md:mt-0 px-4 py-2.5 bg-tata-blue hover:bg-tata-blue-hover text-white text-xs font-bold rounded-lg shadow-md transition flex items-center"
        >
          New Connection Application <ArrowRight size={14} className="ml-2" />
        </Link>
      </div>

      {/* Rejected Documents Alert */}
      {rejectedDocs.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-2xl flex items-start space-x-3 text-left animate-pulse-slow">
          <AlertTriangle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={18} />
          <div className="text-xs flex-1">
            <span className="font-bold text-red-800 dark:text-red-400 block">Action Required: Document Re-upload Pending</span>
            <div className="text-[11px] text-gray-400 mt-1 space-y-1">
              {rejectedDocs.map(({ app, doc }, index) => (
                <p key={index}>
                  Your <strong>{doc.documentType}</strong> for application <strong>{app.applicationNumber}</strong> was rejected. Reason: <em>{doc.rejectionReason}</em>.
                </p>
              ))}
            </div>
            <Link 
              to="/customer/track" 
              className="inline-block mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded shadow transition"
            >
              Resolve Documents Now
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="p-5 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 rounded-2xl shadow-sm border border-blue-200/50 dark:border-blue-900/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black text-blue-700 dark:text-blue-300 tracking-wider">Total Applications</span>
            <span className="block text-2xl font-extrabold text-blue-900 dark:text-white mt-1">{applications.length}</span>
          </div>
          <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileText size={20} />
          </div>
        </div>

        <div className="p-5 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-900 dark:text-yellow-100 rounded-2xl shadow-sm border border-yellow-200/50 dark:border-yellow-900/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black text-yellow-700 dark:text-yellow-300 tracking-wider">Pending Status</span>
            <span className="block text-2xl font-extrabold text-yellow-900 dark:text-white mt-1">{activeApplications.length}</span>
          </div>
          <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl flex items-center justify-center text-yellow-600 dark:text-yellow-400">
            <Clock size={20} />
          </div>
        </div>

        <div className="p-5 bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-100 rounded-2xl shadow-sm border border-green-200/50 dark:border-green-900/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black text-green-700 dark:text-green-300 tracking-wider">Active Connections</span>
            <span className="block text-2xl font-extrabold text-green-900 dark:text-white mt-1">{completedConnections.length}</span>
          </div>
          <div className="h-10 w-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">Verification Complete</span>
            <span className="text-xs font-bold text-tata-blue dark:text-tata-blue-light">{profileCompletion}%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-tata-blue h-full transition-all duration-500" style={{ width: `${profileCompletion}%` }}></div>
          </div>
        </div>

      </div>

      {/* Grid: My Applications & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Applications List */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">My Applications</h3>
            <Link to="/customer/track" className="text-xs font-semibold text-tata-blue dark:text-tata-blue-light hover:underline flex items-center">
              Track All Applications <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl space-y-4">
              <Clipboard className="mx-auto text-gray-300" size={32} />
              <p className="text-xs text-gray-400">No applications registered under your profile yet.</p>
              <Link 
                to="/customer/apply" 
                className="inline-block px-4 py-2 bg-tata-blue text-white text-[11px] font-bold rounded-lg shadow transition"
              >
                Apply for New Connection
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-400 font-bold uppercase">
                    <th className="pb-3 font-semibold">Application Details</th>
                    <th className="pb-3 font-semibold">Connection Category</th>
                    <th className="pb-3 font-semibold">Submitted Date</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="py-4">
                        <span className="font-bold text-gray-800 dark:text-white block">{app.applicationNumber}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{app.applicationType}</span>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">{app.connectionTypeName}</td>
                      <td className="py-4 text-gray-500 dark:text-gray-400">
                        {new Date(app.submittedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full border ${getStatusColor(app.currentStatus)}`}>
                          {app.currentStatus}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link 
                          to="/customer/track" 
                          className="px-2.5 py-1 text-[10px] font-bold border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                        >
                          Track
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Notifications & Quick Access */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Notifications Panel */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 space-y-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Recent Activity</h3>
            
            <div className="space-y-3.5">
              {notifications.length === 0 ? (
                <p className="text-center py-6 text-xs text-gray-400">No recent notifications.</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="flex space-x-3 text-xs leading-normal border-b border-gray-50 dark:border-slate-700/20 pb-3 last:border-0 last:pb-0">
                    <div className="h-6 w-6 rounded-full bg-tata-blue/10 dark:bg-tata-blue/20 text-tata-blue dark:text-tata-blue-light flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bell size={12} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 dark:text-gray-200 block">{notif.title}</span>
                      <span className="text-[11px] text-gray-400 block mt-0.5">{notif.message}</span>
                      <span className="text-[9px] text-gray-400 block mt-1 font-mono">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Guidelines Links Box */}
          <div className="bg-gradient-to-br from-tata-blue to-tata-blue-dark text-white p-6 rounded-2xl shadow-md space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider">Customer Guidance</h4>
            <p className="text-[11px] text-white/80 leading-relaxed">
              Ensure you have scanned copies of your Aadhaar Card, PAN Card, Ownership Deed, and a recent Electricity Bill (in case of load enhancement) before starting the application form.
            </p>
            <div className="pt-2">
              <a 
                href="#"
                className="inline-flex items-center text-[10px] bg-white/20 hover:bg-white/35 px-3 py-1.5 rounded-lg font-bold transition"
              >
                <HelpCircle size={12} className="mr-1.5" /> Read User Manual
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
