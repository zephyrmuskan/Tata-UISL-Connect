import React from 'react';
import type { Application } from '../services/mockData';

interface TataWorkflowTimelineProps {
  application: Application;
  isAdmin?: boolean;
}

export interface TimelineStageNode {
  stageName: string;
  status: 'Completed' | 'Pending' | 'Upcoming';
  processedBy?: string;
  processedDate?: string;
  assignedOfficer?: string;
  remarks?: string;
}

export const TATA_UISL_OFFICIAL_STAGES = [
  'SEARCH & APPLICATION ENTRY',
  'APPLICATION VERIFICATION',
  'LOAD SURVEY DETAILS',
  'LAND SURVEY DETAILS',
  'BILL VERIFICATION ENTRY',
  'BILL VERIFICATION APPROVAL',
  'LOAD SURVEY APPROVAL',
  'ESTIMATE DETAILS',
  'ESTIMATE APPROVAL',
  'DEMAND NOTE DETAILS',
  'DEMAND NOTE COLLECTION',
  'JOB ALLOTMNET',
  'RFC/TR ENTRY',
  'ENERGIZATION',
  'MOVE-IN'
];

export const TataWorkflowTimeline: React.FC<TataWorkflowTimelineProps> = ({
  application,
  isAdmin = false
}) => {
  // Determine current stage index in official sequence
  const currentStageName = (application.currentStage || '').toUpperCase();
  const currentStatusName = application.currentStatus || '';

  // Calculate stage progress index based on current application stage
  let activeIndex = 1; // Default to SEARCH & APPLICATION ENTRY completed
  if (currentStatusName === 'Completed' || (currentStatusName as string) === 'Energized') {
    activeIndex = TATA_UISL_OFFICIAL_STAGES.length;
  } else {
    const foundIdx = TATA_UISL_OFFICIAL_STAGES.findIndex(
      s => s.toLowerCase().includes(currentStageName.toLowerCase()) || currentStageName.toLowerCase().includes(s.toLowerCase().replace('/tr', ''))
    );
    if (foundIdx !== -1) {
      activeIndex = Math.max(1, foundIdx);
    }
  }

  // Generate node data matching portal screenshots
  const nodes: TimelineStageNode[] = TATA_UISL_OFFICIAL_STAGES.map((stage, idx) => {
    const isCompleted = idx < activeIndex;
    const isPending = idx === activeIndex;

    // Use default mock officer Abhishek - (8271039154) matching portal screenshot
    const officerInfo = application.assignedOfficer && application.assignedOfficer !== 'Unassigned'
      ? application.assignedOfficer
      : 'Abhishek - (8271039154)';
      
    const dateStr = application.submittedDate 
      ? new Date(application.submittedDate).toLocaleDateString('en-GB').replace(/\//g, '-') 
      : '23-03-2026';

    let remarks = undefined;
    if (idx === 0) remarks = 'Application received for LT Power connection';
    else if (idx === 1 && isCompleted) remarks = 'Testing';

    return {
      stageName: stage,
      status: isCompleted ? 'Completed' : isPending ? 'Pending' : 'Upcoming',
      processedBy: isCompleted ? officerInfo : undefined,
      processedDate: isCompleted ? dateStr : undefined,
      assignedOfficer: isPending ? officerInfo : undefined,
      remarks
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm text-left font-sans">
      
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-800 pb-3 mb-6">
        <div>
          <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">
            Workflow Execution Timeline
          </h3>
          <p className="text-[11px] text-gray-400">
            Real-time stage tracking for Application <span className="font-bold text-[#005BAC] dark:text-blue-400 font-mono">{application.applicationNumber}</span>
          </p>
        </div>
        <span className="text-[10px] font-bold text-[#005BAC] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/40 uppercase">
          {isAdmin ? 'Admin View (Officer Details Visible)' : 'Consumer View (Private Data Masked)'}
        </span>
      </div>

      {/* Vertical Timeline Tree */}
      <div className="relative border-l-2 border-gray-200 dark:border-slate-700 ml-4 pl-6 space-y-6">
        
        {/* START Node */}
        <div className="relative flex items-center space-x-3">
          <div className="absolute -left-[31px] h-3.5 w-3.5 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 shadow-xs" />
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">START</span>
        </div>

        {/* 16 Official Stages */}
        {nodes.map((node, index) => {
          const isCompleted = node.status === 'Completed';
          const isPending = node.status === 'Pending';

          return (
            <div key={index} className="relative group text-left">
              
              {/* Timeline Bullet Dot */}
              <div 
                className={`absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-2 transition-all flex items-center justify-center ${
                  isCompleted 
                    ? 'border-blue-600 bg-white dark:bg-slate-900' 
                    : isPending 
                      ? 'border-amber-500 bg-white dark:bg-slate-900 animate-pulse' 
                      : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                {isCompleted && (
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                )}
                {isPending && (
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                )}
              </div>

              {/* Stage Content */}
              <div className="space-y-1">
                {/* Stage Title */}
                <h4 className={`text-xs font-bold uppercase tracking-wide ${
                  isCompleted 
                    ? 'text-[#005BAC] dark:text-blue-400' 
                    : isPending 
                      ? 'text-amber-600 dark:text-amber-400' 
                      : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {node.stageName}
                </h4>

                {/* Status & Processing Info */}
                {isCompleted && (
                  <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium space-y-0.5">
                    <p>
                      {isAdmin ? (
                        <>
                          <span className="text-gray-500">Processed by </span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{node.processedBy}</span>
                          <span className="text-gray-500">, on </span>
                          <span className="font-semibold text-[#005BAC] dark:text-blue-400">{node.processedDate}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-500">Processed on </span>
                          <span className="font-semibold text-[#005BAC] dark:text-blue-400">{node.processedDate}</span>
                        </>
                      )}
                    </p>
                    {node.remarks && (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Remarks : </span>{node.remarks}
                      </p>
                    )}
                  </div>
                )}

                {isPending && (
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold space-y-0.5">
                    <p>
                      {isAdmin ? (
                        <>
                          <span>Pending !! </span>
                          <span className="text-gray-500 font-normal">Assigned to : </span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{node.assignedOfficer}</span>
                        </>
                      ) : (
                        <span>Pending !!</span>
                      )}
                    </p>
                  </div>
                )}

                {!isCompleted && !isPending && (
                  <p className="text-[10px] text-gray-400 font-normal italic">Upcoming Stage</p>
                )}
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
};
