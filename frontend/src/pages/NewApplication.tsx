import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  User, MapPin, Zap, Home, FileText, CheckCircle2, ArrowLeft, ArrowRight, 
  Upload, Trash2, Edit2, AlertCircle, RefreshCw, Printer
} from 'lucide-react';
import { applicationService } from '../services/api';
import { toast } from 'react-toastify';

export const NewApplication: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  // Files Upload state
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: { name: string; size: number; base64: string } }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm({
    mode: 'onTouched',
    defaultValues: {
      // Personal
      fullName: '',
      fatherName: '',
      motherName: '',
      gender: 'Male',
      dateOfBirth: '',
      aadhaarNumber: '',
      panNumber: '',
      occupation: '',
      annualIncome: '',

      // Address
      addressLine1: '',
      addressLine2: '',
      city: 'Jamshedpur',
      state: 'Jharkhand',
      district: 'East Singhbhum',
      pinCode: '831001',

      // Connection
      connectionTypeId: '1',
      applicationType: 'New Connection' as const,

      // Property
      propertyType: 'Residential Building',
      houseNumber: '',
      wardNumber: '',
      area: '',
      landmark: ''
    }
  });

  const steps = [
    { title: 'Personal Info', icon: User },
    { title: 'Address Details', icon: MapPin },
    { title: 'Connection Details', icon: Zap },
    { title: 'Property Details', icon: Home },
    { title: 'Documents Upload', icon: Upload },
    { title: 'Review & Submit', icon: CheckCircle2 }
  ];

  // Validate current step before advancing
  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger(['fullName', 'fatherName', 'motherName', 'dateOfBirth', 'aadhaarNumber', 'panNumber', 'occupation', 'annualIncome']);
    } else if (currentStep === 2) {
      isValid = await trigger(['addressLine1', 'city', 'state', 'district', 'pinCode']);
    } else if (currentStep === 3) {
      isValid = await trigger(['connectionTypeId', 'applicationType']);
    } else if (currentStep === 4) {
      isValid = await trigger(['propertyType', 'houseNumber', 'wardNumber', 'area']);
    } else if (currentStep === 5) {
      // Check required documents uploaded
      const requiredDocs = ['Aadhaar Card', 'PAN Card', 'Passport Size Photo', 'Ownership Proof', 'Signature'];
      const missing = requiredDocs.filter(doc => !uploadedFiles[doc]);
      if (missing.length > 0) {
        toast.error(`Please upload required documents: ${missing.join(', ')}`);
        return;
      }
      isValid = true;
    }

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Convert uploaded file to base64
  const handleFileUpload = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    // Check file format
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPG, PNG formats are supported.');
      return;
    }

    // Simulate progress
    setUploadProgress(prev => ({ ...prev, [docType]: 10 }));
    let progress = 10;
    const interval = setInterval(() => {
      progress += 30;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [docType]: 100 }));
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedFiles(prev => ({
            ...prev,
            [docType]: {
              name: file.name,
              size: file.size,
              base64: reader.result as string
            }
          }));
          toast.success(`${docType} uploaded successfully`);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadProgress(prev => ({ ...prev, [docType]: progress }));
      }
    }, 150);
  };

  const handleFileDelete = (docType: string) => {
    setUploadedFiles(prev => {
      const updated = { ...prev };
      delete updated[docType];
      return updated;
    });
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[docType];
      return updated;
    });
    toast.info(`${docType} removed.`);
  };

  // Form submission
  const onSubmitForm = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Map documents state to app format
      const docsArray = Object.entries(uploadedFiles).map(([type, file]) => ({
        id: 'doc_' + Math.floor(Math.random() * 10000),
        documentType: type,
        fileName: file.name,
        fileSize: file.size,
        filePath: file.base64,
        verificationStatus: 'Pending' as const,
        uploadedAt: new Date().toISOString()
      }));

      const applicationPayload = {
        ...data,
        documents: docsArray
      };

      const result = await applicationService.submitApplication(applicationPayload);
      setSubmittedApp(result);
      toast.success('Your connection request was submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print Receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  if (submittedApp) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 space-y-8 print:shadow-none print:border-none print:p-0">
        
        {/* Success header */}
        <div className="text-center space-y-3 print:hidden">
          <div className="h-14 w-14 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Application Submitted!</h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Your connection request was processed successfully. Track verification updates using your application number.
          </p>
        </div>

        {/* Receipt content (printable) */}
        <div className="p-6 border border-gray-200 dark:border-slate-700 rounded-2xl bg-gray-50 dark:bg-slate-900/30 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-700 pb-4">
            <div className="flex items-center space-x-2">
              <span className="h-7 w-7 bg-tata-blue text-white flex items-center justify-center font-bold rounded text-sm">T</span>
              <div className="text-left">
                <span className="block font-bold text-gray-800 dark:text-white text-xs tracking-wider leading-none">TATA UISL</span>
                <span className="text-[8px] text-gray-400 dark:text-gray-500 font-semibold tracking-widest mt-0.5 block uppercase">Receipt Voucher</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-gray-400 uppercase font-bold">Application No.</span>
              <span className="text-xs font-mono font-extrabold text-tata-blue dark:text-tata-blue-light">{submittedApp.applicationNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">Applicant Name</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{submittedApp.fullName}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">Application Type</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{submittedApp.applicationType}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">Connection Type</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{submittedApp.connectionTypeName}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">Property Address</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{submittedApp.houseNumber}, {submittedApp.area}, Jamshedpur</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">Mobile Number</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{submittedApp.customerMobile}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">Submission Date</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {new Date(submittedApp.submittedDate).toLocaleDateString()} {new Date(submittedApp.submittedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-700 pt-4 text-[10px] text-gray-400 leading-normal text-center">
            This is an automated system generated receipt. Original documents verification pending.
          </div>
        </div>

        {/* Receipt buttons */}
        <div className="flex space-x-4 justify-center print:hidden">
          <button 
            onClick={handlePrintReceipt}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white text-xs font-bold rounded-lg transition flex items-center"
          >
            <Printer size={14} className="mr-2" /> Print Receipt
          </button>
          <button 
            onClick={() => navigate('/customer/track')}
            className="px-4 py-2.5 bg-tata-blue hover:bg-tata-blue-hover text-white text-xs font-bold rounded-lg shadow-md transition flex items-center"
          >
            Track Status <ArrowRight size={14} className="ml-2" />
          </button>
        </div>

      </div>
    );
  }

  const documentTypes = [
    { type: 'Aadhaar Card', desc: 'Identity verification proof (both sides PDF/JPG)', required: true },
    { type: 'PAN Card', desc: 'Income tax verification registry record', required: true },
    { type: 'Passport Size Photo', desc: 'Recent studio-headshot photograph', required: true },
    { type: 'Address Proof', desc: 'Utility bill / gas slip / registry deed copy', required: true },
    { type: 'Ownership Proof', desc: 'Sale deed deed of gift allotment letter mutation record', required: true },
    { type: 'Signature', desc: 'Scanned signature specimen validation image', required: true },
    { type: 'Electricity Bill', desc: 'Existing meter reading invoice (for load upgrades/transfers)', required: false }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">New Connection Request</h1>
        <p className="text-xs text-gray-400 mt-1">Complete all form sections to register a connection or transfer.</p>
      </div>

      {/* Steps horizontal indicator */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex justify-between items-center overflow-x-auto">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const stepNum = index + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;

          return (
            <div key={index} className="flex items-center space-x-2 flex-shrink-0 mx-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                isActive 
                  ? 'bg-tata-blue text-white shadow-md' 
                  : isCompleted 
                    ? 'bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-400 dark:bg-slate-700/50 dark:text-slate-500'
              }`}>
                {isCompleted ? <CheckCircle2 size={16} /> : <StepIcon size={14} />}
              </div>
              <span className={`text-xs font-semibold hidden md:inline-block ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Form Box */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50">
        
        {/* STEP 1: PERSONAL INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center">
              <User size={16} className="mr-2 text-tata-blue" /> Section 1: Personal Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Applicant Full Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rajesh Kumar" 
                  {...register('fullName', { required: 'Full name is required' })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                />
                {errors.fullName && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.fullName.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Father's Name *</label>
                <input 
                  type="text" 
                  placeholder="Father's full name" 
                  {...register('fatherName', { required: 'Father\'s name is required' })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                />
                {errors.fatherName && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.fatherName.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Mother's Name *</label>
                <input 
                  type="text" 
                  placeholder="Mother's full name" 
                  {...register('motherName', { required: 'Mother\'s name is required' })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                />
                {errors.motherName && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.motherName.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Gender</label>
                  <select 
                    {...register('gender')}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Date of Birth *</label>
                  <input 
                    type="date" 
                    {...register('dateOfBirth', { required: 'Date of birth is required' })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                  />
                  {errors.dateOfBirth && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.dateOfBirth.message}</span>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Aadhaar Number (12 digits) *</label>
                <input 
                  type="text" 
                  placeholder="e.g. 123456789012" 
                  maxLength={12}
                  {...register('aadhaarNumber', { 
                    required: 'Aadhaar is required',
                    pattern: { value: /^[0-9]{12}$/, message: 'Aadhaar must be a 12-digit number' }
                  })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                />
                {errors.aadhaarNumber && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.aadhaarNumber.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">PAN Number *</label>
                <input 
                  type="text" 
                  placeholder="e.g. ABCDE1234F" 
                  maxLength={10}
                  {...register('panNumber', { 
                    required: 'PAN card code is required',
                    pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, message: 'Invalid PAN card format' }
                  })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white uppercase"
                />
                {errors.panNumber && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.panNumber.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Occupation *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Corporate Manager / Self Employed" 
                  {...register('occupation', { required: 'Occupation is required' })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                />
                {errors.occupation && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.occupation.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Annual Income (₹) *</label>
                <input 
                  type="number" 
                  placeholder="e.g. 600000" 
                  {...register('annualIncome', { required: 'Annual income is required' })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                />
                {errors.annualIncome && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.annualIncome.message}</span>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ADDRESS INFORMATION */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center">
              <MapPin size={16} className="mr-2 text-tata-blue" /> Section 2: Address
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Address Line 1 *</label>
                <input 
                  type="text" 
                  placeholder="House number, Flat name, Apartment details" 
                  {...register('addressLine1', { required: 'Address Line 1 is required' })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                />
                {errors.addressLine1 && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.addressLine1.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Address Line 2</label>
                <input 
                  type="text" 
                  placeholder="Street name, Sector, Landmark details" 
                  {...register('addressLine2')}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">City</label>
                  <input 
                    type="text" 
                    readOnly
                    {...register('city')}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-900 text-xs font-semibold focus:outline-none text-gray-500 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">State</label>
                  <input 
                    type="text" 
                    readOnly
                    {...register('state')}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-900 text-xs font-semibold focus:outline-none text-gray-500 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">District</label>
                  <input 
                    type="text" 
                    readOnly
                    {...register('district')}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-900 text-xs font-semibold focus:outline-none text-gray-500 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">PIN Code *</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    {...register('pinCode', { 
                      required: 'Pin code is required',
                      pattern: { value: /^[0-9]{6}$/, message: 'PIN code must be a 6-digit number' }
                    })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                  />
                  {errors.pinCode && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.pinCode.message}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CONNECTION DETAILS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center">
              <Zap size={16} className="mr-2 text-tata-blue" /> Section 3: Connection Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Connection Category</label>
                <select 
                  {...register('connectionTypeId')}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                >
                  <option value="1">Domestic Connection</option>
                  <option value="2">Commercial Connection</option>
                  <option value="3">Industrial Power Line</option>
                  <option value="6">Temporary construction load</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Type of Application</label>
                <select 
                  {...register('applicationType')}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                >
                  <option value="New Connection">New Connection</option>
                  <option value="Name Transfer">Name Transfer (Ownership change)</option>
                  <option value="Load Enhancement">Load Enhancement (kW upgrade)</option>
                  <option value="Temporary Connection">Temporary Connection</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-950/20 border border-gray-100 dark:border-slate-800 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-gray-700 dark:text-gray-300 block">Note for Load Enhancement / Name Transfer:</span>
              <p className="text-gray-400 leading-normal">
                If applying for upgrades or transfers, uploading an existing Electricity Bill is required in Step 5.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: PROPERTY DETAILS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center">
              <Home size={16} className="mr-2 text-tata-blue" /> Section 4: Property Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Property Type *</label>
                <select 
                  {...register('propertyType')}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                >
                  <option value="Residential Building">Residential Building</option>
                  <option value="Commercial Shop">Commercial Shop</option>
                  <option value="Industrial Shed">Industrial Shed</option>
                  <option value="Residential Flat">Residential Flat</option>
                  <option value="Open Land/Construction Site">Open Land / Construction Site</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">House/Shop Number *</label>
                <input 
                  type="text" 
                  placeholder="House or Plot identifier number" 
                  {...register('houseNumber', { required: 'House/plot number is required' })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                />
                {errors.houseNumber && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.houseNumber.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Ward Number *</label>
                <input 
                  type="text" 
                  placeholder="Municipal ward number" 
                  {...register('wardNumber', { required: 'Ward number is required' })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                />
                {errors.wardNumber && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.wardNumber.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Area / Locality *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bistupur / Sakchi / Kadma" 
                  {...register('area', { required: 'Area locality is required' })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                />
                {errors.area && <span className="text-red-500 text-[10px] font-semibold mt-1.5 block">{errors.area.message}</span>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Nearby Landmark</label>
                <input 
                  type="text" 
                  placeholder="Major nearby landmark or reference" 
                  {...register('landmark')}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tata-blue/40 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DOCUMENT UPLOAD */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center">
                <Upload size={16} className="mr-2 text-tata-blue" /> Document Repository (10MB limit)
              </h3>
              <span className="text-[10px] text-gray-400 font-bold">PDF, JPG, PNG only</span>
            </div>

            <div className="space-y-4">
              {documentTypes.map((doc, index) => {
                // If it is electricity bill, only show if application type is load upgrade or transfer
                const appType = getValues('applicationType');
                if (doc.type === 'Electricity Bill' && appType === 'New Connection') return null;

                const file = uploadedFiles[doc.type];
                const progress = uploadProgress[doc.type];

                return (
                  <div key={index} className="p-4 border border-gray-100 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-900/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center">
                        {doc.type} {doc.required && <strong className="text-red-500 ml-1">*</strong>}
                      </span>
                      <p className="text-[10px] text-gray-400 leading-normal">{doc.desc}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      {file ? (
                        <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700/50 shadow-sm text-xs">
                          <FileText size={16} className="text-tata-blue" />
                          <div className="flex flex-col max-w-[120px] md:max-w-[200px]">
                            <span className="font-bold truncate text-[11px] text-gray-700 dark:text-gray-300">{file.name}</span>
                            <span className="text-[9px] text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleFileDelete(doc.type)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                            title="Remove File"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : progress !== undefined ? (
                        <div className="flex flex-col items-end space-y-1.5 w-[200px]">
                          <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-tata-blue h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                          </div>
                          <span className="text-[9px] text-gray-400 font-bold flex items-center"><RefreshCw size={10} className="mr-1 animate-spin" /> Uploading {progress}%</span>
                        </div>
                      ) : (
                        <label className="px-4 py-2 border border-dashed border-gray-300 hover:border-tata-blue dark:border-slate-700 dark:hover:border-tata-blue bg-white dark:bg-slate-800 text-tata-blue dark:text-tata-blue-light hover:bg-tata-blue/5 text-xs font-bold rounded-lg cursor-pointer transition flex items-center">
                          <Upload size={13} className="mr-2" /> Upload Document
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf, .jpg, .png, .jpeg"
                            onChange={(e) => handleFileUpload(doc.type, e)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW & SUBMIT */}
        {currentStep === 6 && (
          <div className="space-y-8">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center">
              <CheckCircle2 size={16} className="mr-2 text-tata-blue" /> Section 6: Review Application Summary
            </h3>

            <div className="divide-y divide-gray-100 dark:divide-slate-700/50 space-y-6">
              
              {/* Section 1 summary */}
              <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="md:col-span-2 flex justify-between items-center mb-1">
                  <span className="font-bold text-tata-blue dark:text-tata-blue-light uppercase tracking-wider text-[10px]">1. Personal Information</span>
                  <button onClick={() => setCurrentStep(1)} className="text-[10px] font-bold text-gray-400 hover:text-tata-blue flex items-center"><Edit2 size={12} className="mr-1" /> Edit</button>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Applicant Name</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{getValues('fullName')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Father / Mother Name</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{getValues('fatherName')} / {getValues('motherName')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Aadhaar Number</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{getValues('aadhaarNumber')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">PAN Card Code</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 uppercase">{getValues('panNumber')}</span>
                </div>
              </div>

              {/* Section 2 summary */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="md:col-span-2 flex justify-between items-center mb-1">
                  <span className="font-bold text-tata-blue dark:text-tata-blue-light uppercase tracking-wider text-[10px]">2. Property Address</span>
                  <button onClick={() => setCurrentStep(2)} className="text-[10px] font-bold text-gray-400 hover:text-tata-blue flex items-center"><Edit2 size={12} className="mr-1" /> Edit</button>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[10px] text-gray-400 block">Billing Address</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{getValues('addressLine1')}, {getValues('addressLine2')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">City / State / ZIP</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{getValues('city')}, {getValues('state')} - {getValues('pinCode')}</span>
                </div>
              </div>

              {/* Section 3 & 4 summary */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="md:col-span-2 flex justify-between items-center mb-1">
                  <span className="font-bold text-tata-blue dark:text-tata-blue-light uppercase tracking-wider text-[10px]">3 & 4. Connection & Property</span>
                  <button onClick={() => setCurrentStep(3)} className="text-[10px] font-bold text-gray-400 hover:text-tata-blue flex items-center"><Edit2 size={12} className="mr-1" /> Edit</button>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Request Category / Type</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {getValues('connectionTypeId') === '1' ? 'Domestic' : getValues('connectionTypeId') === '2' ? 'Commercial' : 'Industrial'} - {getValues('applicationType')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Property Category</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{getValues('propertyType')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Ward / Landmark Details</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">Ward {getValues('wardNumber')} - {getValues('landmark') || 'None'}</span>
                </div>
              </div>

              {/* Documents summary */}
              <div className="pt-6 text-xs">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-tata-blue dark:text-tata-blue-light uppercase tracking-wider text-[10px]">5. Uploaded Documents</span>
                  <button onClick={() => setCurrentStep(5)} className="text-[10px] font-bold text-gray-400 hover:text-tata-blue flex items-center"><Edit2 size={12} className="mr-1" /> Edit</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(uploadedFiles).map(([type, file]) => (
                    <div key={type} className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg border border-gray-100 dark:border-slate-700/50 text-[11px]">
                      <FileText size={14} className="text-tata-blue" />
                      <span className="font-bold text-gray-700 dark:text-gray-300">{type}:</span>
                      <span className="truncate text-gray-400 max-w-[120px]">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Declaration Box */}
            <div className="p-4 bg-yellow-50/50 dark:bg-slate-900/30 border border-yellow-100 dark:border-slate-800 rounded-2xl flex items-start space-x-3 text-xs leading-normal">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" size={16} />
              <p className="text-gray-400">
                I hereby declare that all details submitted in this connection application are true to the best of my knowledge. I understand that physical site audits will be carried out prior to power activation.
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-between">
          <button 
            type="button" 
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ArrowLeft size={14} className="mr-2" /> Back
          </button>
          
          {currentStep === steps.length ? (
            <button 
              type="button" 
              onClick={handleSubmit(onSubmitForm)}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-tata-blue hover:bg-tata-blue-hover text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center disabled:bg-tata-blue/60"
            >
              {isSubmitting ? 'Registering Application...' : 'Confirm & Submit'} <CheckCircle2 size={14} className="ml-2" />
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleNext}
              className="px-5 py-2.5 bg-tata-blue hover:bg-tata-blue-hover text-white text-xs font-bold rounded-lg shadow-md transition flex items-center"
            >
              Save & Next <ArrowRight size={14} className="ml-2" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
