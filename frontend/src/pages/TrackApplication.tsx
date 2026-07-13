import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Clipboard, Clock, CheckCircle2, AlertCircle, Upload, MessageSquare
} from 'lucide-react';
import { applicationService, documentService } from '../services/api';
import type { Application } from '../services/mockData';
import { toast } from 'react-toastify';

export const TrackApplication: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  // File re-upload states
  const [reuploadingDoc, setReuploadingDoc] = useState<string | null>(null);
  const [reuploadProgress, setReuploadProgress] = useState<number>(0);

  const fetchApps = async () => {
    try {
      const apps = await applicationService.getApplications();
      setApplications(apps);
      
      // Select application based on URL search query, quick-track storage, or default to first
      const quickTrackNum = localStorage.getItem('tata_quick_track_number');
      const queryId = searchParams.get('id');

      if (queryId) {
        const found = apps.find(a => a.id === queryId);
        if (found) setSelectedApp(found);
      } else if (quickTrackNum) {
        const found = apps.find(a => a.applicationNumber === quickTrackNum);
        if (found) {
          setSelectedApp(found);
          toast.success(`Loaded tracked application: ${quickTrackNum}`);
        }
        localStorage.removeItem('tata_quick_track_number'); // clear it
      } else if (apps.length > 0) {
        setSelectedApp(apps[0]);
      }
    } catch (err: any) {
      toast.error('Error fetching applications for tracking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [searchParams]);

  const handleAppChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = applications.find(a => a.id === e.target.value);
    if (found) setSelectedApp(found);
  };

  const getTimelineSteps = (currentStatus: Application['currentStatus']) => {
    const allSteps = [
      { name: 'Application Submitted', key: 'Submitted', desc: 'Your connection request was successfully registered in the system.' },
      { name: 'Document Verification', key: 'Document Verification', desc: 'Our desk officers are auditing your submitted Aadhaar, PAN, and property deeds.' },
      { name: 'Under Review', key: 'Under Review', desc: 'A field engineer is assigned to audit your site dimensions and grid distance.' },
      { name: 'Approved / Rejected', key: 'Approved_Rejected', desc: 'Final approval signoff or rejection notice with remarks.' },
      { name: 'Connection Completed', key: 'Connection Completed', desc: 'Smart meter installed, power grid mapped, and line activated.' }
    ];

    const getStatusIndex = (status: string) => {
      if (status === 'Submitted') return 0;
      if (status === 'Document Verification') return 1;
      if (status === 'Under Review') return 2;
      if (status === 'Approved' || status === 'Rejected') return 3;
      if (status === 'Connection Completed') return 4;
      return 0;
    };

    const activeIdx = getStatusIndex(currentStatus);

    return allSteps.map((step, idx) => {
      let state: 'upcoming' | 'active' | 'completed' = 'upcoming';
      if (idx < activeIdx) state = 'completed';
      else if (idx === activeIdx) state = 'active';

      // Custom check for status names
      let stepName = step.name;
      if (idx === 3) {
        if (currentStatus === 'Approved') stepName = 'Approved';
        else if (currentStatus === 'Rejected') stepName = 'Rejected';
      }

      return {
        ...step,
        name: stepName,
        state
      };
    });
  };

  // Re-upload document handler
  const handleReupload = async (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedApp) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setReuploadingDoc(docType);
    setReuploadProgress(10);

    const interval = setInterval(() => {
      setReuploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 100);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await documentService.uploadDocument(
          selectedApp.id,
          docType,
          file.name,
          file.size,
          reader.result as string
        );
        
        // If the application was Rejected because of document, change status back to verification
        if (selectedApp.currentStatus === 'Correction Required' || selectedApp.currentStatus === 'Rejected') {
          await applicationService.updateApplication(selectedApp.id, {
            ...selectedApp,
            currentStatus: 'Submitted'
          });
        }

        toast.success(`Corrected ${docType} submitted successfully!`);
        fetchApps();
      } catch (err: any) {
        toast.error('Re-upload failed. Please try again.');
      } finally {
        clearInterval(interval);
        setReuploadingDoc(null);
        setReuploadProgress(0);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tata-blue"></div>
        <p className="text-xs text-gray-400 font-semibold">Loading tracker console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Track Application Status</h1>
          <p className="text-xs text-gray-400 mt-1">Review live timelines, field audit reports, and officer decisions.</p>
        </div>

        {applications.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 font-bold uppercase">Select Application:</span>
            <select 
              value={selectedApp?.id || ''} 
              onChange={handleAppChange}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-white focus:outline-none"
            >
              {applications.map(a => (
                <option key={a.id} value={a.id}>{a.applicationNumber} ({a.applicationType})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700/50 text-center space-y-4">
          <Clipboard className="mx-auto text-gray-300" size={36} />
          <p className="text-xs text-gray-400">No applications registered. Please submit an application to start tracking.</p>
        </div>
      ) : selectedApp && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Timeline Visualizer */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 space-y-8">
            <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Status Pipeline</h3>

            <div className="relative border-l-2 border-gray-100 dark:border-slate-700 ml-4 pl-8 space-y-8">
              {getTimelineSteps(selectedApp.currentStatus).map((step, index) => {
                const isCompleted = step.state === 'completed';
                const isActive = step.state === 'active';
                const isRejectedStep = step.name === 'Rejected' && selectedApp.currentStatus === 'Rejected';

                return (
                  <div key={index} className="relative">
                    {/* Timeline Node Icon */}
                    <div className={`absolute -left-[43px] top-0 h-7 w-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isActive 
                          ? isRejectedStep
                            ? 'bg-red-500 border-red-500 text-white animate-pulse'
                            : 'bg-tata-blue border-tata-blue text-white animate-pulse'
                          : 'bg-white border-gray-200 text-gray-300 dark:bg-slate-800 dark:border-slate-700'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={14} /> : <Clock size={12} />}
                    </div>

                    <div className="space-y-1.5 text-left">
                      <h4 className={`text-xs font-bold ${isActive ? isRejectedStep ? 'text-red-500' : 'text-tata-blue dark:text-tata-blue-light' : isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>
                        {step.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 leading-normal max-w-lg">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Summary details & Remarks */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Details Box */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 space-y-4">
              <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider border-b border-gray-50 dark:border-slate-700/20 pb-2">Details</h4>
              
              <div className="space-y-3.5 text-xs text-left">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Application Number</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 block font-mono">{selectedApp.applicationNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Connection Category</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 block">{selectedApp.connectionTypeName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Assigned Field Officer</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 block">{selectedApp.assignedOfficer}</span>
                </div>
              </div>
            </div>

            {/* Officer Remarks List */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 space-y-4 text-left">
              <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center border-b border-gray-50 dark:border-slate-700/20 pb-2">
                <MessageSquare size={14} className="mr-2 text-tata-blue" /> Remarks & Feedbacks
              </h4>

              <div className="space-y-4 max-h-48 overflow-y-auto">
                {selectedApp.remarks.length === 0 ? (
                  <p className="text-xs text-gray-400">No review remarks recorded yet.</p>
                ) : (
                  selectedApp.remarks.map((rem) => (
                    <div key={rem.id} className="p-3 bg-gray-50 dark:bg-slate-900/40 rounded-xl space-y-1.5 border border-gray-100 dark:border-slate-800 text-xs">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-gray-600 dark:text-gray-300">{rem.officerName}</span>
                        <span className="text-gray-400 font-mono">{new Date(rem.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-400 leading-normal">{rem.remarks}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Required: Rejected document upload resolver */}
            {selectedApp.documents.some(d => d.verificationStatus === 'Rejected') && (
              <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-200/50 dark:border-red-900/30 space-y-4 text-left">
                <h4 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider flex items-center">
                  <AlertCircle size={14} className="mr-2" /> Resolution Hub
                </h4>
                
                <div className="space-y-3">
                  {selectedApp.documents.filter(d => d.verificationStatus === 'Rejected').map((doc) => (
                    <div key={doc.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-red-100 dark:border-red-950/20 shadow-sm space-y-3">
                      <div className="text-xs">
                        <span className="font-bold text-gray-800 dark:text-white block">{doc.documentType}</span>
                        <span className="text-[10px] text-red-500 block font-semibold mt-1">Rejection Reason: {doc.rejectionReason}</span>
                      </div>

                      {reuploadingDoc === doc.documentType ? (
                        <div className="flex items-center space-x-3 w-full text-xs">
                          <div className="flex-1 bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-tata-blue h-full" style={{ width: `${reuploadProgress}%` }}></div>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">{reuploadProgress}%</span>
                        </div>
                      ) : (
                        <label className="w-full py-1.5 border border-dashed border-red-200 dark:border-red-900/30 hover:border-red-400 bg-red-50/20 hover:bg-red-50/50 text-[10px] font-bold text-red-600 dark:text-red-400 rounded-lg cursor-pointer transition flex items-center justify-center">
                          <Upload size={12} className="mr-1.5" /> Re-upload File
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf, .jpg, .png, .jpeg"
                            onChange={(e) => handleReupload(doc.documentType, e)}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
