import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileText, 
  Eye, RefreshCw, Layers, X, FileSearch, UserCheck, 
  MapPin, Printer, Lock, ChevronRight, Info, AlertCircle
} from 'lucide-react';
import type { 
  Application, 
  VerificationSummaryData, 
  DocumentQualityMetric, 
  ExtractedDocumentData 
} from '../services/mockData';
import { verificationService } from '../services/api';

interface DocumentVerificationViewProps {
  application: Application;
  allApplications?: Application[];
  onSelectApplication?: (app: Application) => void;
  onClose: () => void;
  onUpdateStatus?: () => void;
}

export const DocumentVerificationView: React.FC<DocumentVerificationViewProps> = ({
  application,
  allApplications = [],
  onSelectApplication,
  onClose,
  onUpdateStatus
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [data, setData] = useState<VerificationSummaryData | null>(null);
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'comparison' | 'recommendations' | 'quality' | 'audit'>('comparison');
  
  // Override & Action modal state
  const [actionModalType, setActionModalType] = useState<'Approve' | 'Reject' | 'Request Re-upload' | 'Request Additional Document' | 'Manual Override' | null>(null);
  const [actionRemarks, setActionRemarks] = useState<string>('');
  const [remarksError, setRemarksError] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string>('');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  useEffect(() => {
    fetchVerificationData();
  }, [application.id]);

  const fetchVerificationData = async () => {
    setLoading(true);
    try {
      const res = await verificationService.getVerificationResults(application.id);
      setData(res);
    } catch (err) {
      console.error("Failed to load verification data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunReverification = async () => {
    setVerifying(true);
    try {
      const res = await verificationService.processVerification(application.id);
      setData(res);
    } catch (err) {
      console.error("Error re-running verification engine:", err);
    } finally {
      setVerifying(false);
    }
  };

  const handleOpenActionModal = (type: 'Approve' | 'Reject' | 'Request Re-upload' | 'Request Additional Document' | 'Manual Override') => {
    setActionModalType(type);
    setActionRemarks('');
    setRemarksError('');
  };

  const handleSubmitAction = async () => {
    if (!actionModalType) return;
    
    // Validate mandatory remarks for Manual Override or Reject
    if ((actionModalType === 'Manual Override' || actionModalType === 'Reject' || actionModalType === 'Request Re-upload') && !actionRemarks.trim()) {
      setRemarksError(`Mandatory officer remarks required for ${actionModalType}.`);
      return;
    }

    setSubmittingAction(true);
    try {
      await verificationService.submitVerificationAction({
        applicationId: application.id,
        action: actionModalType,
        remarks: actionRemarks,
        isOverride: actionModalType === 'Manual Override'
      });
      setActionSuccessMessage(`Verification action "${actionModalType}" completed successfully.`);
      setActionModalType(null);
      fetchVerificationData();
      if (onUpdateStatus) onUpdateStatus();
    } catch (err: any) {
      setRemarksError(err.message || 'Action failed');
    } finally {
      setSubmittingAction(false);
    }
  };

  const selectedDoc = application.documents && application.documents.length > 0
    ? application.documents[selectedDocIndex]
    : null;

  const extractedDocData: ExtractedDocumentData | undefined = data?.extractedDocuments?.find(
    (d) => selectedDoc && d.documentType.toLowerCase().includes(selectedDoc.documentType.toLowerCase())
  ) || data?.extractedDocuments?.[selectedDocIndex] || data?.extractedDocuments?.[0];

  const qualityData: DocumentQualityMetric | undefined = data?.qualityMetrics?.find(
    (q) => selectedDoc && q.documentType.toLowerCase().includes(selectedDoc.documentType.toLowerCase())
  ) || data?.qualityMetrics?.[selectedDocIndex] || data?.qualityMetrics?.[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Exact Match':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50"><CheckCircle2 size={12} className="mr-1 text-green-600" /> Exact Match</span>;
      case 'Partial Match':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50"><AlertTriangle size={12} className="mr-1 text-amber-600" /> Partial Match</span>;
      case 'Mismatch':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50"><XCircle size={12} className="mr-1 text-red-600" /> Mismatch</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-slate-750 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700"><Info size={12} className="mr-1 text-gray-400" /> Field Not Found</span>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === 'High') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200">High Risk</span>;
    if (severity === 'Medium') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200">Medium</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200">Low</span>;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-750 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-[#005BAC]">
            <RefreshCw size={32} className="animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Running Document Verification Engine</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Extracting document details, auditing OCR confidence, and performing field match comparison for {application.applicationNumber}...</p>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-750 rounded-full h-2 overflow-hidden">
            <div className="bg-[#005BAC] h-full animate-pulse w-3/4 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col overflow-hidden">
      
      {/* ------------------------------------------------------------- */}
      {/* STICKY ENTERPRISE HEADER BAR WITH APPLICATION SELECTOR        */}
      {/* ------------------------------------------------------------- */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#005BAC] to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">TATA UISL CONNECT</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-300">Document Verification Engine</span>
            </div>
            
            {allApplications.length > 0 && onSelectApplication ? (
              <div className="flex items-center space-x-2 mt-0.5">
                <select
                  value={application.id}
                  onChange={(e) => {
                    const target = allApplications.find(a => a.id === e.target.value);
                    if (target) onSelectApplication(target);
                  }}
                  className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-lg border border-slate-700 outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
                >
                  {allApplications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.applicationNumber} - {app.fullName || app.customerName} ({app.currentStage})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Application {application.applicationNumber}</span>
                <span className="text-slate-400 font-normal">({application.fullName || application.customerName})</span>
              </h2>
            )}
          </div>
        </div>

        {/* Header Right Status & Actions */}
        <div className="flex items-center space-x-3">
          {data && (
            <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Score</p>
                <p className={`text-sm font-extrabold ${data.overallScore >= 90 ? 'text-green-400' : data.overallScore >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                  {data.overallScore}%
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-750 flex items-center justify-center font-bold text-xs text-white">
                {data.overallScore >= 90 ? '🟢' : data.overallScore >= 75 ? '🟡' : '🔴'}
              </div>
            </div>
          )}

          <button
            onClick={handleRunReverification}
            disabled={verifying}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
            title="Re-run optical document comparison"
          >
            <RefreshCw size={14} className={verifying ? "animate-spin text-blue-400" : "text-slate-400"} />
            <span>{verifying ? "Processing..." : "Re-Verify"}</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-2 bg-[#005BAC] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-900/30 transition"
          >
            <FileText size={14} />
            <span>Generate Report</span>
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Action Success Alert Toast */}
      {actionSuccessMessage && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-6 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage('')} className="hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* THREE-PANEL SPLIT-SCREEN WORKSPACE CONTENT                     */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden bg-slate-100 dark:bg-slate-900">
        
        {/* ========================================================= */}
        {/* LEFT PANEL: APPLICATION FORM DATA                         */}
        {/* ========================================================= */}
        <div className="col-span-12 md:col-span-3 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-850 overflow-y-auto flex flex-col p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-700 pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center">
              <UserCheck size={14} className="mr-1.5 text-[#005BAC]" /> Application Form Data
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-[#005BAC] border border-blue-150 dark:border-blue-900/40">
              {application.connectionTypeName || 'Connection App'}
            </span>
          </div>

          {/* Section: Applicant Personal Information */}
          <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-gray-150 dark:border-slate-750 space-y-2.5">
            <div className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#005BAC] mr-1.5"></span> Applicant Personal Info
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">Full Applicant Name</span>
                <span className="font-bold text-gray-900 dark:text-white">{application.fullName || application.customerName}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Father's Name</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">{application.fatherName || 'Ramesh Sharma'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Date of Birth</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">{application.dateOfBirth || '1990-05-15'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Gender</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">{application.gender || 'Male'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Mobile Number</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">{application.customerMobile || '9876543210'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Government Identity Proofs */}
          <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-gray-150 dark:border-slate-750 space-y-2.5">
            <div className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span> Identity Credentials
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-white dark:bg-slate-750 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Aadhaar Card No.</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{application.aadhaarNumber || '1234 5678 9012'}</span>
                </div>
                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Entered</span>
              </div>

              <div className="p-2 bg-white dark:bg-slate-750 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">PAN Card No.</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{application.panNumber || 'ABCDE1234F'}</span>
                </div>
                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Entered</span>
              </div>
            </div>
          </div>

          {/* Section: Premises & Connection Address */}
          <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-gray-150 dark:border-slate-750 space-y-2.5 flex-1">
            <div className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
              <MapPin size={12} className="mr-1 text-[#005BAC]" /> Premises Address
            </div>
            
            <div className="space-y-1.5 text-xs text-gray-700 dark:text-slate-300">
              <p><span className="font-semibold text-gray-900 dark:text-white">House/Plot:</span> {application.houseNumber || 'H.No 124'}, {application.addressLine1 || 'Sector 4, Bistupur'}</p>
              {application.addressLine2 && <p><span className="font-semibold text-gray-900 dark:text-white">Line 2:</span> {application.addressLine2}</p>}
              <p><span className="font-semibold text-gray-900 dark:text-white">Locality/Area:</span> {application.area || 'Bistupur'} ({application.wardNumber || 'Ward 12'})</p>
              <p><span className="font-semibold text-gray-900 dark:text-white">Landmark:</span> {application.landmark || 'Near Regal Ground'}</p>
              <p><span className="font-semibold text-gray-900 dark:text-white">City & Pincode:</span> {application.city || 'Jamshedpur'}, {application.state || 'Jharkhand'} - {application.pinCode || '831001'}</p>
            </div>
          </div>

          {/* Customer Uploaded Documents Summary */}
          <div className="pt-2">
            <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-2">Uploaded Attachments</div>
            <div className="space-y-1.5">
              {application.documents?.map((doc, idx) => (
                <button
                  key={doc.id || idx}
                  onClick={() => setSelectedDocIndex(idx)}
                  className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition ${
                    selectedDocIndex === idx
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-[#005BAC] text-[#005BAC] font-bold shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText size={14} className={selectedDocIndex === idx ? 'text-[#005BAC]' : 'text-gray-400'} />
                    <span className="truncate">{doc.documentType}</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER PANEL: COMPARISON DASHBOARD & RECOMMENDATIONS      */}
        {/* ========================================================= */}
        <div className="col-span-12 md:col-span-6 bg-slate-100 dark:bg-slate-900 overflow-y-auto p-5 space-y-5 flex flex-col">
          
          {/* Summary Metric Cards Header */}
          {data && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-850 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Identity Match</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl font-extrabold text-gray-900 dark:text-white">{data.identityMatchScore}%</span>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded">
                    {data.identityMatchScore >= 95 ? 'High' : 'Moderate'}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${data.identityMatchScore}%` }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-850 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Address Match</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl font-extrabold text-gray-900 dark:text-white">{data.addressMatchScore}%</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${data.addressMatchScore}%` }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-850 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">OCR Confidence</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl font-extrabold text-gray-900 dark:text-white">{data.ocrConfidenceScore}%</span>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded">
                    Precise
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${data.ocrConfidenceScore}%` }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-850 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Doc Quality</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl font-extrabold text-gray-900 dark:text-white">{data.documentQualityScore}%</span>
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/30 px-1.5 py-0.5 rounded">
                    Passed
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: `${data.documentQualityScore}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs for Center Panel */}
          <div className="bg-white dark:bg-slate-850 p-1.5 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'comparison'
                  ? 'bg-[#005BAC] text-white shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-750'
              }`}
            >
              <FileSearch size={14} />
              <span>Field Comparison</span>
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'recommendations'
                  ? 'bg-[#005BAC] text-white shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-750'
              }`}
            >
              <Layers size={14} />
              <span>System Recommendations</span>
            </button>

            <button
              onClick={() => setActiveTab('quality')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'quality'
                  ? 'bg-[#005BAC] text-white shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-750'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Quality Metrics</span>
            </button>
          </div>

          {/* TAB 1: FIELD COMPARISON TABLE */}
          {activeTab === 'comparison' && data && (
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="px-5 py-3 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-750 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Automated Field Match Results</h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">Comparison of application form entries against extracted document OCR text</p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2 py-0.5 rounded font-bold bg-green-100 text-green-700 text-[10px]">🟢 {data.exactMatches} Matches</span>
                  {data.partialMatches > 0 && <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-700 text-[10px]">🟡 {data.partialMatches} Partial</span>}
                  {data.mismatches > 0 && <span className="px-2 py-0.5 rounded font-bold bg-red-100 text-red-700 text-[10px]">🔴 {data.mismatches} Mismatches</span>}
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100/70 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200 dark:border-slate-750">
                      <th className="py-2.5 px-4">Field</th>
                      <th className="py-2.5 px-4">Application Value</th>
                      <th className="py-2.5 px-4">Document Value</th>
                      <th className="py-2.5 px-4">Match Status</th>
                      <th className="py-2.5 px-4 text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-slate-750">
                    {data.results.map((res, i) => (
                      <tr key={i} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                          {res.fieldName}
                          {res.documentType && (
                            <span className="block text-[10px] text-gray-400 font-normal">{res.documentType}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-gray-800 dark:text-slate-200 break-words max-w-[140px]">
                          {res.applicationValue}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-gray-800 dark:text-slate-200 break-words max-w-[140px]">
                          {res.documentValue}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1.5">
                            {getStatusBadge(res.matchStatus)}
                            {getSeverityBadge(res.severity)}
                          </div>
                          {res.differenceNote && res.matchStatus !== 'Exact Match' && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 italic font-medium">
                              Note: {res.differenceNote}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-extrabold text-xs ${res.confidenceScore >= 95 ? 'text-green-600' : res.confidenceScore >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                            {res.confidenceScore}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM RECOMMENDATIONS */}
          {activeTab === 'recommendations' && data && (
            <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 flex-1">
              <div className="flex items-center space-x-2 border-b border-gray-150 dark:border-slate-750 pb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-[#005BAC]">
                  <Layers size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">System Recommendations</h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">Rule-based analytical guidance for Customer Relations Officers</p>
                </div>
              </div>

              <div className="space-y-3">
                {data.systemRecommendations.map((rec, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-start space-x-3">
                    <CheckCircle2 size={18} className="text-[#005BAC] shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-gray-800 dark:text-slate-200 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENT QUALITY METRICS */}
          {activeTab === 'quality' && data && (
            <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 flex-1">
              <div className="border-b border-gray-150 dark:border-slate-750 pb-3">
                <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Document Quality Metrics Analysis</h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">Optical clarity, blur detection, and rotation diagnostics</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.qualityMetrics.map((q, i) => (
                  <div key={i} className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-1.5">
                      <span className="font-bold text-xs text-gray-900 dark:text-white">{q.documentType}</span>
                      <span className="text-[10px] font-extrabold text-green-700 bg-green-100 px-2 py-0.5 rounded">{q.qualityStatus}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Blur Score:</span>
                        <span className="font-bold text-gray-800 dark:text-slate-200">{q.blurScore}/100</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Resolution Score:</span>
                        <span className="font-bold text-gray-800 dark:text-slate-200">{q.resolutionScore}/100</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Readability Score:</span>
                        <span className="font-bold text-gray-800 dark:text-slate-200">{q.readabilityScore}/100</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Cropping Check:</span>
                        <span className="font-bold text-gray-800 dark:text-slate-200">{q.isCropped ? 'Cropped' : 'Normal'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* CRO ACTIONS TOOLBAR AT BOTTOM OF CENTER PANEL                 */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Customer Relations Officer Decision</h4>
                <p className="text-[11px] text-slate-400">Select an action to update application verification workflow stage</p>
              </div>
              {data?.decision && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Status: {data.decision}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              <button
                onClick={() => handleOpenActionModal('Approve')}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition shadow-md"
              >
                <CheckCircle2 size={14} />
                <span>Approve</span>
              </button>

              <button
                onClick={() => handleOpenActionModal('Reject')}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition shadow-md"
              >
                <XCircle size={14} />
                <span>Reject</span>
              </button>

              <button
                onClick={() => handleOpenActionModal('Request Re-upload')}
                className="py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition shadow-md"
              >
                <RefreshCw size={14} />
                <span>Re-Upload</span>
              </button>

              <button
                onClick={() => handleOpenActionModal('Request Additional Document')}
                className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition shadow-md"
              >
                <FileText size={14} />
                <span>Add Doc</span>
              </button>

              <button
                onClick={() => handleOpenActionModal('Manual Override')}
                className="col-span-2 sm:col-span-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition shadow-md"
              >
                <Lock size={14} />
                <span>Override</span>
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: EXTRACTED DOCUMENT DATA & LIVE PREVIEW       */}
        {/* ========================================================= */}
        <div className="col-span-12 md:col-span-3 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-850 overflow-y-auto p-4 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-700 pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center">
              <Eye size={14} className="mr-1.5 text-[#005BAC]" /> Extracted OCR Document View
            </h3>
            {qualityData && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                {qualityData.qualityStatus}
              </span>
            )}
          </div>

          {/* Document Preview Box */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 text-white text-center space-y-3 flex flex-col items-center justify-center min-h-[160px] shadow-inner relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-blue-900/50 flex items-center justify-center text-blue-400 border border-blue-700/40">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">{selectedDoc?.documentType || 'Aadhaar Card'}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedDoc?.fileName || 'aadhaar_scan.pdf'}</p>
            </div>
            <span className="inline-flex items-center text-[10px] font-semibold text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-800">
              <CheckCircle2 size={12} className="mr-1" /> OCR Text Parsed
            </span>
          </div>

          {/* Extracted Key-Value Fields */}
          <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-gray-150 dark:border-slate-750 space-y-2.5 flex-1">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-2">
              <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                Extracted Field Data
              </span>
              <span className="text-[10px] text-gray-400 font-semibold">
                Confidence: {extractedDocData?.confidenceScore || 97}%
              </span>
            </div>

            {extractedDocData?.extractedFields ? (
              <div className="space-y-2 text-xs">
                {Object.entries(extractedDocData.extractedFields).map(([key, value]) => (
                  <div key={key} className="p-2 bg-white dark:bg-slate-750 rounded-lg border border-gray-200 dark:border-slate-700">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">{key}</span>
                    <span className="font-semibold text-gray-900 dark:text-white break-words">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-xs italic">
                No OCR fields extracted for this document.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* ACTION MODAL (APPROVE / REJECT / OVERRIDE WITH REMARKS)       */}
      {/* ------------------------------------------------------------- */}
      {actionModalType && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-750 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-150 dark:border-slate-750 pb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                actionModalType === 'Manual Override' ? 'bg-amber-100 text-amber-700' :
                actionModalType === 'Approve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {actionModalType === 'Manual Override' ? <Lock size={20} /> :
                 actionModalType === 'Approve' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{actionModalType}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Application {application.applicationNumber}</p>
              </div>
            </div>

            {actionModalType === 'Manual Override' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold flex items-center"><AlertTriangle size={14} className="mr-1" /> Manual Override Notice</p>
                <p>Overriding document verification scores requires explicit officer justification. This action will be logged in the permanent audit trail.</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase">
                Officer Remarks {(actionModalType === 'Manual Override' || actionModalType === 'Reject' || actionModalType === 'Request Re-upload') && <span className="text-red-500">* (Mandatory)</span>}
              </label>
              <textarea
                rows={3}
                placeholder="Specify detailed verification findings or justification..."
                value={actionRemarks}
                onChange={(e) => {
                  setActionRemarks(e.target.value);
                  setRemarksError('');
                }}
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC]"
              />
              {remarksError && <p className="text-xs text-red-600 font-bold mt-1">{remarksError}</p>}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={handleSubmitAction}
                disabled={submittingAction}
                className="flex-1 py-2.5 bg-[#005BAC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                {submittingAction ? "Submitting..." : "Confirm Action"}
              </button>
              <button
                onClick={() => setActionModalType(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-750 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VERIFICATION PDF REPORT PREVIEW / PRINT MODAL                 */}
      {/* ------------------------------------------------------------- */}
      {showReportModal && data && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-8 shadow-2xl space-y-6 my-8">
            
            {/* Tata UISL Header */}
            <div className="flex items-center justify-between border-b-2 border-[#005BAC] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#005BAC]">TATA UISL</h2>
                <p className="text-xs font-bold text-gray-600 dark:text-slate-400">Tata Steel Utilities and Infrastructure Services Limited</p>
                <p className="text-[10px] text-gray-400">Document Verification Certificate & Audit Log</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-blue-50 text-[#005BAC] font-mono text-xs font-extrabold rounded-lg border border-blue-200">
                  REF: VER-{application.applicationNumber}
                </span>
                <p className="text-[10px] text-gray-400 mt-1">Generated: {new Date().toLocaleString()}</p>
              </div>
            </div>

            {/* Applicant Metadata */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl text-xs border border-gray-200 dark:border-slate-750">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Applicant Name</span>
                <span className="font-bold text-gray-900 dark:text-white">{application.fullName || application.customerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Application No.</span>
                <span className="font-bold text-[#005BAC] font-mono">{application.applicationNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Overall Score</span>
                <span className="font-extrabold text-green-600">{data.overallScore}%</span>
              </div>
            </div>

            {/* Verification Summary Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase">Field Comparison Summary</h4>
              <table className="w-full text-xs text-left border-collapse border border-gray-200 dark:border-slate-750">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                    <th className="p-2 border">Field</th>
                    <th className="p-2 border">Application Value</th>
                    <th className="p-2 border">Document OCR Value</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((r, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 font-semibold border">{r.fieldName}</td>
                      <td className="p-2 border font-mono">{r.applicationValue}</td>
                      <td className="p-2 border font-mono">{r.documentValue}</td>
                      <td className="p-2 border">{r.matchStatus}</td>
                      <td className="p-2 border text-right font-bold">{r.confidenceScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CRO Remarks & Signature Block */}
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs space-y-1">
              <p className="font-bold text-[#005BAC]">CRO Audit Certification:</p>
              <p className="text-gray-700 dark:text-slate-300">
                Verified by {data.verifiedByName || 'Customer Relations Officer EMP002'}. Status: {data.decision || 'Verified'}. Remarks: {data.decisionRemarks || 'All submitted documents verified successfully.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#005BAC] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow"
              >
                <Printer size={14} />
                <span>Print / Download PDF</span>
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-750 text-gray-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
