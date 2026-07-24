import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Mail, Shield, ChevronDown, ChevronUp, Edit } from 'lucide-react';

import { settingsService, workflowService, adminMasterService } from '../services/api';
import type { ConnectionType, WorkflowRoute, MenuPageMaster, RoleMaster, UserRoleMapping, RoleMenuRight, StageApprovalLevelSetting } from '../services/mockData';
import { toast } from 'react-toastify';

export const AdminSettings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const currentTabType = searchParams.get('type') || '';

  const [_settings, setSettings] = useState<any>(null);
  const [connTypes, setConnTypes] = useState<ConnectionType[]>([]);
  const [_loading, setLoading] = useState(true);

  // Enterprise Admin Module Data States
  const [pageMasters, setPageMasters] = useState<MenuPageMaster[]>([]);
  const [roleMasters, setRoleMasters] = useState<RoleMaster[]>([]);
  const [userRoleMappings, setUserRoleMappings] = useState<UserRoleMapping[]>([]);
  const [menuRights, setMenuRights] = useState<RoleMenuRight[]>([]);
  const [_stageApprovalLevels, setStageApprovalLevels] = useState<StageApprovalLevelSetting[]>([]);

  // Page Master Form State
  const [pageMenuText, setPageMenuText] = useState('Dashboard');
  const [pageParentMenu, setPageParentMenu] = useState('--Select Parent Menu--');
  const [pageTextOrder, setPageTextOrder] = useState<number>(1);
  const [pageStatus, setPageStatus] = useState<'Active' | 'Inactive'>('Active');
  const [pageDescription, setPageDescription] = useState('Consumer Dashboard');
  const [pageController, setPageController] = useState('Department');
  const [pageMethod, setPageMethod] = useState('Index');
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [pendingEditPage, setPendingEditPage] = useState<MenuPageMaster | null>(null);

  // Role Master Form State
  const [roleNameInput, setRoleNameInput] = useState('');
  const [roleStatusInput, setRoleStatusInput] = useState<'Active' | 'Inactive'>('Active');
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

  // Menu Rights State
  const [selectedRightsRole, setSelectedRightsRole] = useState('Admin');

  // Stage Approval Level Setting Form State
  const [selectedServiceType, setSelectedServiceType] = useState('New Provisional Power Connection');
  const [selectedRoute, setSelectedRoute] = useState('New Connection_JSR');
  const [levelGroupNameInput, setLevelGroupNameInput] = useState('Level Group 1');
  const [editableStageLevels, setEditableStageLevels] = useState<Record<string, number>>({
    'Load Survey Details': 1,
    'Land Survey Details': 1,
    'Bill Verification': 2,
    'Load Survey Approval': 1,
    'Estimate Details': 1,
    'Estimate Approval': 1,
    'Demand Note Details': 1
  });

  // Category Form State
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCat, _setNewTypeCat] = useState<'Domestic' | 'Commercial' | 'Industrial' | 'Other'>('Domestic');

  // Contact Info states
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');

  // Route Master states
  const [routes, setRoutes] = useState<WorkflowRoute[]>([]);
  const [_routesLoading, setRoutesLoading] = useState(true);
  const [routeSearchQuery, setRouteSearchQuery] = useState('');
  const [routePageSize] = useState(10);
  const [routeCurrentPage] = useState(1);
  const [showAddRouteForm, setShowAddRouteForm] = useState(false);
  const [expandedRouteId, setExpandedRouteId] = useState<number | null>(null);

  const loadAdminMasters = async () => {
    try {
      const pm = await adminMasterService.getPageMasters();
      setPageMasters(pm);
      const rm = await adminMasterService.getRoleMasters();
      setRoleMasters(rm);
      const urm = await adminMasterService.getUserRoleMappings();
      setUserRoleMappings(urm);
      const mr = await adminMasterService.getMenuRights();
      setMenuRights(mr);
      const sal = await adminMasterService.getStageApprovalLevels();
      setStageApprovalLevels(sal);
    } catch (err) {
      console.error(err);
    }
  };

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

      await loadAdminMasters();
    } catch (err) {
      toast.error('Failed to load system settings, routes, or masters database');
    } finally {
      setLoading(false);
      setRoutesLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [currentTabType]);

  // Page Master Actions
  const handleSavePageMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageMenuText.trim()) {
      toast.error('Menu text is required');
      return;
    }
    try {
      const payload: Partial<MenuPageMaster> = {
        id: editingPageId || undefined,
        menuText: pageMenuText,
        parentMenu: pageParentMenu,
        textOrder: Number(pageTextOrder),
        status: pageStatus,
        description: pageDescription,
        controller: pageController,
        method: pageMethod,
        route: '/admin'
      };
      const updated = await adminMasterService.savePageMaster(payload);
      setPageMasters(updated);
      toast.success(editingPageId ? 'Menu details updated successfully' : 'New menu created successfully');
      setEditingPageId(null);
      setPageMenuText('');
      setPageDescription('');
    } catch (err) {
      toast.error('Failed to save page master details');
    }
  };

  const triggerEditPagePrompt = (pm: MenuPageMaster) => {
    setPendingEditPage(pm);
    setShowEditConfirmModal(true);
  };

  const confirmEditPage = () => {
    if (!pendingEditPage) return;
    setEditingPageId(pendingEditPage.id);
    setPageMenuText(pendingEditPage.menuText);
    setPageParentMenu(pendingEditPage.parentMenu);
    setPageTextOrder(pendingEditPage.textOrder);
    setPageStatus(pendingEditPage.status);
    setPageDescription(pendingEditPage.description);
    setPageController(pendingEditPage.controller);
    setPageMethod(pendingEditPage.method);
    setShowEditConfirmModal(false);
    setPendingEditPage(null);
  };

  // Role Master Actions
  const handleSaveRoleMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleNameInput.trim()) {
      toast.error('Role name is required');
      return;
    }
    try {
      const payload: Partial<RoleMaster> = {
        id: editingRoleId || undefined,
        roleName: roleNameInput,
        status: roleStatusInput,
        description: `${roleNameInput} Role`
      };
      const updated = await adminMasterService.saveRoleMaster(payload);
      setRoleMasters(updated);
      toast.success(editingRoleId ? 'Role updated successfully' : 'Role registered successfully');
      setRoleNameInput('');
      setEditingRoleId(null);
    } catch (err) {
      toast.error('Failed to save role');
    }
  };

  // User Role Mapping Actions
  const handleUpdateRoleMapping = async (id: number, updatedFields: Partial<UserRoleMapping>) => {
    try {
      const updated = await adminMasterService.saveUserRoleMapping({ id, ...updatedFields });
      setUserRoleMappings(updated);
      toast.success('User role mapping updated successfully');
    } catch (err) {
      toast.error('Failed to update mapping');
    }
  };

  // Menu Rights Actions
  const handleToggleMenuRight = (menuId: number) => {
    setMenuRights(prev => prev.map(m => {
      if (m.roleName === selectedRightsRole && m.menuId === menuId) {
        return { ...m, isSelect: !m.isSelect };
      }
      return m;
    }));
  };

  const handleAssignMenuRights = async () => {
    try {
      await adminMasterService.saveMenuRights(menuRights);
      toast.success(`Menu rights for role "${selectedRightsRole}" saved successfully!`);
    } catch (err) {
      toast.error('Failed to save menu rights');
    }
  };

  // Stage Approval Level Actions
  const handleSaveStageApprovalLevels = async () => {
    try {
      const settingObj: StageApprovalLevelSetting = {
        id: 1,
        serviceType: selectedServiceType,
        routeName: selectedRoute,
        levelGroupName: levelGroupNameInput,
        stages: Object.entries(editableStageLevels).map(([stageName, level]) => ({
          stageName,
          level
        }))
      };
      await adminMasterService.saveStageApprovalLevel(settingObj);
      toast.success('Stage approval levels saved successfully!');
    } catch (err) {
      toast.error('Failed to save stage levels');
    }
  };

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

  const getServiceTypeForRoute = (name: string, levelGroup: string): string => {
    const n = name.toLowerCase();
    const lg = levelGroup.toLowerCase();
    
    if (n.includes('meter testing') || n.includes('energy meter')) {
      if (n.includes('water')) return 'Request for Energy Meter Testing Of Water Connection';
      return 'Request for Energy Meter Testing';
    }
    
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

    if (n.includes('name') || n.includes('consumer name')) return 'Change in Name of Registered Consumer';
    if (n.includes('enhancement')) return 'Load Change-Enhancement';
    if (n.includes('reduction')) return 'Load Change-Reduction';
    if (n.includes('relocation') || n.includes('shifting')) return 'Meter/MS/SL change /relocation';
    if (n.includes('provisional')) return 'New Provisional Power Connection';
    if (lg.includes('lt') || n.includes('low tension')) return 'New Power Connection LT';
    if (lg.includes('ht') || n.includes('high tension')) return 'New Power Connection HT';
    if (lg.includes('commercial')) return 'New Power Connection Commercial';
    if (lg.includes('industrial')) return 'New Power Connection Industrial';
    
    return 'New Power Connection LT';
  };

  const tabTypeNormalized = currentTabType.toLowerCase().replace(/[^a-z0-9]/g, '');

  // ==========================================
  // VIEW 1: PAGE MASTER (SCREENSHOTS 1 & 2)
  // ==========================================
  if (tabTypeNormalized === 'pagemaster' || currentTabType === 'Page Master') {
    return (
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Page Master</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure portal pages, menu text, positions, controllers and methods</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-gray-200 dark:border-slate-750 shadow-xs space-y-4 text-xs">
          <form onSubmit={handleSavePageMaster} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Menu Text*</label>
                <input
                  type="text"
                  value={pageMenuText}
                  onChange={(e) => setPageMenuText(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-[#005BAC]"
                  placeholder="Dashboard"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Parent Menu</label>
                <select
                  value={pageParentMenu}
                  onChange={(e) => setPageParentMenu(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-[#005BAC]"
                >
                  <option value="--Select Parent Menu--">--Select Parent Menu--</option>
                  <option value="Master">Master</option>
                  <option value="New Connection">New Connection</option>
                  <option value="Approval Setting">Approval Setting</option>
                  <option value="Report">Report</option>
                  <option value="Exception Application">Exception Application</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Text Order</label>
                <input
                  type="number"
                  value={pageTextOrder}
                  onChange={(e) => setPageTextOrder(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-[#005BAC]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={pageStatus}
                  onChange={(e) => setPageStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-[#005BAC]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Description*</label>
                <input
                  type="text"
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-[#005BAC]"
                  placeholder="Consumer Dashboard"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Controller</label>
                <input
                  type="text"
                  value={pageController}
                  onChange={(e) => setPageController(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-[#005BAC]"
                  placeholder="Department"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Method</label>
                <input
                  type="text"
                  value={pageMethod}
                  onChange={(e) => setPageMethod(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-[#005BAC]"
                  placeholder="Index"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#005BAC] hover:bg-blue-700 text-white font-extrabold rounded-lg transition shadow-xs cursor-pointer"
                >
                  Save Details
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-750 shadow-xs overflow-hidden text-xs">
          <div className="p-3 border-b border-gray-150 dark:border-slate-750 flex justify-between items-center text-gray-500">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-gray-50 dark:bg-slate-900 outline-none">
                <option value={10}>10</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Search:</span>
              <input type="text" className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-gray-50 dark:bg-slate-900 outline-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#005BAC] text-white font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Parent Menu</th>
                  <th className="py-2.5 px-3">Menu</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Controller</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 w-16 text-center">Order</th>
                  <th className="py-2.5 px-3 w-20">Status</th>
                  <th className="py-2.5 px-3 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-750 font-medium">
                {pageMasters.map((pm, idx) => (
                  <tr key={pm.id} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-center text-gray-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-700 dark:text-gray-300">{pm.parentMenu}</td>
                    <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">{pm.menuText}</td>
                    <td className="py-2.5 px-3 text-gray-600 dark:text-gray-400">{pm.description}</td>
                    <td className="py-2.5 px-3 text-gray-600 dark:text-gray-400 font-mono">{pm.controller}</td>
                    <td className="py-2.5 px-3 text-gray-600 dark:text-gray-400 font-mono">{pm.method}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-gray-800 dark:text-gray-200">{pm.textOrder}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">{pm.status}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => triggerEditPagePrompt(pm)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-600 dark:text-gray-300 cursor-pointer"
                        title="Edit Menu"
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-gray-150 dark:border-slate-750 flex justify-between items-center text-gray-500">
            <span>Showing 1 to {pageMasters.length} of 139 entries</span>
            <div className="flex items-center space-x-1 font-bold">
              <button disabled className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded text-gray-400 cursor-not-allowed">Previous</button>
              <button className="px-3 py-1 bg-[#005BAC] text-white rounded">1</button>
              <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-800">2</button>
              <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-800">3</button>
              <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-800">Next</button>
            </div>
          </div>
        </div>

        {showEditConfirmModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-sm w-full p-5 shadow-xl border border-gray-200 dark:border-slate-700 text-center space-y-4 animate-scaleUp">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">cmgms.tsuisl.co.in says</div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Are you sure that you want to edit</p>
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={confirmEditPage}
                  className="px-6 py-1.5 bg-[#005BAC] hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                >
                  OK
                </button>
                <button
                  onClick={() => setShowEditConfirmModal(false)}
                  className="px-6 py-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ROLE MASTER (SCREENSHOT 4)
  // ==========================================
  if (tabTypeNormalized === 'rolemaster' || currentTabType === 'Role Master') {
    return (
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Role Master</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure unlimited enterprise access roles and status</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-gray-200 dark:border-slate-750 shadow-xs space-y-4 text-xs">
          <form onSubmit={handleSaveRoleMaster} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Role*</label>
              <input
                type="text"
                value={roleNameInput}
                onChange={(e) => setRoleNameInput(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-[#005BAC]"
                placeholder="Enter role name"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={roleStatusInput}
                onChange={(e) => setRoleStatusInput(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-[#005BAC]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2 bg-[#005BAC] hover:bg-blue-700 text-white font-extrabold rounded-lg transition shadow-xs cursor-pointer"
              >
                Save Role
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-750 shadow-xs overflow-hidden text-xs">
          <div className="p-3 border-b border-gray-150 dark:border-slate-750 flex justify-between items-center text-gray-500">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-gray-50 dark:bg-slate-900 outline-none">
                <option value={10}>10</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Search:</span>
              <input type="text" className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-gray-50 dark:bg-slate-900 outline-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#005BAC] text-white font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-3 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-750 font-medium">
                {roleMasters.map((rm, idx) => (
                  <tr key={rm.id} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-center text-gray-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-extrabold text-gray-900 dark:text-white">{rm.roleName}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{rm.status}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          setEditingRoleId(rm.id);
                          setRoleNameInput(rm.roleName);
                          setRoleStatusInput(rm.status);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-600 dark:text-gray-300 cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-gray-150 dark:border-slate-750 flex justify-between items-center text-gray-500">
            <span>Showing 11 to 20 of 21 entries</span>
            <div className="flex items-center space-x-1 font-bold">
              <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-800">Previous</button>
              <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-800">1</button>
              <button className="px-3 py-1 bg-[#005BAC] text-white rounded">2</button>
              <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-800">3</button>
              <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-800">Next</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: USER & ROLE MAPPING (SCREENSHOT 5)
  // ==========================================
  if (tabTypeNormalized === 'rolemapping' || currentTabType === 'Role Mapping' || currentTabType === 'User & Role mapping') {
    return (
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">User & Role mapping</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage employee role assignments, business areas and active status</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-750 shadow-xs overflow-hidden text-xs">
          <div className="p-3 border-b border-gray-150 dark:border-slate-750 flex justify-between items-center text-gray-500">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-gray-50 dark:bg-slate-900 outline-none">
                <option value={10}>10</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Search:</span>
              <input type="text" className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-gray-50 dark:bg-slate-900 outline-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#005BAC] text-white font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">User Type</th>
                  <th className="py-2.5 px-3">User Name</th>
                  <th className="py-2.5 px-3">User Id</th>
                  <th className="py-2.5 px-3 text-center">B A JSR</th>
                  <th className="py-2.5 px-3 text-center">B A SK</th>
                  <th className="py-2.5 px-3">Is Active</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-750 font-medium">
                {userRoleMappings.map((urm, idx) => (
                  <tr key={urm.id} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-center text-gray-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-700 dark:text-gray-300">{urm.userType}</td>
                    <td className="py-2.5 px-3 font-extrabold text-gray-900 dark:text-white">{urm.userName}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-600 dark:text-gray-400 font-bold">{urm.userId}</td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={urm.baJsr}
                        onChange={(e) => handleUpdateRoleMapping(urm.id, { baJsr: e.target.checked })}
                        className="w-4 h-4 text-[#005BAC] rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={urm.baSk}
                        onChange={(e) => handleUpdateRoleMapping(urm.id, { baSk: e.target.checked })}
                        className="w-4 h-4 text-[#005BAC] rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={urm.isActive}
                        onChange={(e) => handleUpdateRoleMapping(urm.id, { isActive: e.target.value as any })}
                        className="border border-gray-200 dark:border-slate-700 rounded px-2 py-0.5 bg-gray-50 dark:bg-slate-900 font-bold outline-none"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={urm.role}
                        onChange={(e) => handleUpdateRoleMapping(urm.id, { role: e.target.value })}
                        className="border border-gray-200 dark:border-slate-700 rounded px-2 py-0.5 bg-gray-50 dark:bg-slate-900 font-bold text-[#005BAC] dark:text-blue-400 outline-none"
                      >
                        {roleMasters.map(r => (
                          <option key={r.id} value={r.roleName}>{r.roleName}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => toast.success(`Updated role mapping for ${urm.userName}`)}
                        className="px-4 py-1 bg-[#FF8C00] hover:bg-amber-600 text-white font-extrabold rounded-md text-[11px] transition shadow-2xs cursor-pointer"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-gray-150 dark:border-slate-750 flex justify-between items-center text-gray-500">
            <span>Showing 1 to 10 of 366 entries</span>
            <div className="flex items-center space-x-1 font-bold">
              <button disabled className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded text-gray-400 cursor-not-allowed">Previous</button>
              <button className="px-3 py-1 bg-[#005BAC] text-white rounded">1</button>
              <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-800">2</button>
              <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-800">3</button>
              <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-800">4</button>
              <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-800">Next</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 4: MENU RIGHTS (SCREENSHOTS 3 & 6)
  // ==========================================
  if (tabTypeNormalized === 'menurights' || currentTabType === 'Menu Rights') {
    const activeRights = menuRights.filter(m => m.roleName === selectedRightsRole);

    return (
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Menu Rights</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure role-based menu access rights and system screen permissions</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-gray-200 dark:border-slate-750 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
          <div className="w-full sm:w-80">
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Role*</label>
            <select
              value={selectedRightsRole}
              onChange={(e) => setSelectedRightsRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white font-bold outline-none focus:border-[#005BAC]"
            >
              <option value="--Select Role--">--Select Role--</option>
              {roleMasters.map(r => (
                <option key={r.id} value={r.roleName}>{r.roleName}</option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={handleAssignMenuRights}
              className="px-6 py-2.5 bg-[#005BAC] hover:bg-blue-700 text-white font-extrabold rounded-full transition shadow-md cursor-pointer"
            >
              Assign Menu Rights
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-750 shadow-xs overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#005BAC] text-white font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-24 text-center">Select</th>
                  <th className="py-3 px-4">Menu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-750 font-medium">
                {activeRights.map((mr, idx) => (
                  <tr key={mr.menuId} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-center text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={mr.isSelect}
                        onChange={() => handleToggleMenuRight(mr.menuId)}
                        className="w-4 h-4 text-[#005BAC] rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-800 dark:text-gray-200">{mr.menuName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 5: SERVICE WISE STAGE APPROVAL LEVEL SETTING (SCREENSHOT 7)
  // ==========================================
  if (tabTypeNormalized === 'servicewisestageapprovallevelsetting' || currentTabType === 'Service Wise Stage Approval Level Setting') {
    return (
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Service Wise Stage Approval Level Setting</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure workflow stage approval levels per service type & route</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-gray-200 dark:border-slate-750 shadow-xs flex flex-col md:flex-row justify-between items-end gap-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
            <div>
              <select
                value={selectedServiceType}
                onChange={(e) => setSelectedServiceType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white font-bold outline-none focus:border-[#005BAC]"
              >
                <option value="New Provisional Power Connection">New Provisional Power Connection</option>
                <option value="New Power Connection LT">New Power Connection LT</option>
                <option value="New Power Connection HT">New Power Connection HT</option>
                <option value="Temporary Connection">Temporary Connection</option>
                <option value="Water Connection">Water Connection</option>
              </select>
            </div>

            <div>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white font-bold outline-none focus:border-[#005BAC]"
              >
                <option value="New Connection_JSR">New Connection_JSR</option>
                <option value="LT G1">LT G1</option>
                <option value="LT G2">LT G2</option>
                <option value="HT G1">HT G1</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                value={levelGroupNameInput}
                onChange={(e) => setLevelGroupNameInput(e.target.value)}
                placeholder="Level Group name"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white font-bold outline-none focus:border-[#005BAC]"
              />
            </div>
          </div>

          <div>
            <button
              onClick={handleSaveStageApprovalLevels}
              className="px-8 py-2.5 bg-[#005BAC] hover:bg-blue-700 text-white font-extrabold rounded-full transition shadow-md cursor-pointer whitespace-nowrap"
            >
              Save Level
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-750 shadow-xs overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#005BAC] text-white font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-6">Stage</th>
                  <th className="py-3 px-6 w-44">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-750 font-medium">
                {Object.entries(editableStageLevels).map(([stageName, levelNum], idx) => (
                  <tr key={stageName} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 text-center text-gray-400">{idx + 1}</td>
                    <td className="py-3.5 px-6 font-bold text-gray-800 dark:text-gray-200">{stageName}</td>
                    <td className="py-3.5 px-6">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={levelNum}
                        onChange={(e) => setEditableStageLevels(prev => ({
                          ...prev,
                          [stageName]: Number(e.target.value)
                        }))}
                        className="w-24 px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 font-bold text-gray-900 dark:text-white outline-none focus:border-[#005BAC]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 6: ROUTE MASTER VIEW
  // ==========================================
  if (currentTabType.toLowerCase() === 'route master' || currentTabType === 'Route Master') {
    let filteredRoutes = routes;
    if (routeSearchQuery.trim()) {
      const q = routeSearchQuery.toLowerCase();
      filteredRoutes = routes.filter(r => 
        r.name.toLowerCase().includes(q) ||
        getServiceTypeForRoute(r.name, r.levelGroup).toLowerCase().includes(q)
      );
    }

    const totalEntries = filteredRoutes.length;
    const startIndex = (routeCurrentPage - 1) * routePageSize;
    const paginatedRoutes = filteredRoutes.slice(startIndex, startIndex + routePageSize);

    return (
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Route Master ({totalEntries})</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure workflow stage sequences, assigned roles and approval levels</p>
          </div>
          <button
            onClick={() => setShowAddRouteForm(!showAddRouteForm)}
            className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white font-extrabold rounded-lg text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Create New Route</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-750 shadow-xs overflow-hidden text-xs">
          <div className="p-3 border-b border-gray-150 dark:border-slate-750 flex justify-between items-center text-gray-500">
            <div className="flex items-center space-x-2">
              <span>Search:</span>
              <input
                type="text"
                value={routeSearchQuery}
                onChange={(e) => setRouteSearchQuery(e.target.value)}
                placeholder="Search route name..."
                className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-gray-50 dark:bg-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#005BAC] text-white font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Route Name</th>
                  <th className="py-2.5 px-3">Service Type</th>
                  <th className="py-2.5 px-3">Level Group</th>
                  <th className="py-2.5 px-3 w-20 text-center">Stages</th>
                  <th className="py-2.5 px-3 w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-750 font-medium">
                {paginatedRoutes.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-center text-gray-400">{startIndex + idx + 1}</td>
                    <td className="py-2.5 px-3 font-extrabold text-gray-900 dark:text-white">{r.name}</td>
                    <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 font-semibold">{getServiceTypeForRoute(r.name, r.levelGroup)}</td>
                    <td className="py-2.5 px-3 font-bold text-[#005BAC] dark:text-blue-400">{r.levelGroup}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{r.stages?.length || 7}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setExpandedRouteId(expandedRouteId === r.id ? null : r.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-600 dark:text-gray-300 cursor-pointer"
                      >
                        {expandedRouteId === r.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // GENERAL SETTINGS & DEFAULT VIEW
  // ==========================================
  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 animate-fadeIn">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Tata UISL System Administration</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Enterprise Administration & Workflow Engine Configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl shadow-xs border border-gray-200 dark:border-slate-750 space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center border-b border-gray-100 dark:border-slate-800 pb-3">
              <Shield size={18} className="mr-2 text-[#005BAC]" /> System Connection Categories
            </h3>

            <div className="space-y-2 text-xs">
              {connTypes.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-750">
                  <div>
                    <span className="font-extrabold text-gray-800 dark:text-white block">{c.name}</span>
                    <span className="text-[10px] text-[#005BAC] dark:text-blue-400 font-semibold">{c.category} Connection</span>
                  </div>
                  <button
                    onClick={() => handleDeleteConnectionType(c.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddConnectionType} className="pt-4 border-t border-gray-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">New Service Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Commercial Smart Connection"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 font-semibold outline-none dark:text-white"
                />
              </div>

              <div>
                <button type="submit" className="w-full py-2 bg-[#005BAC] hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-xs cursor-pointer">
                  Register Category
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-850 p-6 rounded-2xl shadow-xs border border-gray-200 dark:border-slate-750 space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center border-b border-gray-100 dark:border-slate-800 pb-3">
            <Mail size={18} className="mr-2 text-[#005BAC]" /> Support Parameters
          </h3>

          <form onSubmit={handleUpdateContact} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Emergency Email Support</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 font-semibold outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Emergency Call Line</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 font-semibold outline-none dark:text-white"
              />
            </div>

            <button type="submit" className="w-full py-2 bg-[#005BAC] hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-xs cursor-pointer">
              Update Parameters
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
