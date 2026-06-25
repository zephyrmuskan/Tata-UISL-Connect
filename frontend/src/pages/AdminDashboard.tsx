import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowRight } from 'lucide-react';
import { applicationService } from '../services/api';
import type { Application } from '../services/mockData';
import { toast } from 'react-toastify';

export const AdminDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apps = await applicationService.getApplications();
        setApplications(apps);
      } catch (err) {
        toast.error('Error fetching admin statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tata-blue"></div>
        <p className="text-xs text-gray-400 font-semibold">Loading Admin Dashboard...</p>
      </div>
    );
  }

  // Statistics calculations
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.currentStatus === 'Submitted' || a.currentStatus === 'Document Verification' || a.currentStatus === 'Under Review').length;
  const approvedApps = applications.filter(a => a.currentStatus === 'Approved' || a.currentStatus === 'Connection Completed').length;
  const rejectedApps = applications.filter(a => a.currentStatus === 'Rejected').length;
  
  // Today's applications (mocked based on current month)
  const todaysApps = applications.filter(a => {
    const todayStr = new Date().toISOString().split('T')[0];
    return a.submittedDate.split('T')[0] === todayStr;
  }).length;

  const docsPendingApps = applications.filter(a => 
    a.documents.some(d => d.verificationStatus === 'Pending')
  ).length;

  // Distribution calculations
  const domesticCount = applications.filter(a => a.connectionCategory === 'Domestic').length;
  const commercialCount = applications.filter(a => a.connectionCategory === 'Commercial').length;
  const industrialCount = applications.filter(a => a.connectionCategory === 'Industrial').length;

  const domesticPercentage = totalApps ? Math.round((domesticCount / totalApps) * 100) : 0;
  const commercialPercentage = totalApps ? Math.round((commercialCount / totalApps) * 100) : 0;
  const industrialPercentage = totalApps ? Math.round((industrialCount / totalApps) * 100) : 0;

  return (
    <div className="space-y-8 text-left">
      
      {/* Welcome Heading Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900 text-white p-6 rounded-2xl border border-gray-800 shadow-md">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold flex items-center tracking-tight">
            Admin Management Dashboard <span className="ml-2 text-lg">⚙️</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Review active connection workflows, verify documents, and compile reports.</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Link 
            to="/admin/applications"
            className="px-4 py-2 bg-tata-blue hover:bg-tata-blue-hover text-white text-xs font-bold rounded-lg shadow transition"
          >
            Review Applications
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        
        <div className="p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Requests</span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-extrabold text-gray-900 dark:text-white">{totalApps}</span>
            <span className="text-[10px] text-blue-500 font-semibold">In System</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pending Audit</span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-extrabold text-gray-900 dark:text-white">{pendingApps}</span>
            <span className="text-[10px] text-yellow-500 font-semibold">Active</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Approved Requests</span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-extrabold text-gray-900 dark:text-white">{approvedApps}</span>
            <span className="text-[10px] text-green-500 font-semibold">Activated</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Rejected Requests</span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-extrabold text-gray-900 dark:text-white">{rejectedApps}</span>
            <span className="text-[10px] text-red-500 font-semibold">Declined</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Submissions Today</span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-extrabold text-gray-900 dark:text-white">{todaysApps}</span>
            <span className="text-[10px] text-indigo-500 font-semibold">New</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Unverified Docs</span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-extrabold text-gray-900 dark:text-white">{docsPendingApps}</span>
            <span className="text-[10px] text-orange-500 font-semibold">Pending</span>
          </div>
        </div>

      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Monthly Applications Line Graph */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center">
              <BarChart3 size={14} className="mr-2 text-tata-blue" /> Connection Request Volume (Last 6 Months)
            </h3>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Monthly aggregate</span>
          </div>

          {/* Premium Custom SVG Line Chart */}
          <div className="pt-4 h-64 w-full flex items-center justify-center">
            <svg viewBox="0 0 500 200" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f3f4f6" strokeWidth="1" className="dark:stroke-slate-700/40" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#f3f4f6" strokeWidth="1" className="dark:stroke-slate-700/40" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#f3f4f6" strokeWidth="1" className="dark:stroke-slate-700/40" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#e5e7eb" strokeWidth="1" className="dark:stroke-slate-700" />
              
              {/* Line graph points */}
              {/* Jan: 15 (y=150), Feb: 32 (y=120), Mar: 45 (y=90), Apr: 68 (y=60), May: 84 (y=40), Jun: 110 (y=20) */}
              <path 
                d="M 50 150 L 130 120 L 210 90 L 290 60 L 370 40 L 450 20" 
                fill="none" 
                stroke="#005BAC" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Shading under path */}
              <path 
                d="M 50 150 L 130 120 L 210 90 L 290 60 L 370 40 L 450 20 L 450 170 L 50 170 Z" 
                fill="url(#gradient)" 
                opacity="0.12"
              />

              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#005BAC" />
                  <stop offset="100%" stopColor="#005BAC" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Data dots */}
              <circle cx="50" cy="150" r="4.5" fill="#005BAC" stroke="#fff" strokeWidth="1.5" />
              <circle cx="130" cy="120" r="4.5" fill="#005BAC" stroke="#fff" strokeWidth="1.5" />
              <circle cx="210" cy="90" r="4.5" fill="#005BAC" stroke="#fff" strokeWidth="1.5" />
              <circle cx="290" cy="60" r="4.5" fill="#005BAC" stroke="#fff" strokeWidth="1.5" />
              <circle cx="370" cy="40" r="4.5" fill="#005BAC" stroke="#fff" strokeWidth="1.5" />
              <circle cx="450" cy="20" r="4.5" fill="#005BAC" stroke="#fff" strokeWidth="1.5" />

              {/* X Axis labels */}
              <text x="50" y="190" fontSize="8" fill="#9ca3af" textAnchor="middle" fontWeight="bold">JAN</text>
              <text x="130" y="190" fontSize="8" fill="#9ca3af" textAnchor="middle" fontWeight="bold">FEB</text>
              <text x="210" y="190" fontSize="8" fill="#9ca3af" textAnchor="middle" fontWeight="bold">MAR</text>
              <text x="290" y="190" fontSize="8" fill="#9ca3af" textAnchor="middle" fontWeight="bold">APR</text>
              <text x="370" y="190" fontSize="8" fill="#9ca3af" textAnchor="middle" fontWeight="bold">MAY</text>
              <text x="450" y="190" fontSize="8" fill="#9ca3af" textAnchor="middle" fontWeight="bold">JUN</text>
            </svg>
          </div>
        </div>

        {/* Right: Approval Ratio & Connection Types */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Approval Ratio Donut */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 space-y-4">
            <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Approval Ratio</h3>
            
            <div className="flex items-center justify-around">
              {/* SVG circular progress */}
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100 dark:text-slate-700"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-green-500"
                    strokeDasharray={`${totalApps ? Math.round((approvedApps / totalApps) * 100) : 0}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-extrabold text-gray-800 dark:text-white">
                    {totalApps ? Math.round((approvedApps / totalApps) * 100) : 0}%
                  </span>
                  <span className="text-[8px] uppercase text-gray-400 font-bold tracking-wider">Approved</span>
                </div>
              </div>

              {/* Legend details */}
              <div className="text-xs space-y-2 text-left">
                <div className="flex items-center">
                  <span className="h-2.5 w-2.5 bg-green-500 rounded-full mr-2"></span>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold leading-none">Approved</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{approvedApps}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="h-2.5 w-2.5 bg-red-500 rounded-full mr-2"></span>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold leading-none">Rejected</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{rejectedApps}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Types Distribution */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 space-y-4">
            <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Connection Types</h3>
            
            <div className="space-y-3.5 text-xs text-left">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-gray-700 dark:text-gray-300">Domestic ({domesticCount})</span>
                  <span>{domesticPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${domesticPercentage}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-gray-700 dark:text-gray-300">Commercial ({commercialCount})</span>
                  <span>{commercialPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${commercialPercentage}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-gray-700 dark:text-gray-300">Industrial ({industrialCount})</span>
                  <span>{industrialPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${industrialPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Recent Activity / Applications Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Recent Connection Submissions</h3>
          <Link to="/admin/applications" className="text-xs font-bold text-tata-blue dark:text-tata-blue-light hover:underline flex items-center">
            View All Applications <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-400 font-bold uppercase">
                <th className="pb-3">Application No.</th>
                <th className="pb-3">Applicant Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Submission Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
              {applications.slice(0, 5).map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="py-4 font-mono font-bold text-gray-800 dark:text-white">{app.applicationNumber}</td>
                  <td className="py-4 text-gray-700 dark:text-gray-200">{app.fullName}</td>
                  <td className="py-4 text-gray-600 dark:text-gray-300">{app.connectionTypeName}</td>
                  <td className="py-4 text-gray-400">{new Date(app.submittedDate).toLocaleDateString()}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full border ${
                      app.currentStatus === 'Approved' || app.currentStatus === 'Connection Completed' 
                        ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-950/20 dark:text-green-400'
                        : app.currentStatus === 'Rejected'
                          ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950/20 dark:text-yellow-400'
                    }`}>
                      {app.currentStatus}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Link 
                      to={`/admin/applications?id=${app.id}`}
                      className="px-2.5 py-1 text-[10px] font-bold bg-tata-blue hover:bg-tata-blue-hover text-white rounded transition"
                    >
                      Audit App
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
