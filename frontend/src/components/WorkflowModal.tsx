import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { workflowService } from '../services/api';
import { type WorkflowRoute, type WorkflowStage, type OfficerDetail } from '../services/mockData';
import { toast } from 'react-toastify';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  applicationNumber: string;
  currentStage: string;
  onSuccess: () => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  applicationNumber,
  currentStage,
  onSuccess
}) => {
  console.log('Workflow modal opened for stage:', currentStage);
  const [routes, setRoutes] = useState<WorkflowRoute[]>([]);
  const [officers, setOfficers] = useState<OfficerDetail[]>([]);
  
  const [selectedLevelGroup, setSelectedLevelGroup] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState<number>(0);
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [assignments, setAssignments] = useState<{ [stageName: string]: number }>({});
  const skippedStages: { [stageName: string]: boolean } = {};

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [routesData, officersData] = await Promise.all([
            workflowService.getRoutes(),
            workflowService.getOfficers()
          ]);
          setRoutes(routesData);
          setOfficers(officersData);

          // Default set level & route based on existing defaults if available
          if (routesData.length > 0) {
            const firstRoute = routesData[0];
            setSelectedLevelGroup(firstRoute.levelGroup);
            setSelectedRouteId(firstRoute.id);
            setStages(firstRoute.stages);
            
            // Auto-assign default officers matching departments
            const initialAssignments: { [stageName: string]: number } = {};
            firstRoute.stages.forEach(stg => {
              const matchedOfficer = officersData.find(o => o.department.toLowerCase().includes(stg.department.toLowerCase()) && o.availabilityStatus === 'Available');
              if (matchedOfficer) {
                initialAssignments[stg.stageName] = matchedOfficer.id;
              }
            });
            setAssignments(initialAssignments);
          }
        } catch (e) {
          toast.error('Failed to load workflow configurations.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // Update stages when route changes
  const handleRouteChange = async (routeId: number) => {
    setSelectedRouteId(routeId);
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setStages(route.stages);
      
      const newAssignments: { [stageName: string]: number } = {};
      route.stages.forEach(stg => {
        const matched = officers.find(o => o.department.toLowerCase().includes(stg.department.toLowerCase()) && o.availabilityStatus === 'Available');
        if (matched) {
          newAssignments[stg.stageName] = matched.id;
        }
      });
      setAssignments(newAssignments);
    }
  };

  const levelGroups = Array.from(new Set(routes.map(r => r.levelGroup)));
  
  const filteredRoutes = routes.filter(r => 
    r.levelGroup === selectedLevelGroup
  );

  const handleSave = async (forward = false) => {
    // 1. Validation check
    const requiredStages = stages.filter(s => !skippedStages[s.stageName]);
    const missing = requiredStages.filter(s => !assignments[s.stageName]);
    
    if (missing.length > 0) {
      toast.error(`Please assign responsible officers for: ${missing.map(m => m.stageName).join(', ')}`);
      return;
    }

    const payload = {
      routeId: selectedRouteId,
      levelGroup: selectedLevelGroup,
      assignments: Object.entries(assignments).map(([stageName, officerId]) => ({
        stageName,
        officerId
      }))
    };

    try {
      setSubmitting(true);
      if (forward) {
        await workflowService.forwardWorkflow(applicationId, payload);
        toast.success('Workflow configuration saved and forwarded to next stage.');
      } else {
        await workflowService.saveAssignment(applicationId, payload);
        toast.success('Officer assignments saved successfully.');
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl relative z-10 border border-gray-150 dark:border-slate-700 max-h-[90vh] flex flex-col overflow-hidden text-left"
        >
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 px-6 py-5 border-b border-gray-100 dark:border-slate-700/60 flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-gray-800 dark:text-white">Accept Application - {applicationNumber}</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 transition"
            >
              <X size={16} />
            </button>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tata-blue"></div>
              <span className="text-xs text-gray-400 font-bold">Fetching route levels and available officers...</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Configuration Section */}
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 text-xs">
                
                {/* Level Group Selector */}
                <div className="flex items-center space-x-2">
                  <label className="font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">Level Group *</label>
                  <select
                    value={selectedLevelGroup}
                    onChange={(e) => {
                      const lg = e.target.value;
                      setSelectedLevelGroup(lg);
                      const route = routes.find(r => r.levelGroup === lg);
                      if (route) handleRouteChange(route.id);
                    }}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg font-bold text-gray-800 dark:text-white outline-none min-w-[180px]"
                  >
                    <option value="">Select Level Group</option>
                    {levelGroups.map((lg) => (
                      <option key={lg} value={lg}>{lg}</option>
                    ))}
                  </select>
                </div>

                {/* Select Route Selector */}
                <div className="flex items-center space-x-2">
                  <label className="font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">Select Route*</label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => handleRouteChange(Number(e.target.value))}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg font-bold text-gray-800 dark:text-white outline-none min-w-[220px]"
                  >
                    <option value={0}>Select Route</option>
                    {filteredRoutes.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Dynamic Stages Assignment Table */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs bg-gray-50/50 dark:bg-slate-900/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1200px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-[#4B3E9E] dark:bg-slate-950 text-white font-bold">
                        {stages.map((stg) => (
                          <th 
                            key={stg.id} 
                            className="p-3.5 border-r border-white/10 text-center min-w-[180px]"
                          >
                            <div className="flex flex-col items-center space-y-1">
                              <span className="text-[11px] leading-tight font-black">{stg.stageName}</span>
                              <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black bg-emerald-500 text-white whitespace-nowrap shadow-xs uppercase">
                                {stg.workflowLevel.includes('Level') ? stg.workflowLevel.replace('Level', 'Level -') : `Level - ${stg.workflowLevel}`}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white dark:bg-slate-800">
                        {stages.map((stg) => {
                          const officerId = assignments[stg.stageName];
                          
                          // Officers filtered by department
                          const eligibleOfficers = officers.filter(o => 
                            o.department.toLowerCase().includes(stg.department.toLowerCase())
                          );

                          const getOfficerLabel = (off: OfficerDetail) => {
                            return off.employeeId ? `${off.employeeId}(${off.name})` : `${off.name}()`;
                          };

                          return (
                            <td 
                              key={stg.id} 
                              className="p-4 border-r border-gray-150 dark:border-slate-700 text-center"
                            >
                              <select
                                value={officerId || ''}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setAssignments(prev => ({
                                    ...prev,
                                    [stg.stageName]: val
                                  }));
                                }}
                                className="w-full px-2 py-2 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-xs font-semibold outline-none text-gray-700 dark:text-gray-300"
                              >
                                <option value="">--Select U...</option>
                                {eligibleOfficers.map(off => (
                                  <option key={off.id} value={off.id}>
                                    {getOfficerLabel(off)}
                                  </option>
                                ))}
                              </select>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-50 dark:bg-slate-900/20 px-6 py-4 border-t border-gray-150 dark:border-slate-700/50 flex justify-end space-x-3.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-250 text-xs font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center"
            >
              {submitting ? 'Processing...' : 'Accept & forward to next'}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
