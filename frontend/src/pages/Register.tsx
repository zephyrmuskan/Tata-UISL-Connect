import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      mobileNumber: ''
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await authService.register(data.fullName, data.email, data.mobileNumber);
      toast.success(response.message);
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-gray-50 dark:bg-slate-900 transition-colors">
      
      {/* Sidebar Panel */}
      <div className="hidden lg:flex lg:col-span-5 bg-tata-blue-dark text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tata-blue/20 to-tata-blue-dark/95 z-0"></div>
        
        <div className="relative z-10 flex items-center space-x-2">
          <span className="h-8 w-8 bg-white text-tata-blue flex items-center justify-center font-extrabold rounded-md shadow-md text-lg">T</span>
          <div className="flex flex-col text-left">
            <span className="font-bold tracking-wider text-base leading-none text-white">TATA UISL</span>
            <span className="text-[9px] text-white/60 font-semibold tracking-widest uppercase mt-0.5">Connect Portal</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6 my-auto">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Create Your <br />
            Customer Account.
          </h2>
          <p className="text-xs text-white/70 max-w-sm leading-relaxed">
            Register today to apply for power and utility connections, submit property records, and track applications completely online.
          </p>
          <div className="flex items-center space-x-2 text-[10px] text-white/50 font-bold uppercase tracking-wider">
            <ShieldCheck size={14} className="text-green-400" /> <span>Secure SSL Encrypted Platform</span>
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-white/40">
          © {new Date().getFullYear()} JUSCO. Tata Enterprise.
        </div>
      </div>

      {/* Form Area */}
      <div className="lg:col-span-7 flex flex-col justify-center p-8 md:p-16 max-w-lg mx-auto w-full">
        
        <div className="flex lg:hidden items-center space-x-2 mb-8">
          <span className="h-8 w-8 bg-tata-blue text-white flex items-center justify-center font-extrabold rounded-md shadow-md text-lg">T</span>
          <div className="flex flex-col text-left">
            <span className="font-bold tracking-wider text-base leading-none text-gray-900 dark:text-white">TATA UISL</span>
            <span className="text-[9px] text-gray-400 font-semibold tracking-widest uppercase mt-0.5">Connect Portal</span>
          </div>
        </div>

        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Register Account</h2>
          <p className="text-xs text-gray-400">Join Tata UISL to submit connection applications and load upgrades.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><User size={16} /></span>
              <input 
                type="text" 
                placeholder="e.g. Rajesh Kumar" 
                {...register('fullName', { required: 'Full name is required' })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 focus:border-transparent dark:text-white"
              />
            </div>
            {errors.fullName && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.fullName.message}</span>}
          </div>

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
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Mobile Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><Phone size={16} /></span>
              <input 
                type="tel" 
                placeholder="10-digit mobile number" 
                {...register('mobileNumber', { 
                  required: 'Mobile number is required',
                  pattern: { value: /^[0-9]{10}$/, message: 'Must be a 10-digit number' }
                })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 focus:border-transparent dark:text-white"
              />
            </div>
            {errors.mobileNumber && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.mobileNumber.message}</span>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-tata-blue hover:bg-tata-blue-hover disabled:bg-tata-blue/60 text-white font-bold rounded-lg shadow-md transition duration-200 flex items-center justify-center text-xs"
          >
            {loading ? 'Registering...' : 'Register Account'} <ArrowRight size={14} className="ml-2" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs">
          <span className="text-gray-400">Already have an account? </span>
          <Link to="/login" className="font-bold text-tata-blue dark:text-tata-blue-light hover:underline">Sign In</Link>
        </div>

      </div>
    </div>
  );
};
