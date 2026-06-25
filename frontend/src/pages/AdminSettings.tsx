import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Mail, Phone, Shield, FileText } from 'lucide-react';
import { settingsService } from '../services/api';
import type { ConnectionType } from '../services/mockData';
import { toast } from 'react-toastify';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [connTypes, setConnTypes] = useState<ConnectionType[]>([]);
  const [loading, setLoading] = useState(true);

  // New Connection Type Form state
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCat, setNewTypeCat] = useState<'Domestic' | 'Commercial' | 'Industrial' | 'Other'>('Domestic');

  // Contact Info states
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');

  const fetchSettings = async () => {
    try {
      const sets = await settingsService.getSettings();
      setSettings(sets);
      setSupportEmail(sets.supportEmail);
      setSupportPhone(sets.supportPhone);

      const types = await settingsService.getConnectionTypes();
      setConnTypes(types);
    } catch (err) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

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
