import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Zap, Clock, Headphones, HelpCircle, 
  Phone, Mail, Award, BookOpen, AlertCircle
} from 'lucide-react';
import { TataEmblem } from '../components/TataLogo';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [quickTrackNum, setQuickTrackNum] = useState('');
  const [trackError, setTrackError] = useState('');

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackNum.trim()) {
      setTrackError('Please enter a valid application number');
      return;
    }
    setTrackError('');
    // Store track number temporarily and redirect
    localStorage.setItem('tata_quick_track_number', quickTrackNum.trim());
    navigate('/login?redirect=track');
  };

  const faqs = [
    { q: 'How long does a new connection request take?', a: 'Once documents are verified and site review is completed, connections are typically activated within 5-7 working days.' },
    { q: 'What ownership proofs are accepted?', a: 'We accept registered Sale Deeds, Tax Receipts, Mutation Certificates, or Allotment Letters from municipal authorities.' },
    { q: 'How can I apply for load enhancement?', a: 'Log in to the Customer Portal, navigate to New Application, select your existing connection, and choose "Load Enhancement" under Connection Details.' },
    { q: 'Is physical submission of documents required?', a: 'No, our portal allows uploading scanned copies or clear photos of all required documents (PDF, JPG, PNG up to 10MB).' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 transition-colors">
      
      {/* Top Utility Bar */}
      <div className="bg-tata-blue-dark text-white text-[11px] py-2 px-6 flex justify-between items-center border-b border-tata-blue/20">
        <div className="flex items-center space-x-4">
          <span className="flex items-center"><Phone size={11} className="mr-1.5" /> Toll Free: 1800-345-6789</span>
          <span className="hidden md:flex items-center"><Mail size={11} className="mr-1.5" /> support.uisl@tatasteel.com</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="bg-white/10 px-2 py-0.5 rounded font-medium">Jamshedpur Utilities & Services Company</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 shadow-sm z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TataEmblem size={32} />
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 dark:text-white tracking-wider text-base">TATA UISL</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-400 font-semibold tracking-widest leading-none mt-0.5">CONNECT PORTAL</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link 
              to="/login" 
              className="px-4 py-2 text-xs font-semibold text-tata-blue dark:text-tata-blue-light hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 text-xs font-semibold bg-tata-blue hover:bg-tata-blue-hover text-white rounded-lg shadow transition"
            >
              Register Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-tata-blue/10 via-white to-gray-50 dark:from-tata-blue/20 dark:via-slate-900 dark:to-slate-950 py-16 px-6 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-tata-blue/10 dark:bg-tata-blue/20 px-3 py-1.5 rounded-full text-tata-blue dark:text-tata-blue-light text-[11px] font-bold tracking-wide uppercase">
              <Award size={12} className="mr-1" /> Trusted Utility Services by TATA Group
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              Simplified Power & Utilities <br />
              <span className="text-tata-blue dark:text-tata-blue-light">At Your Fingertips</span>
            </h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
              Apply for new connections, transfer existing ownership, enhance connected load, and track documentation status updates in real-time. Transparent, secure, and completely paperless.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold bg-tata-blue hover:bg-tata-blue-hover text-white rounded-lg shadow-lg hover:shadow-xl transition"
              >
                Apply for Connection <ArrowRight size={16} className="ml-2" />
              </Link>
              <a 
                href="#quick-track" 
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm transition"
              >
                Track Existing Application
              </a>
            </div>
          </div>

          {/* Hero Right - Quick Track Box */}
          <div id="quick-track" className="lg:col-span-5">
            <div className="p-6 md:p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Track Application</h3>
              <p className="text-xs text-gray-400 dark:text-gray-400 mb-6">Enter your unique application ID to verify real-time connection status updates.</p>
              
              <form onSubmit={handleQuickTrack} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Application ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. TATA-UISL-2026-98124" 
                    value={quickTrackNum}
                    onChange={(e) => setQuickTrackNum(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40"
                  />
                  {trackError && (
                    <div className="flex items-center text-red-500 mt-2 text-xs font-medium">
                      <AlertCircle size={14} className="mr-1" /> {trackError}
                    </div>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-tata-blue hover:bg-tata-blue-hover text-white text-xs font-bold rounded-lg shadow-md transition flex items-center justify-center"
                >
                  Track Status
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700 grid grid-cols-2 gap-4">
                <Link to="/login" className="p-3 bg-gray-50 dark:bg-slate-900/30 rounded-xl hover:bg-tata-blue/5 dark:hover:bg-tata-blue/10 border border-transparent hover:border-tata-blue/10 transition group text-center block">
                  <span className="block text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-tata-blue">Customer Portal</span>
                  <span className="text-[10px] text-gray-400 block mt-1">Submit & manage</span>
                </Link>
                <Link to="/login?admin=true" className="p-3 bg-gray-50 dark:bg-slate-900/30 rounded-xl hover:bg-tata-blue/5 dark:hover:bg-tata-blue/10 border border-transparent hover:border-tata-blue/10 transition group text-center block">
                  <span className="block text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-tata-blue">Officer Gateway</span>
                  <span className="text-[10px] text-gray-400 block mt-1">Verify & Approve</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Why Choose Tata UISL</h2>
          <p className="text-xs md:text-sm text-gray-400">Streamlining utility applications across East Singhbhum with enterprise-grade technology.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: 'Secured Documentation', desc: 'Secure document storage with instant file verification features for verification officer checkouts.', icon: ShieldCheck, color: 'bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400' },
            { title: 'Rapid Processing', desc: 'Auto-routed connection request processing for load enhancements, name transfers, and temporary power lines.', icon: Zap, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400' },
            { title: 'Real-time Tracking', desc: 'Track review pipelines from initial document verification up to meter installations and final sign-offs.', icon: Clock, color: 'bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' },
            { title: 'Interactive Help', desc: 'Dedicated helpline, support desks, and step-by-step guides ensuring high quality utility setup experiences.', icon: Headphones, color: 'bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className={`h-10 w-10 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon size={20} />
                </div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-2">{item.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Guide / FAQs Section */}
      <section className="bg-gray-100 dark:bg-slate-800/40 py-20 px-6 border-y border-gray-200/50 dark:border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Help Center & FAQ</h2>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              Find answers to commonly asked questions regarding Tata utility application pipelines. Still need support? Contact our service desk at Bistupur customer center.
            </p>
            <div className="flex items-center space-x-3 pt-2 text-xs font-semibold text-tata-blue dark:text-tata-blue-light">
              <BookOpen size={16} /> <span>Download Customer Connection Guidelines (PDF)</span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/40 dark:border-slate-700/50">
                <h4 className="text-xs font-bold text-gray-800 dark:text-white flex items-center">
                  <HelpCircle size={14} className="mr-2 text-tata-blue flex-shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-xs text-gray-400 mt-2 pl-5 leading-relaxed">{faq.q === 'How long does a new connection request take?' ? 'Once documents are verified and site review is completed, connections are typically activated within 5-7 working days.' : faq.a}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Need Support?</h2>
          <p className="text-xs md:text-sm text-gray-400">
            For emergencies, billing queries, or site audit requirements, connect with our support agents directly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-white dark:bg-slate-800 border border-gray-200/50 dark:border-slate-700/50 rounded-xl flex items-center space-x-4 justify-center">
              <Phone className="text-tata-blue" size={20} />
              <div className="text-left">
                <span className="block text-[10px] text-gray-400 uppercase font-bold">Call Center</span>
                <span className="text-xs font-bold text-gray-800 dark:text-white">1800-345-6789</span>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 border border-gray-200/50 dark:border-slate-700/50 rounded-xl flex items-center space-x-4 justify-center">
              <Mail className="text-tata-blue" size={20} />
              <div className="text-left">
                <span className="block text-[10px] text-gray-400 uppercase font-bold">Email Support</span>
                <span className="text-xs font-bold text-gray-800 dark:text-white">support.uisl@tatasteel.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Footer */}
      <footer className="mt-auto bg-gray-900 text-gray-400 text-xs py-10 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-3">
            <TataEmblem size={24} />
            <div className="text-left">
              <span className="block font-bold text-white tracking-wide text-xs">TATA UISL</span>
              <span className="text-[9px] text-gray-500 font-semibold tracking-widest uppercase">Jamshedpur</span>
            </div>
          </div>

          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Regulatory Filings</a>
            <a href="#" className="hover:text-white transition">Help Desk</a>
          </div>

          <p className="text-[10px] text-gray-500">
            © {new Date().getFullYear()} Tata UISL. All rights reserved. Corporate Identity Number: U45200JH2003PLC010315
          </p>
        </div>
      </footer>

    </div>
  );
};
