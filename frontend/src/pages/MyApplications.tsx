import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Clock, Edit3, Trash2, Eye, Search, Clipboard, Printer
} from 'lucide-react';
import { applicationService } from '../services/api';
import { type Application } from '../services/mockData';
import { toast } from 'react-toastify';

export const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  
  // Active Tab: 'submitted' or 'drafts'
  const activeTab = searchParams.get('tab') === 'drafts' ? 'drafts' : 'submitted';

  // Details Modal
  const [previewApp, setPreviewApp] = useState<Application | null>(null);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const apps = await applicationService.getApplications();
      setApplications(apps);
      if (apps.length > 0) {
        // Auto-select first application matching the active tab list
        const filtered = apps.filter(a => activeTab === 'drafts' ? a.currentStatus === 'Draft' : a.currentStatus !== 'Draft');
        if (filtered.length > 0) {
          setSelectedApp(filtered[0]);
        } else {
          setSelectedApp(null);
        }
      }
    } catch (e) {
      toast.error('Failed to load applications list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [activeTab]);

  const handleTabChange = (tab: 'submitted' | 'drafts') => {
    setSearchParams({ tab });
  };

  const handleDeleteDraft = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this draft application?')) {
      try {
        await applicationService.deleteApplication(id);
        toast.success('Draft application deleted.');
        fetchApps();
      } catch (e: any) {
        toast.error(e.message || 'Failed to delete draft.');
      }
    }
  };

  const getFilteredApps = () => {
    const isDraftTab = activeTab === 'drafts';
    let filtered = applications.filter(a => isDraftTab ? a.currentStatus === 'Draft' : a.currentStatus !== 'Draft');
    
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        (a.applicationNumber || '').toLowerCase().includes(q) ||
        (a.fullName || '').toLowerCase().includes(q) ||
        (a.connectionTypeName || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const filteredApps = getFilteredApps();

  const handlePrintReceipt = (app: Application) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocker is active. Please enable popups to print receipt.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Tata UISL Connection Receipt - ${app.applicationNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; line-height: 1.5; font-size: 13px; }
            .receipt-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
            .header { border-bottom: 2px solid #005BAC; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .logo-text { font-size: 16px; font-weight: 800; color: #005BAC; text-transform: uppercase; }
            .status-badge { background-color: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
            .title { font-size: 14px; font-weight: 800; color: #1e293b; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; text-align: center; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
            .field { display: flex; flex-direction: column; }
            .label { font-size: 10px; text-transform: uppercase; font-weight: bold; color: #94a3b8; margin-bottom: 4px; }
            .value { font-size: 12px; font-weight: bold; color: #334155; }
            .footer-note { border-top: 1px dashed #e2e8f0; margin-top: 25px; padding-top: 15px; font-size: 10px; color: #64748b; text-align: center; line-height: 1.4; }
            .print-btn-bar { display: flex; justify-content: center; margin-top: 20px; }
            .print-btn { background-color: #005BAC; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
            @media print {
              .print-btn-bar { display: none; }
              body { padding: 0; }
              .receipt-card { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <span class="logo-text">TATA Steel Utilities & Infrastructure</span>
              <span class="status-badge">${app.currentStatus || 'Submitted'}</span>
            </div>
            <h3 class="title">Connection Registration Receipt</h3>
            <div class="grid">
              <div class="field">
                <span class="label">Applicant Name</span>
                <span class="value">${app.fullName || app.customerName || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Application Number</span>
                <span class="value" style="font-family: monospace;">${app.applicationNumber}</span>
              </div>
              <div class="field">
                <span class="label">Connection Type</span>
                <span class="value">${app.connectionTypeName || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Registration Date</span>
                <span class="value">${app.submittedDate ? new Date(app.submittedDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Volt / Load Spec</span>
                <span class="value">${app.voltageRequirement || 'LT'} / ${app.loadRequirement || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Ward / Area</span>
                <span class="value">${app.wardNumber || 'N/A'}, ${app.city || 'N/A'}</span>
              </div>
            </div>
            <div class="footer-note">
              This is a system-generated utility request receipt. No manual signature is required. Your request has been queued for verification. Please keep a copy of this document for future reference.
            </div>
            <div class="print-btn-bar">
              <button class="print-btn" onclick="window.print()">Print This Receipt</button>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Full timeline stages list
  const connectionStages = [
    'Application Verification', 'Document Verification', 'Load Survey', 'Land Survey',
    'Bill Verification', 'Estimate Details', 'Estimate Approval', 'Demand Note',
    'Connection Approval', 'Job Allotment', 'RFC Entry', 'Energization', 'Move-In', 'Completed'
  ];

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto relative min-h-[85vh]">
      
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white">Connection Desk Registry</h1>
          <p className="text-xs text-gray-400 mt-1">Review active connection requests, edit pending draft revisions, and trace stage timelines.</p>
        </div>

        {/* Tab controls */}
        <div className="flex bg-gray-55 dark:bg-slate-900 p-1.5 rounded-xl border border-gray-200 dark:border-slate-750 text-xs font-bold space-x-2">
          <button
            onClick={() => handleTabChange('submitted')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'submitted' 
                ? 'bg-white dark:bg-slate-800 text-[#005BAC] dark:text-tata-blue-light shadow-sm' 
                : 'text-gray-505 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Submitted Requests
          </button>
          <button
            onClick={() => handleTabChange('drafts')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'drafts' 
                ? 'bg-white dark:bg-slate-800 text-[#005BAC] dark:text-tata-blue-light shadow-sm' 
                : 'text-gray-505 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Draft Applications
          </button>
        </div>
      </div>

      {/* Advanced search filter bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50 flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, connection type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-xs font-semibold outline-none focus:border-[#005BAC] transition"
          />
        </div>
      </div>

      {/* Main content grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table/List panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[600px]">
                <thead className="bg-gray-55/60 dark:bg-slate-700/30 text-gray-400 font-bold uppercase border-b border-gray-150 dark:border-slate-700/50">
                  {activeTab === 'submitted' ? (
                    <tr>
                      <th className="py-3 px-4">Application No</th>
                      <th className="py-3 px-4">Submitted Date</th>
                      <th className="py-3 px-4">Current Stage</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="py-3 px-4">Draft ID</th>
                      <th className="py-3 px-4">Last Modified</th>
                      <th className="py-3 px-4">Progress</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/30">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tata-blue mx-auto mb-2"></div>
                        <span>Loading applications...</span>
                      </td>
                    </tr>
                  ) : filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 font-bold">
                        No applications found in this desk queue.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map(app => {
                      const isSelected = selectedApp?.id === app.id;
                      return (
                        <tr 
                          key={app.id} 
                          onClick={() => setSelectedApp(app)}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition cursor-pointer ${
                            isSelected ? 'bg-blue-50/20 dark:bg-blue-950/5' : ''
                          }`}
                        >
                          {activeTab === 'submitted' ? (
                            <>
                              <td className="py-4 px-4 font-mono font-extrabold text-[#005BAC] dark:text-tata-blue-light">
                                {app.applicationNumber}
                              </td>
                              <td className="py-4 px-4 text-gray-500 dark:text-gray-400 font-medium">
                                {app.submittedDate ? new Date(app.submittedDate).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                                {app.currentStage}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                  app.currentStatus === 'Completed' || app.currentStatus === 'Approved'
                                    ? 'bg-green-50 border-green-150 text-green-600 dark:bg-green-950/20'
                                    : app.currentStatus === 'Rejected'
                                      ? 'bg-red-50 border-red-150 text-red-600 dark:bg-red-950/20'
                                      : 'bg-yellow-50 border-yellow-150 text-yellow-600 dark:bg-yellow-950/20'
                                }`}>
                                  {app.currentStatus}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => setPreviewApp(app)}
                                  className="p-1.5 text-gray-400 hover:text-tata-blue rounded hover:bg-gray-50 dark:hover:bg-slate-750 transition"
                                  title="View Details"
                                >
                                  <Eye size={14} />
                                </button>
                                <button 
                                  onClick={() => handlePrintReceipt(app)}
                                  className="p-1.5 text-gray-400 hover:text-green-600 rounded hover:bg-gray-50 dark:hover:bg-slate-750 transition"
                                  title="Download Receipt"
                                >
                                  <Printer size={14} />
                                </button>
                                <button 
                                  onClick={() => navigate(`/customer/track?id=${app.id}`)}
                                  className="p-1.5 text-gray-400 hover:text-[#005BAC] rounded hover:bg-gray-50 dark:hover:bg-slate-750 transition"
                                  title="Track Progress"
                                >
                                  <Clipboard size={14} />
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-4 px-4 font-mono text-gray-500">
                                {app.id.substring(0, 10)}...
                              </td>
                              <td className="py-4 px-4 text-gray-405 font-mono">
                                {app.lastUpdated ? new Date(app.lastUpdated).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2 w-28">
                                  <div className="w-full bg-gray-100 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-[#005BAC] h-full" style={{ width: `${app.profileCompletion || 25}%` }}></div>
                                  </div>
                                  <span className="font-bold text-[9.5px] text-gray-500">{app.profileCompletion || 25}%</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 font-extrabold text-orange-500">
                                Draft
                              </td>
                              <td className="py-4 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => navigate(`/customer/apply?id=${app.id}`)}
                                  className="p-1.5 text-[#005BAC] hover:text-blue-700 rounded hover:bg-gray-50 dark:hover:bg-slate-750 transition"
                                  title="Continue Editing"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={() => setPreviewApp(app)}
                                  className="p-1.5 text-gray-455 hover:text-gray-700 rounded hover:bg-gray-50 dark:hover:bg-slate-750 transition"
                                  title="Preview Draft"
                                >
                                  <Eye size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteDraft(app.id)}
                                  className="p-1.5 text-red-550 hover:text-red-700 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                  title="Delete Draft"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected row details & status timeline tracker */}
        <div className="space-y-4">
          {selectedApp ? (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50 space-y-5">
              <div className="border-b border-gray-100 dark:border-slate-700 pb-3 flex justify-between items-center">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Selected Connection</span>
                  <span className="text-xs font-black text-gray-800 dark:text-white font-mono truncate max-w-[150px]">{selectedApp.applicationNumber || 'Draft Spec'}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  selectedApp.currentStatus === 'Draft' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-[#005BAC] dark:bg-slate-700'
                }`}>
                  {selectedApp.currentStage || 'Draft'}
                </span>
              </div>

              {/* Timeline list */}
              <div className="space-y-4 text-xs">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Connection Verification Roadmap</h4>
                
                {selectedApp.currentStatus === 'Draft' ? (
                  <div className="py-6 text-center text-gray-400 space-y-2">
                    <Clock size={20} className="mx-auto text-gray-300 dark:text-slate-600" />
                    <p className="text-[11px] font-medium leading-relaxed">This connection is a draft copy. Complete the application form to initiate technical verification logs.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-gray-150 dark:border-slate-700 pl-4 space-y-5 py-1">
                    {connectionStages.slice(0, 7).map((stage, idx) => {
                      const isCurrent = selectedApp.currentStage === stage;
                      const isHistory = selectedApp.statusHistory?.some(h => h.stage === stage);
                      
                      let circleColor = 'bg-gray-100 text-gray-400 dark:bg-slate-700';
                      let textColor = 'text-gray-400';

                      if (isHistory && !isCurrent) {
                        circleColor = 'bg-green-500 text-white';
                        textColor = 'text-green-600 dark:text-green-400 font-bold';
                      } else if (isCurrent) {
                        circleColor = 'bg-blue-500 text-white animate-pulse';
                        textColor = 'text-[#005BAC] dark:text-tata-blue-light font-black';
                      }

                      return (
                        <div key={idx} className="relative text-left">
                          <span className={`absolute -left-[23px] top-0 h-4.5 w-4.5 rounded-full flex items-center justify-center text-[9px] font-extrabold ${circleColor}`}>
                            {isHistory && !isCurrent ? '✓' : idx + 1}
                          </span>
                          <div className="space-y-0.5">
                            <p className={`font-bold text-[11px] ${textColor}`}>{stage}</p>
                            {isCurrent && (
                              <p className="text-[10px] text-gray-450 font-semibold italic">
                                Assigned: {selectedApp.assignedOfficer || 'Unassigned'}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="pl-1 text-gray-400 italic text-[10px] font-bold">
                      + 7 more operational release stages...
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50 text-center py-16 text-gray-405 space-y-2">
              <Clock size={24} className="mx-auto text-gray-305 dark:text-slate-700 animate-pulse" />
              <p className="text-xs font-bold">Select an application row to audit timeline milestones.</p>
            </div>
          )}
        </div>

      </div>

      {/* Preview modal drawer */}
      {previewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setPreviewApp(null)} />
          
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl relative z-10 max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 dark:border-slate-700 text-left">
            <div className="bg-[#005BAC] text-white px-6 py-4 flex justify-between items-center">
              <div className="flex flex-col text-left">
                <span className="font-bold text-sm leading-tight">Connection Request Audit Panel</span>
                <span className="text-[10px] text-white/80 font-mono">ID: {previewApp.id}</span>
              </div>
              <button onClick={() => setPreviewApp(null)} className="text-white hover:text-white/80 p-1.5 hover:bg-white/10 rounded-full transition">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-700 dark:text-gray-200">
              
              {/* Personal Details */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider text-[10px] border-b pb-1.5">1. Personal Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 leading-normal">
                  <p><span className="font-bold text-gray-400">Applicant Name:</span> {previewApp.fullName || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Father/Mother Name:</span> {previewApp.relationshipName || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">DOB / Gender:</span> {previewApp.dateOfBirth || 'N/A'} / {previewApp.gender}</p>
                  <p><span className="font-bold text-gray-400">Aadhaar Card:</span> {previewApp.aadhaarNumber || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">PAN Card:</span> {previewApp.panNumber || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Mobile No:</span> {previewApp.phoneNumber || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Email Address:</span> {previewApp.emailId || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Identity Proof:</span> {previewApp.identityCardType || 'N/A'}</p>
                </div>
              </div>

              {/* Connection Details */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider text-[10px] border-b pb-1.5">2. Connection Specifications</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 leading-normal">
                  <p><span className="font-bold text-gray-400">Connection Category:</span> {previewApp.connectionCategory || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Connection Type:</span> {previewApp.connectionTypeName || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Business Area:</span> {previewApp.businessArea || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Voltage Requirement:</span> {previewApp.voltageRequirement || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Load Requirement:</span> {previewApp.loadRequirement || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Purpose of Connection:</span> {previewApp.purposeOfConnection || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Existing BP No:</span> {previewApp.existingBpNo || 'No BP'}</p>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider text-[10px] border-b pb-1.5">3. Premises Address Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 leading-normal">
                  <p><span className="font-bold text-gray-400">House / Street:</span> {previewApp.houseNumber || 'N/A'}, {previewApp.addressLine1}</p>
                  <p><span className="font-bold text-gray-400">Landmark:</span> {previewApp.landmark || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Village / City:</span> {previewApp.city || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">District / State:</span> {previewApp.district} / {previewApp.state}</p>
                  <p><span className="font-bold text-gray-400">PIN Code:</span> {previewApp.pinCode || 'N/A'}</p>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider text-[10px] border-b pb-1.5">4. Property Specifications</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 leading-normal">
                  <p><span className="font-bold text-gray-400">Property Type:</span> {previewApp.propertyType || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Ownership Type:</span> {previewApp.ownershipType || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Plot Number:</span> {previewApp.plotNumber || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Survey Number:</span> {previewApp.surveyNumber || 'N/A'}</p>
                </div>
              </div>

              {/* Business Details */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider text-[10px] border-b pb-1.5">5. Organization & Business Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 leading-normal">
                  <p><span className="font-bold text-gray-400">Organization Name:</span> {previewApp.ownerOrgName || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Vendor Name:</span> {previewApp.vendorName || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400">Certificate Number:</span> {previewApp.vendorCertificateNumber || 'N/A'}</p>
                </div>
              </div>

            </div>

            <div className="bg-gray-50 dark:bg-slate-900/25 px-6 py-4 border-t border-gray-150 dark:border-slate-700/65 flex justify-end">
              <button 
                onClick={() => setPreviewApp(null)}
                className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
        )}

    </div>
  );
};
