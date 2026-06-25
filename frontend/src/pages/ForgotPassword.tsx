import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowRight, HelpCircle } from 'lucide-react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

export const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
      toast.success('Password reset link sent successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Error requesting reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors p-6">
      <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 max-w-md w-full space-y-6 text-center">
        
        <div className="h-12 w-12 bg-tata-blue/10 text-tata-blue dark:bg-tata-blue/20 dark:text-tata-blue-light rounded-full flex items-center justify-center mx-auto">
          <HelpCircle size={26} />
        </div>

        {!submitted ? (
          <>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Recover Password</h2>
              <p className="text-xs text-gray-400 leading-normal">
                Input your registered email address and we'll dispatch a link to securely recover your account.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="text-left">
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

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-tata-blue hover:bg-tata-blue-hover disabled:bg-tata-blue/60 text-white font-bold rounded-lg shadow-md transition duration-200 flex items-center justify-center text-xs"
              >
                {loading ? 'Sending link...' : 'Send Recovery Link'} <ArrowRight size={14} className="ml-2" />
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4 py-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Email Dispatched!</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              If an account exists under that email address, a password recovery link has been sent. Please inspect your email inbox and spam folder.
            </p>
            <div className="p-4 bg-gray-50 dark:bg-slate-900/40 rounded-xl text-xs text-left border border-gray-100 dark:border-slate-800">
              <span className="font-bold block mb-1">Demo Simulation Note</span>
              In this mock mode, you can immediately proceed back to the login screen and log in with your email.
            </div>
          </div>
        )}

        <div className="pt-2 text-center text-xs">
          <Link to="/login" className="font-bold text-tata-blue dark:text-tata-blue-light hover:underline">Back to Sign In</Link>
        </div>

      </div>
    </div>
  );
};
