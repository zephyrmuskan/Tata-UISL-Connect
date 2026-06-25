import React, { useState, useEffect } from 'react';
import { Search, Key } from 'lucide-react';
import { customerService } from '../services/api';
import type { User as UserType } from '../services/mockData';
import { toast } from 'react-toastify';

export const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (err) {
      toast.error('Error fetching customer directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (id: number) => {
    try {
      const updated = await customerService.toggleCustomerStatus(id);
      setCustomers(updated);
      toast.info('Customer status updated');
    } catch (err) {
      toast.error('Failed to change customer status');
    }
  };

  const handleResetPassword = async (id: number) => {
    try {
      const res = await customerService.resetCustomerPassword(id);
      toast.success(res.message);
    } catch (err) {
      toast.error('Reset link generation failed');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobileNumber.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tata-blue"></div>
        <p className="text-xs text-gray-400 font-semibold">Loading customer records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Customer Records Directory</h1>
        <p className="text-xs text-gray-400 mt-1">Audit customer registrations, reset account passwords, and toggle portal permissions.</p>
      </div>

      {/* Action Bars */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Search size={14} /></span>
          <input 
            type="text" 
            placeholder="Search by name, email, mobile..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
          />
        </div>
        <div className="text-xs text-gray-450 font-bold">
          Total Customers: {customers.length}
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-400 font-bold uppercase">
                <th className="p-4">Customer Details</th>
                <th className="p-4">Mobile Number</th>
                <th className="p-4">Registration Date</th>
                <th className="p-4">Portal Access</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-xs text-gray-400">No customers match the query filters.</td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="p-4 flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-tata-blue/10 text-tata-blue dark:bg-tata-blue/20 dark:text-tata-blue-light flex items-center justify-center font-bold">
                        {cust.fullName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 dark:text-white block">{cust.fullName}</span>
                        <span className="text-[10px] text-gray-450 block">{cust.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 font-semibold">{cust.mobileNumber}</td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {new Date(cust.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${
                        cust.isActive 
                          ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-950/20 dark:text-green-400' 
                          : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {cust.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleToggleStatus(cust.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded border transition ${
                          cust.isActive 
                            ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/30' 
                            : 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900/30 dark:text-green-400 dark:hover:bg-green-950/30'
                        }`}
                      >
                        {cust.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleResetPassword(cust.id)}
                        className="px-2.5 py-1 text-[10px] font-bold border border-gray-200 dark:border-slate-700 text-gray-650 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition flex inline-flex items-center"
                        title="Generate password reset link"
                      >
                        <Key size={10} className="mr-1" /> Reset Pass
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
