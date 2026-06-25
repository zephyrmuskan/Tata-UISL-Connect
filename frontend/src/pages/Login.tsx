import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, ShieldAlert, ArrowRight, Info, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';
import { TataEmblem } from '../components/TataLogo';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  useEffect(() => {
    // Check url search parameters (e.g. ?admin=true)
    const isAdmin = searchParams.get('admin') === 'true';
    setIsAdminMode(isAdmin);
    if (isAdmin) {
      setValue('email', 'admin@tatauisl.com');
      setValue('password', 'Admin@123');
    } else {
      setValue('email', '');
      setValue('password', '');
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await authService.login(data.email, data.password);
      toast.success(`Welcome back, ${response.user.fullName}!`);
      
      const redirect = searchParams.get('redirect');
      if (response.user.role === 'Admin') {
        navigate('/admin');
      } else {
        if (redirect === 'track') {
          navigate('/customer/track');
        } else {
          navigate('/customer');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (admin: boolean) => {
    setIsAdminMode(admin);
    if (admin) {
      setValue('email', 'admin@tatauisl.com');
      setValue('password', 'Admin@123');
    } else {
      setValue('email', '');
      setValue('password', '');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-gray-50 dark:bg-slate-900 transition-colors">
      
      {/* Brand Left Panel (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 bg-tata-blue-dark text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tata-blue/20 to-tata-blue-dark/95 z-0"></div>
        
        {/* Top Branding */}
        <div className="relative z-10 flex items-center space-x-2">
          <div className="h-9 w-9 bg-white rounded-lg shadow-md flex items-center justify-center p-1">
            <TataEmblem size={26} />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold tracking-wider text-sm leading-none text-white">TATA UISL</span>
            <span className="text-[9px] text-white/60 font-semibold tracking-widest uppercase mt-0.5">Connect Portal</span>
          </div>
        </div>

        {/* Content Slider Mock */}
        <div className="relative z-10 space-y-6 my-auto">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Tata Corporate Utility <br />
            Management System.
          </h2>
          <p className="text-xs text-white/70 max-w-sm leading-relaxed">
            Welcome to the centralized portal for electricity, water, and waste utilities. Apply for connections and track updates seamlessly.
          </p>
          <div className="flex items-center space-x-2 text-[10px] text-white/50 font-bold uppercase tracking-wider">
            <Info size={12} /> <span>Official platform of Jamshedpur Utilities</span>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="relative z-10 text-[10px] text-white/40">
          © {new Date().getFullYear()} JUSCO. Tata Enterprise.
        </div>
      </div>

      {/* Login Form Right Panel */}
      <div className="lg:col-span-7 flex flex-col justify-center p-8 md:p-16 max-w-lg mx-auto w-full">
        
        {/* Logo and header for Mobile */}
        <div className="flex lg:hidden items-center space-x-2 mb-8">
          <TataEmblem size={28} />
          <div className="flex flex-col text-left">
            <span className="font-bold tracking-wider text-sm leading-none text-gray-900 dark:text-white">TATA UISL</span>
            <span className="text-[9px] text-gray-400 font-semibold tracking-widest uppercase mt-0.5">Connect Portal</span>
          </div>
        </div>

        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Sign In</h2>
          <p className="text-xs text-gray-400">Access your customer account or administrator console.</p>
        </div>

        {/* Portal Role Toggler */}
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg mb-6">
          <button 
            onClick={() => handleRoleToggle(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition ${!isAdminMode ? 'bg-white dark:bg-slate-700 text-tata-blue dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            Customer Access
          </button>
          <button 
            onClick={() => handleRoleToggle(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition ${isAdminMode ? 'bg-white dark:bg-slate-700 text-tata-blue dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            Officer Access
          </button>
        </div>

        {/* Demo Alert Box */}
        {isAdminMode ? (
          <div className="p-4 bg-tata-blue-light/40 dark:bg-slate-800 border border-tata-blue/20 rounded-xl mb-6 flex items-start space-x-3">
            <ShieldAlert className="text-tata-blue mt-0.5 flex-shrink-0" size={16} />
            <div className="text-xs leading-normal">
              <span className="font-bold text-tata-blue dark:text-tata-blue-light block">Admin Credentials Loaded</span>
              <span className="text-gray-400 text-[11px] block mt-0.5">Use email: <strong className="text-gray-700 dark:text-gray-200">admin@tatauisl.com</strong> and password: <strong className="text-gray-700 dark:text-gray-200">Admin@123</strong> to login.</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-xl mb-6 flex items-start space-x-3">
            <Info className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
            <div className="text-[11px] text-gray-400 leading-normal">
              First time customer? Register to create an account. You can log in using your registered email and any password for the demo.
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><Mail size={16} /></span>
              <input 
                type="email" 
                placeholder="email@example.com" 
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 focus:border-transparent dark:text-white"
              />
            </div>
            {errors.email && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.email.message}</span>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-bold text-tata-blue dark:text-tata-blue-light hover:underline">Forgot Password?</Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><Lock size={16} /></span>
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••" 
                {...register('password', { required: 'Password is required' })}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 focus:border-transparent dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.password.message}</span>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-tata-blue hover:bg-tata-blue-hover disabled:bg-tata-blue/60 text-white font-bold rounded-lg shadow-md transition duration-200 flex items-center justify-center text-xs"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={14} className="ml-2" />
          </button>
        </form>

        {!isAdminMode && (
          <div className="mt-8 text-center text-xs">
            <span className="text-gray-400">New customer? </span>
            <Link to="/register" className="font-bold text-tata-blue dark:text-tata-blue-light hover:underline">Create an Account</Link>
          </div>
        )}

      </div>
    </div>
  );
};
