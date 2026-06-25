import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Download, FileText, Check, X, AlertCircle, 
  UserCheck, Shield, Clipboard, Eye
} from 'lucide-react';
import { applicationService, documentService } from '../services/api';
import type { Application, ApplicationDocument } from '../services/mockData';
import { toast } from 'react-toastify';

export const AdminApplications: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Assign Officer & Status Update Form states
  const [officerName, setOfficerName] = useState('');
  const [statusValue, setStatusValue] = useState<Application['currentStatus']>('Submitted');
  const [statusRemarks, setStatusRemarks] = useState('');

  // Rejection Modal states
  const [rejectingDoc, setRejectingDoc] = useState<ApplicationDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Image Preview Modal states
  const [previewingDoc, setPreviewingDoc] = useState<ApplicationDocument | null>(null);

  const fetchApps = async () => {
    try {
      const apps = await applicationService.getApplications();
      setApplications(apps);
      
      const queryId = searchParams.get('id');
      if (queryId) {
        const found = apps.find(a => a.id === queryId);
        if (found) {
          setSelectedApp(found);
          setOfficerName(found.assignedOfficer);
          setStatusValue(found.currentStatus);
        }
      } else if (apps.length > 0 && !selectedApp) {
        setSelectedApp(apps[0]);
        setOfficerName(apps[0].assignedOfficer);
        setStatusValue(apps[0].currentStatus);
      } else if (selectedApp) {
        // Refresh selected app details if updated
        const refreshed = apps.find(a => a.id === selectedApp.id);
        if (refreshed) {
          setSelectedApp(refreshed);
          setOfficerName(refreshed.assignedOfficer);
          setStatusValue(refreshed.currentStatus);
        }
      }
    } catch (err) {
      toast.error('Error loading applications list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    
    const statusParam = searchParams.get('status');
    if (statusParam) {
      if (statusParam.toLowerCase() === 'pending') {
        setStatusFilter('PendingGroup');
      } else if (statusParam.toLowerCase() === 'approved') {
        setStatusFilter('ApprovedGroup');
      } else if (statusParam.toLowerCase() === 'rejected') {
        setStatusFilter('Rejected');
      } else {
        setStatusFilter(statusParam);
      }
    } else {
      setStatusFilter('');
    }
  }, [searchParams]);

  const handleSelectApp = (app: Application) => {
    setSelectedApp(app);
    setOfficerName(app.assignedOfficer);
    setStatusValue(app.currentStatus);
    setStatusRemarks('');
  };

  const handleAssignOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await applicationService.assignOfficer(selectedApp.id, officerName);
      toast.success(`Officer assigned successfully`);
      fetchApps();
    } catch (err) {
      toast.error('Failed to assign officer');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await applicationService.updateApplicationStatus(selectedApp.id, statusValue, statusRemarks);
      toast.success('Application status updated successfully');
      setStatusRemarks('');
      fetchApps();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Verify Document
  const handleVerifyDoc = async (docId: string) => {
    if (!selectedApp) return;
    try {
      await documentService.verifyDocument(selectedApp.id, docId, 'Verified');
      toast.success('Document marked as Verified');
      fetchApps();
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  // Trigger Reject Document Modal
  const openRejectModal = (doc: ApplicationDocument) => {
    setRejectingDoc(doc);
    setRejectionReason('');
  };

  const handleRejectDoc = async () => {
    if (!selectedApp || !rejectingDoc) return;
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }

    try {
      await documentService.verifyDocument(selectedApp.id, rejectingDoc.id, 'Rejected', rejectionReason);
      toast.success(`Document marked as Rejected`);
      setRejectingDoc(null);
      fetchApps();
    } catch (err) {
      toast.error('Document rejection failed');
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = ['Application Number', 'Applicant Name', 'Email', 'Mobile', 'Connection Category', 'Status', 'Submitted Date'];
    const rows = filteredApps.map(a => [
      a.applicationNumber,
      a.fullName,
      a.customerEmail,
      a.customerMobile,
      a.connectionTypeName,
      a.currentStatus,
      a.submittedDate.split('T')[0]
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tata_UISL_Applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filters application array
  const filteredApps = applications.filter(a => {
    const matchesSearch = 
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter) {
      if (statusFilter === 'PendingGroup') {
        matchesStatus = 
          a.currentStatus === 'Submitted' || 
          a.currentStatus === 'Document Verification' || 
          a.currentStatus === 'Under Review';
      } else if (statusFilter === 'ApprovedGroup') {
        matchesStatus = 
          a.currentStatus === 'Approved' || 
          a.currentStatus === 'Connection Completed';
      } else {
        matchesStatus = a.currentStatus === statusFilter;
      }
    }
    
    const matchesType = typeFilter ? a.connectionCategory === typeFilter : true;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tata-blue"></div>
        <p className="text-xs text-gray-400 font-semibold">Loading applications desk...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Connection Applications Desk</h1>
          <p className="text-xs text-gray-400 mt-1">Review connection details, verify documentation files, and approve requests.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition flex items-center"
        >
          <Download size={14} className="mr-2" /> Export CSV
        </button>
      </div>

      {/* Filters Area */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Search size={14} /></span>
          <input 
            type="text" 
            placeholder="Search by name, number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
          />
        </div>

        <div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Document Verification">Document Verification</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Connection Completed">Connection Completed</option>
          </select>
        </div>

        <div>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none dark:text-white"
          >
            <option value="">All Categories</option>
            <option value="Domestic">Domestic</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
          </select>
        </div>

        <div className="flex items-center text-xs font-bold text-gray-400 pl-2">
          Found {filteredApps.length} Applications
        </div>
      </div>

      {/* Main Grid: Split Master-Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Master List Grid */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
          <div className="divide-y divide-gray-50 dark:divide-slate-700/20 max-h-[70vh] overflow-y-auto">
            {filteredApps.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400">No applications matched filters.</div>
            ) : (
              filteredApps.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                return (
                  <div 
                    key={app.id} 
                    onClick={() => handleSelectApp(app)}
                    className={`p-4 cursor-pointer transition text-left border-l-4 ${
                      isSelected 
                        ? 'bg-tata-blue/5 border-tata-blue dark:bg-tata-blue/10' 
                        : 'border-transparent hover:bg-gray-50/50 dark:hover:bg-slate-700/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-gray-800 dark:text-white text-xs">{app.applicationNumber}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                        app.currentStatus === 'Approved' || app.currentStatus === 'Connection Completed' 
                          ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-950/20 dark:text-green-400' 
                          : app.currentStatus === 'Rejected'
                            ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950/20 dark:text-yellow-400'
                      }`}>
                        {app.currentStatus}
                      </span>
                    </div>
                    <span className="block font-bold text-gray-900 dark:text-white text-xs mt-1.5">{app.fullName}</span>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
                      <span>{app.connectionTypeName}</span>
                      <span>{new Date(app.submittedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed View Sheet */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 md:p-8 space-y-6">
          
          {selectedApp ? (
            <>
              {/* Header Info */}
              <div className="border-b border-gray-50 dark:border-slate-700/20 pb-4 flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Audit File</span>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white font-mono mt-0.5">{selectedApp.applicationNumber}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Submitted By</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-xs block mt-0.5">{selectedApp.customerName}</span>
                </div>
              </div>

              {/* Accordions/Tabs - Customer details */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs border-b border-gray-50 dark:border-slate-700/20 pb-6">
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Father/Mother Name</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{selectedApp.fatherName} / {selectedApp.motherName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Gender / DOB</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{selectedApp.gender} / {selectedApp.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Aadhaar / PAN Card</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 uppercase">{selectedApp.aadhaarNumber} / {selectedApp.panNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Billing Address</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{selectedApp.addressLine1}, {selectedApp.addressLine2}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Property Ward / Area</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">Ward {selectedApp.wardNumber}, {selectedApp.area}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Landmark</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{selectedApp.landmark || 'None'}</span>
                </div>
              </div>

              {/* Verification Desk: Document attachments */}
              <div className="border-b border-gray-50 dark:border-slate-700/20 pb-6 space-y-4">
                <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Document Verification Desk</h3>
                
                <div className="space-y-3.5">
                  {selectedApp.documents.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-400">No documents uploaded.</div>
                  ) : (
                    selectedApp.documents.map((doc) => (
                      <div key={doc.id} className="p-3 bg-gray-50 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-700 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 text-xs min-w-0">
                          <FileText size={16} className="text-tata-blue flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-gray-700 dark:text-gray-300 truncate text-[11px]">{doc.documentType}</span>
                            <span className="text-[9px] text-gray-400 truncate">{doc.fileName}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Viewer Trigger */}
                          <button 
                            onClick={() => setPreviewingDoc(doc)}
                            className="p-1.5 border border-gray-200 dark:border-slate-700 hover:border-tata-blue hover:text-tata-blue bg-white dark:bg-slate-800 dark:hover:text-tata-blue rounded transition text-gray-400"
                            title="Preview File"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Verification Actions */}
                          {doc.verificationStatus === 'Pending' ? (
                            <div className="flex space-x-1.5">
                              <button 
                                onClick={() => handleVerifyDoc(doc.id)}
                                className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold rounded flex items-center"
                                title="Approve File"
                              >
                                <Check size={12} className="mr-1" /> Verify
                              </button>
                              <button 
                                onClick={() => openRejectModal(doc)}
                                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded flex items-center"
                                title="Reject File"
                              >
                                <X size={12} className="mr-1" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded border ${
                              doc.verificationStatus === 'Verified' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {doc.verificationStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Status Update Form & Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Officer Assignment */}
                <form onSubmit={handleAssignOfficer} className="space-y-4 border-r border-gray-50 dark:border-slate-700/20 pr-4">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center">
                    <UserCheck size={14} className="mr-2 text-tata-blue" /> Delegate Work
                  </h4>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Assigned Officer</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Officer Neha Sen"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none dark:text-white"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white text-xs font-bold rounded-lg transition"
                  >
                    Assign Officer
                  </button>
                </form>

                {/* Workflow Status Actions */}
                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center">
                    <Shield size={14} className="mr-2 text-tata-blue" /> Pipeline Action
                  </h4>
                  <div className="grid grid-cols-1 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Status Node</label>
                      <select 
                        value={statusValue}
                        onChange={(e) => setStatusValue(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none dark:text-white"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Document Verification">Document Verification</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved (Site Clearance)</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Connection Completed">Connection Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Remarks / Notes</label>
                      <textarea 
                        placeholder="Add decision comments..."
                        value={statusRemarks}
                        onChange={(e) => setStatusRemarks(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2 bg-tata-blue hover:bg-tata-blue-hover text-white text-xs font-bold rounded-lg transition shadow"
                  >
                    Commit Status Update
                  </button>
                </form>

              </div>
            </>
          ) : (
            <div className="text-center py-20 text-xs text-gray-400 space-y-3">
              <Clipboard size={32} className="mx-auto text-gray-300" />
              <p>No applications found in directory.</p>
            </div>
          )}

        </div>

      </div>

      {/* MODAL 1: DOCUMENT REJECTION DIALOG */}
      {rejectingDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xl max-w-md w-full space-y-4 animate-fade-in text-left">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
              <AlertCircle size={16} className="text-red-500 mr-2" /> Reject: {rejectingDoc.documentType}
            </h3>
            <p className="text-xs text-gray-400 leading-normal">
              Please specify the precise reason why the document is rejected. This will be shown to the customer so they can re-upload a corrected file.
            </p>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Rejection Reason *</label>
              <textarea 
                placeholder="e.g. Scanned image is blurry or edges are cut off..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none dark:text-white"
              />
            </div>
            <div className="flex space-x-3 justify-end pt-2 text-xs">
              <button 
                onClick={() => setRejectingDoc(null)}
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectDoc}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition shadow"
              >
                Reject & Send Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DOCUMENT PREVIEW/ZOOM LIGHTBOX */}
      {previewingDoc && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl shadow-2xl max-w-3xl w-full space-y-4 animate-fade-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
              <span className="text-xs font-bold text-gray-800 dark:text-white">{previewingDoc.documentType} ({previewingDoc.fileName})</span>
              <button 
                onClick={() => setPreviewingDoc(null)}
                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded"
              >
                <X size={18} />
              </button>
            </div>

            {/* Document display viewport */}
            <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-900 rounded-lg p-6 flex items-center justify-center min-h-[300px]">
              {previewingDoc.filePath === '#' || !previewingDoc.filePath.startsWith('data:') ? (
                <div className="text-center py-20 text-xs text-gray-400 space-y-2">
                  <FileText size={48} className="mx-auto text-tata-blue/20" />
                  <p>Mock File Attachment Document ({previewingDoc.documentType})</p>
                  <p className="text-[10px] text-gray-400 font-mono">File Path: {previewingDoc.fileName}</p>
                </div>
              ) : (
                <img 
                  src={previewingDoc.filePath} 
                  alt={previewingDoc.documentType} 
                  className="max-w-full max-h-[60vh] object-contain rounded border shadow-sm"
                />
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setPreviewingDoc(null)}
                className="px-4 py-2 bg-tata-blue text-white text-xs font-bold rounded-lg transition"
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
