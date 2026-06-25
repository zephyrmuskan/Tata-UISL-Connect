import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

export const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      otp: ''
    }
  });

  useEffect(() => {
    const emailParam = searchParams.get('email') || localStorage.getItem('tata_pending_otp_email') || '';
    setEmail(emailParam);
    if (!emailParam) {
      toast.warning('No verification process pending.');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await authService.verifyOtp(email, data.otp);
      toast.success('Account verified successfully! You can now log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    toast.success('A new OTP has been dispatched to your email.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors p-6">
      <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 max-w-md w-full text-center space-y-6">
        
        {/* Verification Icon */}
        <div className="h-12 w-12 bg-tata-blue/10 text-tata-blue dark:bg-tata-blue/20 dark:text-tata-blue-light rounded-full flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck size={26} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Verify Account</h2>
          <p className="text-xs text-gray-400 leading-normal">
            Enter the 6-digit OTP code dispatched to <br />
            <strong className="text-gray-700 dark:text-gray-200">{email}</strong>
          </p>
        </div>

        {/* Demo OTP Box */}
        <div className="p-4 bg-yellow-50 dark:bg-slate-900/50 border border-yellow-200/50 dark:border-slate-700/50 rounded-xl flex items-start space-x-3 text-left">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" size={16} />
          <div className="text-xs">
            <span className="font-bold text-yellow-800 dark:text-yellow-400 block">OTP Code for Demo</span>
            <span className="text-gray-400 text-[11px] block mt-0.5">Use OTP code <strong className="text-gray-700 dark:text-gray-200">123456</strong> to verify.</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Verification Code</label>
            <input 
              type="text" 
              placeholder="000000" 
              maxLength={6}
              {...register('otp', { 
                required: 'OTP code is required',
                pattern: { value: /^[0-9]{6}$/, message: 'Must be exactly 6 digits' }
              })}
              className="w-full text-center tracking-[1.5em] pl-[1.5em] py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 focus:border-transparent dark:text-white"
            />
            {errors.otp && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.otp.message}</span>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-tata-blue hover:bg-tata-blue-hover disabled:bg-tata-blue/60 text-white font-bold rounded-lg shadow-md transition duration-200 flex items-center justify-center text-xs"
          >
            {loading ? 'Verifying...' : 'Verify OTP'} <ArrowRight size={14} className="ml-2" />
          </button>
        </form>

        <div className="pt-2 flex justify-between items-center text-xs">
          <button 
            onClick={handleResend}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center"
          >
            <RefreshCw size={12} className="mr-1.5" /> Resend OTP
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="font-bold text-tata-blue dark:text-tata-blue-light hover:underline"
          >
            Back to Sign In
          </button>
        </div>

      </div>
    </div>
  );
};
