import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings, Plus, Trash2, Mail, Phone, Shield, FileText, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { settingsService, workflowService } from '../services/api';
import type { ConnectionType, WorkflowRoute } from '../services/mockData';
import { toast } from 'react-toastify';

export const AdminSettings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const currentTabType = searchParams.get('type') || '';

  const [settings, setSettings] = useState<any>(null);
  const [connTypes, setConnTypes] = useState<ConnectionType[]>([]);
  const [loading, setLoading] = useState(true);

  // New Connection Type Form state
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCat, setNewTypeCat] = useState<'Domestic' | 'Commercial' | 'Industrial' | 'Other'>('Domestic');

  // Contact Info states
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');

  // Route Master states
  const [routes, setRoutes] = useState<WorkflowRoute[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [routeSearchQuery, setRouteSearchQuery] = useState('');
  const [routePageSize, setRoutePageSize] = useState(10);
  const [routeCurrentPage, setRouteCurrentPage] = useState(1);
  const [moduleFilter, setModuleFilter] = useState('Module 1');
  const [showAddRouteForm, setShowAddRouteForm] = useState(false);
  const [expandedRouteId, setExpandedRouteId] = useState<number | null>(null);
  const [editingRoute, setEditingRoute] = useState<WorkflowRoute | null>(null);
  const [showEditRouteForm, setShowEditRouteForm] = useState(false);

  const [officers, setOfficers] = useState<any[]>([]);

  // Add Route Form states
  const [newRouteServiceType, setNewRouteServiceType] = useState('');
  const [newRouteLevelGroup, setNewRouteLevelGroup] = useState('');
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteAssignees, setNewRouteAssignees] = useState<Record<string, string>>({
    'Load Survey Details': 'vibha',
    'Load Survey Approval': 'vibha',
    'Land Survey Details': 'vibha',
    'Estimate Details': 'vibha',
    'Estimate Approval': 'vibha',
    'Demand Note': 'vibha',
    'Payment': 'vibha',
    'Job Allotment': 'vibha',
    'RFC/TR Entry': 'vibha',
    'Moved-In/Out Closed': 'vibha'
  });
  const [newRouteHierarchies, setNewRouteHierarchies] = useState<Record<string, string>>({
    'Load Survey Details': 'Level 1',
    'Load Survey Approval': 'Level 2',
    'Land Survey Details': 'Level 1',
    'Estimate Details': 'Level 1',
    'Estimate Approval': 'Level 2',
    'Demand Note': 'Level 1',
    'Payment': 'Level 1',
    'Job Allotment': 'Level 1',
    'RFC/TR Entry': 'Level 1',
    'Moved-In/Out Closed': 'Level 1'
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setRoutesLoading(true);
      
      const sets = await settingsService.getSettings();
      setSettings(sets);
      setSupportEmail(sets.supportEmail);
      setSupportPhone(sets.supportPhone);

      const types = await settingsService.getConnectionTypes();
      setConnTypes(types);

      const routesData = await workflowService.getRoutes();
      setRoutes(routesData);

      const officersData = await workflowService.getOfficers();
      setOfficers(officersData);
    } catch (err) {
      toast.error('Failed to load system settings, routes, or officers database');
    } finally {
      setLoading(false);
      setRoutesLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [currentTabType]);

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsService.updateSettings({ supportEmail, supportPhone });
      toast.success('Support details saved successfully');
      fetchSettings();
    } catch (err) {
      toast.error('Failed to update details');
    }
  };

  const handleAddConnectionType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    try {
      const updated = await settingsService.saveConnectionType({ name: newTypeName, category: newTypeCat });
      setConnTypes(updated);
      setNewTypeName('');
      toast.success('Connection type registered');
    } catch (err) {
      toast.error('Failed to save connection type');
    }
  };

  const handleDeleteConnectionType = async (id: number) => {
    if (!window.confirm('Delete this connection type? Existing applications might refer to it.')) return;
    try {
      const updated = await settingsService.deleteConnectionType(id);
      setConnTypes(updated);
      toast.success('Connection type removed');
    } catch (err) {
      toast.error('Deletion failed');
    }
  };
  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName.trim()) {
      toast.error('Route name is required');
      return;
    }
    if (!newRouteServiceType) {
      toast.error('Service type is required');
      return;
    }
    if (!newRouteLevelGroup) {
      toast.error('Level Group is required');
      return;
    }

    const payload = {
      name: newRouteName,
      levelGroup: newRouteLevelGroup,
      stages: Object.entries(newRouteAssignees).map(([stageName, assignee]) => ({
        stageName,
        assignee: `${newRouteHierarchies[stageName] || 'Level 1'}:${assignee}`
      }))
    };

    try {
      setLoading(true);
      await workflowService.addRoute(payload);
      toast.success('New route successfully added to Route Master');
      setShowAddRouteForm(false);
      setNewRouteName('');
      setNewRouteServiceType('');
      setNewRouteLevelGroup('');
      
      // Reload routes
      const routesData = await workflowService.getRoutes();
      setRoutes(routesData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to register new route');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoute = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this route from Route Master? This action cannot be undone.')) return;
    try {
      setLoading(true);
      await workflowService.deleteRoute(id);
      toast.success('Route deleted successfully');
      setExpandedRouteId(null);
      
      // Reload routes
      const routesData = await workflowService.getRoutes();
      setRoutes(routesData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete route');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;
    if (!newRouteName.trim()) {
      toast.error('Route name is required');
      return;
    }
    if (!newRouteServiceType) {
      toast.error('Service type is required');
      return;
    }
    if (!newRouteLevelGroup) {
      toast.error('Level Group is required');
      return;
    }

    const payload = {
      name: newRouteName,
      levelGroup: newRouteLevelGroup,
      stages: Object.entries(newRouteAssignees).map(([stageName, assignee]) => ({
        stageName,
        assignee: `${newRouteHierarchies[stageName] || 'Level 1'}:${assignee}`
      }))
    };

    try {
      setLoading(true);
      await workflowService.updateRoute(editingRoute.id, payload);
      toast.success('Route updated successfully');
      setShowEditRouteForm(false);
      setEditingRoute(null);
      setNewRouteName('');
      setNewRouteServiceType('');
      setNewRouteLevelGroup('');
      
      // Reload routes
      const routesData = await workflowService.getRoutes();
      setRoutes(routesData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update route');
    } finally {
      setLoading(false);
    }
  };

  const getServiceTypeForRoute = (name: string, levelGroup: string): string => {
    const n = name.toLowerCase();
    const lg = levelGroup.toLowerCase();
    
    // Meter testing matches
    if (n.includes('meter testing') || n.includes('energy meter')) {
      if (n.includes('water')) return 'Request for Energy Meter Testing Of Water Connection';
      return 'Request for Energy Meter Testing';
    }
    
    // Water matches
    if (n.includes('provisional water') || n.includes('water provisional')) return 'New Provisional Water Connection';
    if (n.includes('water lt') || lg.includes('water lt') || (n.includes('water') && (lg.includes('lt') || n.includes('low tension')))) return 'New Water Connection LT';
    if (n.includes('water ht') || lg.includes('water ht') || (n.includes('water') && (lg.includes('ht') || n.includes('high tension')))) return 'New Water Connection HT';
    if (n.includes('temporary water') || n.includes('water temporary')) return 'Temporary Water Connection';
    if (n.includes('water disconnection')) return 'Permanent Water Disconnection Request';
    if (n.includes('water reduction')) return 'Load Change Reduction Of Water Connection';
    if (n.includes('water enhancement')) return 'Load Change Enhancemnet Of Water Connection';
    if (n.includes('water relocation') || n.includes('water shifting') || n.includes('water meter change')) return 'Meter MS SL change Relocation Water';
    if (n.includes('water name')) return 'Change in Name of Registered Consumer Of Water Connection';
    if (n.includes('water legal') || n.includes('water ownership')) return 'Transfer of Ownership to Legal Heir Of Water Connection';

    // Power matches
    if (n.includes('name') || n.includes('consumer name')) return 'Change in Name of Registered Consumer';
    if (n.includes('enhancement')) return 'Load Change-Enhancement';
    if (n.includes('reduction')) return 'Load Change-Reduction';
    if (n.includes('relocation') || n.includes('shifting')) return 'Meter/MS/SL change /relocation';
    if (n.includes('provisional')) return 'New Provisional Power Connection';
    if (lg.includes('lt') || n.includes('low tension')) return 'New Power Connection LT';
    if (lg.includes('ht') || n.includes('high tension')) return 'New Power Connection HT';
    if (lg.includes('commercial')) return 'New Power Connection Commercial';
    if (lg.includes('industrial')) return 'New Power Connection Industrial';
    
    // Fallback based on name keyword
    if (n.includes('water')) return 'New Water Connection LT';
    return 'New Power Connection LT'; // fallback default
  };

  const getLevelGroupsForServiceType = (serviceType: string, currentValue?: string): string[] => {
    let options: string[] = [];
    switch (serviceType) {
      case 'New Provisional Power Connection':
        options = ['New Level G2 Provisional PC', 'New Provisional Power Connection - G1'];
        break;
      case 'New Power Connection LT':
        options = ['LT Energization', 'LT G2', 'New Power Connection LT For SK', 'New Power Connections LT for SK'];
        break;
      case 'Temporary Power Connection':
      case 'Temporary Power Connection Short':
        options = ['Temporary PC G1'];
        break;
      case 'Load Change-Enhancement':
        options = ['Load Change-Enhancement G1'];
        break;
      case 'Load Change-Reduction':
        options = ['Load Change-Reduction G1'];
        break;
      case 'Meter/MS/SL change /relocation':
        options = ['Meter/MS/SL change /relocation G1'];
        break;
      case 'Change in Name of Registered Consumer':
        options = ['Change in Name of Registered Consumer G1'];
        break;
      case 'Transfer of Ownership to Legal Heir':
        options = ['Transfer of Ownership to Legal Heir G1'];
        break;
      case 'Permanent Disconnection Request':
        options = ['Permanent Disconnection Request G1'];
        break;
      default:
        options = ['LT G1', 'LT G2', 'HT', 'Commercial', 'Industrial', 'Water LT', 'Water HT', 'Other'];
        break;
    }
    
    if (currentValue && !options.includes(currentValue)) {
      options.unshift(currentValue);
    }
    return options;
  };

  if (currentTabType.toLowerCase() === 'route master' || currentTabType === 'Route Master') {
    // Filter routes by search query
    let filteredRoutes = routes;
    if (routeSearchQuery.trim()) {
      const q = routeSearchQuery.toLowerCase();
      filteredRoutes = routes.filter(r => 
        r.name.toLowerCase().includes(q) ||
        getServiceTypeForRoute(r.name, r.levelGroup).toLowerCase().includes(q)
      );
    }

    // Filter routes by module filter
    if (moduleFilter) {
      filteredRoutes = filteredRoutes.filter(r => {
        const serviceType = getServiceTypeForRoute(r.name, r.levelGroup);
        
        if (moduleFilter === 'Module 1') {
          return [
            'New Provisional Power Connection',
            'New Power Connection LT',
            'New Power Connection HT',
            'New Power Connection Commercial',
            'New Power Connection Industrial',
            'Temporary Power Connection',
            'Temporary Power Connection Short',
            'Load Change-Enhancement',
            'Load Change-Reduction',
            'Meter/MS/SL change /relocation'
          ].includes(serviceType);
        }
        
        if (moduleFilter === 'Module 2') {
          return [
            'Change in Name of Registered Consumer',
            'Transfer of Ownership to Legal Heir',
            'Permanent Disconnection Request',
            'Bill / Invoice Reversal',
            'Debit / Credit Management',
            'Unauthorized Use of Electricity (UUE)',
            'MD Excceded Letter',
            'Long Door Lock > 2 Month',
            'Long Disconnection > 6 Month',
            'Annual Security Deposite Review'
          ].includes(serviceType);
        }
        
        if (moduleFilter === 'Module 3') {
          return [
            'Request for Energy Meter Testing'
          ].includes(serviceType);
        }
        
        if (moduleFilter === 'Module 4') {
          return [
            'New Provisional Water Connection',
            'New Water Connection LT',
            'New Water Connection HT',
            'Temporary Water Connection',
            'Permanent Water Disconnection Request',
            'Load Change Reduction Of Water Connection',
            'Load Change Enhancemnet Of Water Connection',
            'Meter MS SL change Relocation Water',
            'Change in Name of Registered Consumer Of Water Connection',
            'Transfer of Ownership to Legal Heir Of Water Connection',
            'Request for Energy Meter Testing Of Water Connection'
          ].includes(serviceType);
        }
        
        return true;
      });
    }

    // Paginate
    const totalEntries = filteredRoutes.length;
    const startIndex = (routeCurrentPage - 1) * routePageSize;
    const paginatedRoutes = filteredRoutes.slice(startIndex, startIndex + routePageSize);
    const endIndex = Math.min(startIndex + routePageSize, totalEntries);
    const totalPages = Math.ceil(totalEntries / routePageSize);

    // Helpers to get stage assignee
    const getAssigneeForStage = (r: any, stageName: string): string => {
      const stage = r.stages?.find((s: any) => s.stageName.toLowerCase().replace(/\s/g, '').includes(stageName.toLowerCase().replace(/\s/g, '')));
      if (!stage) return '';
      const levelStr = stage.workflowLevel || '';
      if (levelStr.includes(':')) {
        return levelStr.split(':')[1];
      }
      return levelStr;
    };

    const getHierarchyForStage = (r: any, stageName: string): string => {
      const stage = r.stages?.find((s: any) => s.stageName.toLowerCase().replace(/\s/g, '').includes(stageName.toLowerCase().replace(/\s/g, '')));
      if (!stage) return 'Level 1';
      const levelStr = stage.workflowLevel || '';
      if (levelStr.includes(':')) {
        return levelStr.split(':')[0];
      }
      return 'Level 1';
    };

    const SERVICE_TYPES = [
      'New Provisional Power Connection',
      'New Power Connection LT',
      'Temporary Power Connection',
      'Load Change-Enhancement',
      'Load Change-Reduction',
      'Meter/MS/SL change /relocation',
      'Change in Name of Registered Consumer',
      'Transfer of Ownership to Legal Heir',
      'Permanent Disconnection Request',
      'Request for Energy Meter Testing',
      'New Power Connection HT',
      'Bill / Invoice Reversal',
      'Debit / Credit Management',
      'Unauthorized Use of Electricity (UUE)',
      'MD Excceded Letter',
      'Long Door Lock > 2 Month',
      'Long Disconnection > 6 Month',
      'Annual Security Deposite Review',
      'New Provisional Water Connection',
      'New Water Connection LT',
      'New Water Connection HT',
      'Temporary Water Connection',
      'Permanent Water Disconnection Request',
      'Load Change Reduction Of Water Connection',
      'Meter MS SL change Relocation Water',
      'Change in Name of Registered Consumer Of Water Connection',
      'Transfer of Ownership to Legal Heir Of Water Connection',
      'Request for Energy Meter Testing Of Water Connection',
      'Temporary Power Connection Short',
      'Load Change Enhancemnet Of Water Connection'
    ];

    if (showAddRouteForm) {
      return (
        <div className="space-y-6 text-left font-sans animate-fadeIn">
          {/* Card Title & Back Button */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex justify-between items-center">
            <h1 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Add new route</h1>
            <button
              onClick={() => {
                setShowAddRouteForm(false);
                setNewRouteName('');
                setNewRouteServiceType('');
                setNewRouteLevelGroup('');
              }}
              className="px-6 py-1.5 bg-gray-400 hover:bg-gray-500 text-white text-xs font-bold rounded-full transition shadow-sm"
            >
              Back
            </button>
          </div>

          {/* Form Wizard */}
          <form onSubmit={handleAddRoute} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 space-y-6 shadow-sm">
            {/* Top row form controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Service Type *</label>
                <select
                  value={newRouteServiceType}
                  onChange={(e) => {
                    setNewRouteServiceType(e.target.value);
                    setNewRouteLevelGroup('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none dark:text-white"
                  required
                >
                  <option value="" disabled>--Select Service Type--</option>
                  {SERVICE_TYPES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Level Group *</label>
                <select
                  value={newRouteLevelGroup}
                  onChange={(e) => setNewRouteLevelGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none dark:text-white cursor-pointer"
                  required
                >
                  <option value="" disabled>--Select Level Group--</option>
                  {getLevelGroupsForServiceType(newRouteServiceType, newRouteLevelGroup).map(lg => (
                    <option key={lg} value={lg}>{lg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Route Name*</label>
                <input
                  type="text"
                  placeholder="Route Name"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition"
                >
                  Save Route
                </button>
              </div>
            </div>

            {/* Stages config table */}
            {newRouteLevelGroup && (
              <div className="border-t border-gray-100 dark:border-slate-700/60 pt-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-wider">Configure Route Stages</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[700px] border border-gray-100 dark:border-slate-700">
                    <thead className="bg-[#4B3E9E] text-white font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4 w-72">Stage</th>
                        <th className="py-3 px-4 w-60">Approval Hierarchy</th>
                        <th className="py-3 px-4">User/Approver</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 dark:divide-slate-700 font-semibold text-gray-750 dark:text-gray-200">
                      {Object.keys(newRouteAssignees).map((stage, idx) => {
                        const defaultAssigneesList = [
                          { id: 'vibha', name: 'vibha' },
                          { id: 'neha', name: 'neha' },
                          { id: 'suresh', name: 'suresh' },
                          { id: 'rahul', name: 'rahul' }
                        ];
                        const displayOfficers = officers && officers.length > 0 ? officers : defaultAssigneesList;

                        return (
                          <tr key={stage} className="hover:bg-gray-50/40 dark:hover:bg-slate-750/10">
                            <td className="py-3 px-4 text-center font-mono text-gray-400">{idx + 1}</td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-200">{stage}</td>
                            <td className="py-3 px-4">
                              <span className="px-3 py-1 bg-[#e6f4ea] dark:bg-emerald-950/40 text-[#137333] dark:text-emerald-400 text-xs font-bold rounded-full border border-[#ceead6] dark:border-emerald-900/50 inline-flex items-center">
                                {newRouteHierarchies[stage] ? newRouteHierarchies[stage].replace('Level ', 'Level - ') : 'Level - 1'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={newRouteAssignees[stage]}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setNewRouteAssignees(prev => ({
                                    ...prev,
                                    [stage]: val
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none dark:text-white cursor-pointer"
                              >
                                <option value="">--Select User--</option>
                                {displayOfficers.map(off => (
                                  <option key={off.id} value={off.name}>{off.name}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </form>
        </div>
      );
    }

    if (showEditRouteForm && editingRoute) {
      return (
        <div className="space-y-6 text-left font-sans animate-fadeIn">
          {/* Card Title & Back Button */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex justify-between items-center">
            <h1 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Modify route</h1>
            <button
              onClick={() => {
                setShowEditRouteForm(false);
                setEditingRoute(null);
                setNewRouteName('');
                setNewRouteServiceType('');
                setNewRouteLevelGroup('');
              }}
              className="px-6 py-1.5 bg-gray-400 hover:bg-gray-550 text-white text-xs font-bold rounded-full transition shadow-sm"
            >
              Back
            </button>
          </div>

          {/* Form Wizard */}
          <form onSubmit={handleEditRoute} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 space-y-6 shadow-sm">
            {/* Top row form controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Service Type *</label>
                <select
                  value={newRouteServiceType}
                  onChange={(e) => {
                    setNewRouteServiceType(e.target.value);
                    setNewRouteLevelGroup('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none dark:text-white"
                  required
                >
                  <option value="" disabled>--Select Service Type--</option>
                  {SERVICE_TYPES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Level Group *</label>
                <select
                  value={newRouteLevelGroup}
                  onChange={(e) => setNewRouteLevelGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none dark:text-white cursor-pointer"
                  required
                >
                  <option value="" disabled>--Select Level Group--</option>
                  {getLevelGroupsForServiceType(newRouteServiceType, newRouteLevelGroup).map(lg => (
                    <option key={lg} value={lg}>{lg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Route Name*</label>
                <input
                  type="text"
                  placeholder="Route Name"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Stages config table */}
            {newRouteLevelGroup && (
              <div className="border-t border-gray-100 dark:border-slate-700/60 pt-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-wider">Configure Route Stages</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[700px] border border-gray-100 dark:border-slate-700">
                    <thead className="bg-[#4B3E9E] text-white font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4 w-72">Stage</th>
                        <th className="py-3 px-4 w-60">Approval Hierarchy</th>
                        <th className="py-3 px-4">User/Approver</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 dark:divide-slate-700 font-semibold text-gray-750 dark:text-gray-200">
                      {Object.keys(newRouteAssignees).map((stage, idx) => {
                        const defaultAssigneesList = [
                          { id: 'vibha', name: 'vibha' },
                          { id: 'neha', name: 'neha' },
                          { id: 'suresh', name: 'suresh' },
                          { id: 'rahul', name: 'rahul' }
                        ];
                        const displayOfficers = officers && officers.length > 0 ? officers : defaultAssigneesList;

                        return (
                          <tr key={stage} className="hover:bg-gray-50/40 dark:hover:bg-slate-750/10">
                            <td className="py-3 px-4 text-center font-mono text-gray-400">{idx + 1}</td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-200">{stage}</td>
                            <td className="py-3 px-4">
                              <span className="px-3 py-1 bg-[#e6f4ea] dark:bg-emerald-950/40 text-[#137333] dark:text-emerald-400 text-xs font-bold rounded-full border border-[#ceead6] dark:border-emerald-900/50 inline-flex items-center">
                                {newRouteHierarchies[stage] ? newRouteHierarchies[stage].replace('Level ', 'Level - ') : 'Level - 1'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={newRouteAssignees[stage]}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setNewRouteAssignees(prev => ({
                                    ...prev,
                                    [stage]: val
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none dark:text-white cursor-pointer"
                              >
                                <option value="">--Select User--</option>
                                {displayOfficers.map(off => (
                                  <option key={off.id} value={off.name}>{off.name}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </form>
        </div>
      );
    }

    return (
      <div className="space-y-6 text-left relative min-h-[80vh]">
        {/* Title & Top Bar */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Route Master</h1>
            <p className="text-xs text-gray-400 mt-1">Configure and manage stage-level routing assignments for connection requests.</p>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setRouteCurrentPage(1);
              }}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-lg text-xs font-bold text-gray-800 dark:text-white outline-none min-w-[140px] shadow-sm cursor-pointer"
            >
              <option value="Module 1">--Module 1--</option>
              <option value="Module 2">--Module 2--</option>
              <option value="Module 3">--Module 3--</option>
              <option value="Module 4">--Module 4--</option>
            </select>

            <button
              onClick={() => {
                setShowAddRouteForm(true);
                setNewRouteServiceType('');
                setNewRouteLevelGroup('');
                setNewRouteName('');
                setNewRouteAssignees({
                  'Load Survey Details': 'vibha',
                  'Load Survey Approval': 'vibha',
                  'Land Survey Details': 'vibha',
                  'Estimate Details': 'vibha',
                  'Estimate Approval': 'vibha',
                  'Demand Note': 'vibha',
                  'Payment': 'vibha',
                  'Job Allotment': 'vibha',
                  'RFC/TR Entry': 'vibha',
                  'Moved-In/Out Closed': 'vibha'
                });
                setNewRouteHierarchies({
                  'Load Survey Details': 'Level 1',
                  'Load Survey Approval': 'Level 2',
                  'Land Survey Details': 'Level 1',
                  'Estimate Details': 'Level 1',
                  'Estimate Approval': 'Level 2',
                  'Demand Note': 'Level 1',
                  'Payment': 'Level 1',
                  'Job Allotment': 'Level 1',
                  'RFC/TR Entry': 'Level 1',
                  'Moved-In/Out Closed': 'Level 1'
                });
              }}
              className="px-4 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg transition duration-200 shadow flex items-center space-x-1.5"
            >
              <Plus size={14} />
              <span>Add new route</span>
            </button>
          </div>
        </div>

        {/* Filter controls panel */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Show</span>
            <select
              value={routePageSize}
              onChange={(e) => {
                setRoutePageSize(Number(e.target.value));
                setRouteCurrentPage(1);
              }}
              className="px-2 py-1 bg-gray-55 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded text-gray-800 dark:text-white outline-none font-bold"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-400">entries</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-gray-400">Search:</span>
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search routes, service types..."
                value={routeSearchQuery}
                onChange={(e) => {
                  setRouteSearchQuery(e.target.value);
                  setRouteCurrentPage(1);
                }}
                className="w-full pl-8 pr-4 py-1.5 bg-gray-55 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#4B3E9E] transition font-bold"
              />
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-xs text-left min-w-[1500px] table-fixed">
              <thead className="bg-[#4B3E9E] text-white font-bold uppercase tracking-wider text-[10px] border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 w-60">Service Type</th>
                  <th className="py-3.5 px-4 w-52">Route</th>
                  <th className="py-3.5 px-4 text-center w-36">Load Survey Details</th>
                  <th className="py-3.5 px-4 text-center w-36">Load Survey Approval</th>
                  <th className="py-3.5 px-4 text-center w-36">Land Survey Details</th>
                  <th className="py-3.5 px-4 text-center w-36">Estimate Details</th>
                  <th className="py-3.5 px-4 text-center w-36">Estimate Approval</th>
                  <th className="py-3.5 px-4 text-center w-36">Demand Note</th>
                  <th className="py-3.5 px-4 text-center w-36">Payment</th>
                  <th className="py-3.5 px-4 text-center w-36">Job Allotment</th>
                  <th className="py-3.5 px-4 text-center w-36">RFC/TR Entry</th>
                  <th className="py-3.5 px-4 text-center w-40">Moved-In/Out Closed</th>
                  <th className="py-3.5 px-4 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 font-semibold text-gray-750 dark:text-gray-200">
                {routesLoading ? (
                  <tr>
                    <td colSpan={14} className="py-12 text-center text-gray-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4B3E9E] mx-auto mb-2"></div>
                      <span>Loading routes database...</span>
                    </td>
                  </tr>
                ) : paginatedRoutes.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-12 text-center text-gray-400 font-bold">
                      No routes found.
                    </td>
                  </tr>
                ) : (
                  paginatedRoutes.map((route, index) => {
                    const rowNum = startIndex + index + 1;
                    const isExpanded = expandedRouteId === route.id;
                    return (
                      <React.Fragment key={route.id}>
                        <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-750/10 transition">
                          <td className="py-4 px-4 text-center font-mono text-gray-400">{rowNum}</td>
                          <td className="py-4 px-4 text-slate-700 dark:text-slate-200 truncate" title={getServiceTypeForRoute(route.name, route.levelGroup)}>{getServiceTypeForRoute(route.name, route.levelGroup)}</td>
                          <td className="py-4 px-4 text-[#005BAC] dark:text-tata-blue-light font-bold font-mono truncate" title={route.name}>{route.name}</td>
                          <td className="py-4 px-4 text-center font-bold text-gray-600 dark:text-gray-300">{getAssigneeForStage(route, 'Load Survey Details') || '-'}</td>
                          <td className="py-4 px-4 text-center font-bold text-gray-600 dark:text-gray-300">{getAssigneeForStage(route, 'Load Survey Approval') || '-'}</td>
                          <td className="py-4 px-4 text-center font-bold text-gray-600 dark:text-gray-300">{getAssigneeForStage(route, 'Land Survey Details') || '-'}</td>
                          <td className="py-4 px-4 text-center font-bold text-gray-600 dark:text-gray-300">{getAssigneeForStage(route, 'Estimate Details') || '-'}</td>
                          <td className="py-4 px-4 text-center font-bold text-gray-600 dark:text-gray-300">{getAssigneeForStage(route, 'Estimate Approval') || '-'}</td>
                          <td className="py-4 px-4 text-center font-bold text-gray-600 dark:text-gray-300">{getAssigneeForStage(route, 'Demand Note') || '-'}</td>
                          <td className="py-4 px-4 text-center font-bold text-gray-600 dark:text-gray-300">{getAssigneeForStage(route, 'Payment') || '-'}</td>
                          <td className="py-4 px-4 text-center font-bold text-gray-600 dark:text-gray-300">{getAssigneeForStage(route, 'Job Allotment') || getAssigneeForStage(route, 'Allotment') || '-'}</td>
                          <td className="py-4 px-4 text-center font-bold text-gray-600 dark:text-gray-300">{getAssigneeForStage(route, 'RFC') || getAssigneeForStage(route, 'TR') || '-'}</td>
                          <td className="py-4 px-4 text-center font-bold text-gray-600 dark:text-gray-300">{getAssigneeForStage(route, 'Move') || getAssigneeForStage(route, 'Closed') || '-'}</td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
                              className="p-1.5 hover:bg-gray-150 dark:hover:bg-slate-700 rounded-full transition text-gray-500 dark:text-gray-350"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-[#f8f9fa] dark:bg-slate-900/60 transition-all">
                            <td colSpan={14} className="p-4 border-y border-gray-200 dark:border-slate-700">
                              <div className="flex justify-center items-center space-x-4">
                                 <button
                                  onClick={() => {
                                    setEditingRoute(route);
                                    setNewRouteName(route.name);
                                    setNewRouteLevelGroup(route.levelGroup);
                                    setNewRouteServiceType(getServiceTypeForRoute(route.name, route.levelGroup));
                                    setNewRouteAssignees({
                                      'Load Survey Details': getAssigneeForStage(route, 'Load Survey Details'),
                                      'Load Survey Approval': getAssigneeForStage(route, 'Load Survey Approval'),
                                      'Land Survey Details': getAssigneeForStage(route, 'Land Survey Details'),
                                      'Estimate Details': getAssigneeForStage(route, 'Estimate Details'),
                                      'Estimate Approval': getAssigneeForStage(route, 'Estimate Approval'),
                                      'Demand Note': getAssigneeForStage(route, 'Demand Note'),
                                      'Payment': getAssigneeForStage(route, 'Payment'),
                                      'Job Allotment': getAssigneeForStage(route, 'Job Allotment') || getAssigneeForStage(route, 'Allotment'),
                                      'RFC/TR Entry': getAssigneeForStage(route, 'RFC') || getAssigneeForStage(route, 'TR'),
                                      'Moved-In/Out Closed': getAssigneeForStage(route, 'Move') || getAssigneeForStage(route, 'Closed')
                                    });
                                    setNewRouteHierarchies({
                                      'Load Survey Details': getHierarchyForStage(route, 'Load Survey Details'),
                                      'Load Survey Approval': getHierarchyForStage(route, 'Load Survey Approval'),
                                      'Land Survey Details': getHierarchyForStage(route, 'Land Survey Details'),
                                      'Estimate Details': getHierarchyForStage(route, 'Estimate Details'),
                                      'Estimate Approval': getHierarchyForStage(route, 'Estimate Approval'),
                                      'Demand Note': getHierarchyForStage(route, 'Demand Note'),
                                      'Payment': getHierarchyForStage(route, 'Payment'),
                                      'Job Allotment': getHierarchyForStage(route, 'Job Allotment') || getHierarchyForStage(route, 'Allotment'),
                                      'RFC/TR Entry': getHierarchyForStage(route, 'RFC') || getHierarchyForStage(route, 'TR'),
                                      'Moved-In/Out Closed': getHierarchyForStage(route, 'Move') || getHierarchyForStage(route, 'Closed')
                                    });
                                    setShowEditRouteForm(true);
                                  }}
                                  className="px-6 py-2 bg-[#007bff] hover:bg-[#0069d9] text-white text-xs font-bold rounded-lg transition duration-200 shadow-sm font-sans"
                                >
                                  Modify Route
                                </button>
                                <button
                                  onClick={() => handleDeleteRoute(route.id)}
                                  className="px-6 py-2 bg-[#DC3545] hover:bg-[#c82333] text-white text-xs font-bold rounded-lg transition duration-200 shadow-sm"
                                >
                                  Delete Route
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer / Pagination controls */}
          <div className="bg-gray-50/60 dark:bg-slate-900/10 px-5 py-4 border-t border-gray-100 dark:border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold">
            <span className="text-gray-400">
              Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} entries
            </span>

            <div className="flex space-x-2">
              <button
                disabled={routeCurrentPage === 1}
                onClick={() => setRouteCurrentPage(routeCurrentPage - 1)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-350 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750 disabled:opacity-50 transition"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setRouteCurrentPage(p)}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    routeCurrentPage === p
                      ? 'bg-[#4B3E9E] border-[#4B3E9E] text-white'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-350 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={routeCurrentPage === totalPages || totalPages === 0}
                onClick={() => setRouteCurrentPage(routeCurrentPage + 1)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-350 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tata-blue"></div>
        <p className="text-xs text-gray-400 font-semibold">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Portal Configuration Panel</h1>
        <p className="text-xs text-gray-400 mt-1">Manage connection request types, document checklists, and support lines.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Connection Types CRUD & Document checklist */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Connection Types Grid */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 space-y-6">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center border-b border-gray-50 dark:border-slate-700/20 pb-3">
              <Plus size={16} className="mr-2 text-tata-blue" /> Manage Connection Categories
            </h3>

            {/* Connection list */}
            <div className="space-y-3">
              {connTypes.map((type) => (
                <div key={type.id} className="p-3 bg-gray-50 dark:bg-slate-900/30 rounded-xl border border-gray-100 dark:border-slate-750 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-gray-700 dark:text-gray-300 block">{type.name}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Category: {type.category}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteConnectionType(type.id)}
                    className="p-1.5 border border-red-100 hover:border-red-400 text-red-500 hover:bg-red-50 dark:border-red-950/30 dark:hover:bg-red-950/40 rounded transition"
                    title="Remove connection type"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add form */}
            <form onSubmit={handleAddConnectionType} className="pt-4 border-t border-gray-50 dark:border-slate-700/20 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Category Description Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Domestic Smart Meter (Load < 10kW)"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Billing Class Type</label>
                <select 
                  value={newTypeCat}
                  onChange={(e) => setNewTypeCat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none dark:text-white"
                >
                  <option value="Domestic">Domestic</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Other">Other Category</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button 
                  type="submit"
                  className="px-4 py-2.5 bg-tata-blue hover:bg-tata-blue-hover text-white text-xs font-bold rounded-lg shadow transition"
                >
                  Register Category Type
                </button>
              </div>
            </form>
          </div>

          {/* Required Documents check lists */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 space-y-6">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center border-b border-gray-50 dark:border-slate-700/20 pb-3">
              <FileText size={16} className="mr-2 text-tata-blue" /> Core Document Checklist
            </h3>

            <div className="space-y-2 text-xs">
              {settings.requiredDocuments.map((doc: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-900/10 p-2.5 rounded-lg border border-gray-100 dark:border-slate-750">
                  <Shield size={12} className="text-green-500" />
                  <span className="font-bold text-gray-700 dark:text-gray-300">{doc}</span>
                  <span className="text-[10px] text-gray-400 font-bold ml-auto uppercase bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded border border-green-100 dark:border-green-900/30">Mandatory</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Global Support Config */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 md:p-8 space-y-6">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center border-b border-gray-50 dark:border-slate-700/20 pb-3">
            <Settings size={16} className="mr-2 text-tata-blue" /> Support Parameters
          </h3>

          <form onSubmit={handleUpdateContact} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Emergency Email Support</label>
              <div className="relative text-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Mail size={14} /></span>
                <input 
                  type="email" 
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 font-semibold focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Emergency Call Line</label>
              <div className="relative text-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Phone size={14} /></span>
                <input 
                  type="text" 
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 font-semibold focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-tata-blue hover:bg-tata-blue-hover text-white text-xs font-bold rounded-lg transition shadow"
            >
              Update Parameters
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
