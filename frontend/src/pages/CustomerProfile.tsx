import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  User, Lock, Phone, Mail, Calendar
} from 'lucide-react';
import { authService, applicationService } from '../services/api';
import type { Application, User as UserType } from '../services/mockData';
import { toast } from 'react-toastify';

interface ProfileInput {
  fullName: string;
  mobileNumber: string;
}

interface PasswordInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const CustomerProfile: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const { register: profileReg, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, setValue } = useForm<ProfileInput>();
  const { register: passReg, handleSubmit: handlePassSubmit, formState: { errors: passErrors }, reset } = useForm<PasswordInput>();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setValue('fullName', user.fullName);
      setValue('mobileNumber', user.mobileNumber);
    }

    const fetchApps = async () => {
      try {
        const apps = await applicationService.getApplications();
        setApplications(apps);
      } catch (err) {
        console.error(err);
      }
    };
    fetchApps();
  }, [setValue]);

  const onUpdateProfile = async (data: any) => {
    setProfileLoading(true);
    try {
      const storedUsers = JSON.parse(localStorage.getItem('tata_users') || '[]');
      const updated = storedUsers.map((u: any) => {
        if (u.id === currentUser?.id) {
          return { ...u, fullName: data.fullName, mobileNumber: data.mobileNumber };
        }
        return u;
      });
      localStorage.setItem('tata_users', JSON.stringify(updated));

      const updatedUser = { ...currentUser!, fullName: data.fullName, mobileNumber: data.mobileNumber };
      localStorage.setItem('tata_current_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      toast.success('Profile details updated successfully');
    } catch (err: any) {
      toast.error('Failed to update details');
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (data: any) => {
    setPasswordLoading(true);
    try {
      await authService.changePassword(data.oldPassword, data.newPassword);
      toast.success('Password changed successfully');
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to modify password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Customer Account Settings</h1>
        <p className="text-xs text-gray-400 mt-1">Configure profile details, change security passwords, and inspect submission logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Settings Forms */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Edit Details */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 space-y-6">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center border-b border-gray-50 dark:border-slate-700/20 pb-3">
              <User size={16} className="mr-2 text-tata-blue" /> Personal Contact Details
            </h3>

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Registered Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><Mail size={14} /></span>
                    <input 
                      type="text" 
                      readOnly
                      value={currentUser.email}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-900 text-xs font-semibold text-gray-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Registered Date</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><Calendar size={14} /></span>
                    <input 
                      type="text" 
                      readOnly
                      value={new Date(currentUser.createdAt).toLocaleDateString()}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-900 text-xs font-semibold text-gray-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Full Name *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><User size={14} /></span>
                    <input 
                      type="text" 
                      {...profileReg('fullName', { required: 'Name is required' })}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                    />
                  </div>
                  {profileErrors.fullName && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{profileErrors.fullName.message}</span>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Mobile Number *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><Phone size={14} /></span>
                    <input 
                      type="text" 
                      {...profileReg('mobileNumber', { 
                        required: 'Mobile is required',
                        pattern: { value: /^[0-9]{10}$/, message: 'Must be 10-digit number' }
                      })}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                    />
                  </div>
                  {profileErrors.mobileNumber && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{profileErrors.mobileNumber.message}</span>}
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={profileLoading}
                  className="px-4 py-2.5 bg-tata-blue hover:bg-tata-blue-hover text-white text-xs font-bold rounded-lg shadow-md transition disabled:bg-tata-blue/60"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 space-y-6">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center border-b border-gray-50 dark:border-slate-700/20 pb-3">
              <Lock size={16} className="mr-2 text-tata-blue" /> Change Account Password
            </h3>

            <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Old Password *</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    {...passReg('oldPassword', { required: 'Old password is required' })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                  />
                  {passErrors.oldPassword && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{passErrors.oldPassword.message}</span>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">New Password *</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    {...passReg('newPassword', { required: 'New password is required' })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                  />
                  {passErrors.newPassword && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{passErrors.newPassword.message}</span>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Confirm Password *</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    {...passReg('confirmPassword', { required: 'Password confirmation is required' })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                  />
                  {passErrors.confirmPassword && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{passErrors.confirmPassword.message}</span>}
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="px-4 py-2.5 bg-tata-blue hover:bg-tata-blue-hover text-white text-xs font-bold rounded-lg shadow-md transition disabled:bg-tata-blue/60"
                >
                  {passwordLoading ? 'Changing...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right: Quick Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 text-center space-y-4">
            <div className="h-16 w-16 bg-tata-blue/10 text-tata-blue dark:bg-tata-blue/20 dark:text-tata-blue-light rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-inner">
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-white">{currentUser.fullName}</h4>
              <span className="text-[10px] text-gray-400">{currentUser.email}</span>
            </div>

            <div className="border-t border-gray-50 dark:border-slate-700/20 pt-4 text-xs text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Applications:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{applications.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status Active:</span>
                <span className="font-bold text-green-600 dark:text-green-400">Verified Client</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
