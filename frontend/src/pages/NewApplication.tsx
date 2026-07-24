import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  User, MapPin, Zap, Home, FileText, CheckCircle2, ArrowLeft, ArrowRight, 
  Upload, Trash2, AlertCircle, RefreshCw, Printer, Shield, Check
} from 'lucide-react';
import { applicationService } from '../services/api';
import { toast } from 'react-toastify';

const getStepIcon = (title: string, index: number) => {
  const t = title.toLowerCase();
  if (t.includes('personal') || t.includes('applicant') || t.includes('consumer')) return User;
  if (t.includes('address') || t.includes('location')) return MapPin;
  if (t.includes('supply') || t.includes('connection') || t.includes('request')) return Zap;
  if (t.includes('existing') || t.includes('property') || t.includes('details')) return Home;
  if (t.includes('attachment') || t.includes('document') || t.includes('upload')) return FileText;
  if (t.includes('declaration') || t.includes('review') || t.includes('terms')) return Shield;
  
  const icons = [User, MapPin, Zap, Home, FileText, Shield];
  return icons[index % icons.length];
};

export const NewApplication: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  // Draft & Autosave States
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [lastAutosaved, setLastAutosaved] = useState<string | null>(null);

  // Files Upload state
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: { name: string; size: number; base64: string } }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [dragActive, setDragActive] = useState<{ [key: string]: boolean }>({});

  // Declaration checkbox state
  const [declarationChecked, setDeclarationChecked] = useState(false);
  
  // Custom Validation Error Map
  const [formErrors, setFormErrors] = useState<{ [key: string]: { message: string; step: number } }>({});

  const typeParam = searchParams.get('type');
  const divisionParam = searchParams.get('division') || 'Electricity';
  const isProvisional = typeParam === 'provisional';
  const isPermanentLt = typeParam === 'permanent-lt';
  const isPermanentHt = typeParam === 'permanent-ht';
  const isPermanent = isPermanentLt || isPermanentHt;
  const isTemporary = typeParam === 'temporary';
  const isSeparate = typeParam === 'separate';
  const isEnhancement = typeParam === 'enhancement';
  const isReduction = typeParam === 'reduction';
  const isNameChange = typeParam === 'namechange';
  const isOwnershipTransfer = typeParam === 'ownershiptransfer';
  const isCategoryChange = typeParam === 'categorychange';
  const isDisconnection = typeParam === 'disconnection';
  const isMeterTest = typeParam === 'metertest';
  const isCustomThreeStep = isEnhancement || isReduction || isNameChange || isOwnershipTransfer || isCategoryChange || isDisconnection || isMeterTest;
  const isSixStep = isPermanent || isTemporary || isSeparate;

  const { register, getValues, setValue, watch } = useForm({
    defaultValues: {
      createNewBp: true,
      existingBpNo: '',
      businessArea: '',
      ownerOrgName: '',
      fullName: '',
      relationshipType: 'Father',
      relationshipName: '',
      gender: 'Male',
      dateOfBirth: '',
      aadhaarNumber: '',
      panNumber: '',
      phoneNumber: '',
      alternatePhoneNumber: '',
      emailId: '',
      alternateEmailId: '',
      identityCardType: 'Aadhaar Card',
      identityCardNumber: '',
      
      // Address
      houseNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: 'Jamshedpur',
      state: 'Jharkhand',
      district: 'East Singhbhum',
      pinCode: '831001',

      // Connection Details
      connectionTypeId: '1',
      applicationType: 'New Connection',
      voltageRequirement: 'LT',
      loadRequirement: '',
      purposeOfConnection: 'Domestic',

      // Property Details
      propertyType: 'Residential',
      ownershipType: 'Owner',
      plotNumber: '',
      surveyNumber: '',
      landmark: '',

      // Business details (Optional)
      vendorName: '',
      vendorCertificateNumber: ''
    }
  });

  useEffect(() => {
    if (isProvisional) {
      setValue('applicationType', divisionParam === 'Water' ? 'New Provisional Water Connection' : 'New Connection');
      setValue('connectionTypeId', divisionParam === 'Water' ? '2' : '1');
    } else if (isPermanentLt) {
      setValue('applicationType', divisionParam === 'Water' ? 'New Water Connection LT' : 'New Power Connection LT');
      setValue('connectionTypeId', divisionParam === 'Water' ? '2' : '1');
    } else if (isPermanentHt) {
      setValue('applicationType', divisionParam === 'Water' ? 'New Water Connection HT' : 'New Power Connection HT');
      setValue('connectionTypeId', divisionParam === 'Water' ? '2' : '1');
      setValue('voltageRequirement', 'HT');
    } else if (isTemporary) {
      setValue('applicationType', divisionParam === 'Water' ? 'Temporary Water Connection' : 'Temporary Power Connection');
      setValue('connectionTypeId', divisionParam === 'Water' ? '2' : '1');
    } else if (isSeparate) {
      setValue('applicationType', divisionParam === 'Water' ? 'Separate Water Connection' : 'Separate Power Connection');
      setValue('connectionTypeId', divisionParam === 'Water' ? '2' : '1');
      
      const paramName = searchParams.get('name') || searchParams.get('username');
      if (paramName) setValue('fullName', paramName);
      
      const paramMobile = searchParams.get('mobile');
      if (paramMobile) setValue('phoneNumber', paramMobile);
      
      const paramEmail = searchParams.get('email');
      if (paramEmail) setValue('emailId', paramEmail);
      
      const paramAadhar = searchParams.get('aadhar');
      if (paramAadhar) {
        setValue('identityCardType', 'Aadhaar Card');
        setValue('identityCardNumber', paramAadhar);
        setValue('aadhaarNumber', paramAadhar);
      }
      
      const paramAddress = searchParams.get('address');
      if (paramAddress) setValue('addressLine1', paramAddress);
      
      const paramArea = searchParams.get('area');
      if (paramArea) setValue('businessArea', paramArea);
    } else if (isEnhancement) {
      setValue('applicationType', divisionParam === 'Water' ? 'Load Change Enhancemnet Of Water Connection' : 'Load Change-Enhancement');
      setValue('connectionTypeId', divisionParam === 'Water' ? '2' : '1');
    } else if (isReduction) {
      setValue('applicationType', divisionParam === 'Water' ? 'Load Change Reduction Of Water Connection' : 'Load Change-Reduction');
      setValue('connectionTypeId', divisionParam === 'Water' ? '2' : '1');
    } else if (isNameChange) {
      setValue('applicationType', divisionParam === 'Water' ? 'Consumer Name Change Of Water Connection' : 'Name Change');
      setValue('connectionTypeId', divisionParam === 'Water' ? '2' : '1');
    } else if (isOwnershipTransfer) {
      setValue('applicationType', divisionParam === 'Water' ? 'Ownership Transfer Of Water Connection' : 'Ownership Transfer');
      setValue('connectionTypeId', divisionParam === 'Water' ? '2' : '1');
    } else if (isCategoryChange) {
      setValue('applicationType', divisionParam === 'Water' ? 'Meter Relocation Of Water Connection' : 'Meter Relocation');
      setValue('connectionTypeId', divisionParam === 'Water' ? '2' : '1');
    } else if (isDisconnection) {
      setValue('applicationType', divisionParam === 'Water' ? 'Dismantling Of Water Connection' : 'Permanent Disconnection');
      setValue('connectionTypeId', divisionParam === 'Water' ? '2' : '1');
      // Pre-select first option in disconnection dropdowns so validation passes without interaction
      setValue('loadRequirement', 'Moving Premises');
      setValue('gender', 'Working');
    } else if (isMeterTest) {
      setValue('applicationType', divisionParam === 'Water' ? 'Water Meter Test' : 'Energy Meter Test');
      setValue('connectionTypeId', divisionParam === 'Water' ? '2' : '1');
      setValue('loadRequirement', 'Burnt out');
    }
  }, [isProvisional, isPermanentLt, isPermanentHt, isTemporary, isSeparate, isEnhancement, isReduction, isNameChange, isOwnershipTransfer, isCategoryChange, isDisconnection, isMeterTest, divisionParam, searchParams, setValue]);

  const createNewBp = watch('createNewBp');
  const draftId = searchParams.get('id');

  // Load draft on mount if ID is in URL
  useEffect(() => {
    if (draftId) {
      setCurrentAppId(draftId);
      const loadDraft = async () => {
        try {
          const apps = await applicationService.getApplications();
          const draftApp = apps.find(a => a.id === draftId);
          if (draftApp) {
            if ((draftApp.currentStatus as string) !== 'Draft' && (draftApp.currentStatus as string) !== 'Regretted' && (draftApp.currentStatus as string) !== 'Returned') {
              setSubmittedApp(draftApp);
              return;
            }

            Object.keys(draftApp).forEach((key) => {
              setValue(key as any, (draftApp as any)[key]);
            });

            // Populate documents state
            const docs: any = {};
            if (draftApp.documents) {
              draftApp.documents.forEach((doc: any) => {
                docs[doc.documentType] = {
                  name: doc.fileName,
                  size: doc.fileSize,
                  base64: doc.filePath
                };
              });
            }
            setUploadedFiles(docs);
          }
        } catch (e) {
          toast.error('Failed to load draft application');
        }
      };
      loadDraft();
    }
  }, [draftId, setValue]);

  // Save Draft logic (both autosave and manual triggers)
  const saveDraftPayload = async (silent = false) => {
    const formData = getValues();
    const docsArray = Object.entries(uploadedFiles).map(([type, file]) => ({
      id: 'doc_' + Math.floor(Math.random() * 10000),
      documentType: type,
      fileName: file.name,
      fileSize: file.size,
      filePath: file.base64,
      verificationStatus: 'Pending' as const,
      uploadedAt: new Date().toISOString()
    }));

    const draftPayload = {
      ...formData,
      connectionTypeId: formData.connectionTypeId ? Number(formData.connectionTypeId) : undefined,
      currentStatus: 'Draft' as const,
      documents: docsArray
    };

    try {
      if (currentAppId) {
        const result = await applicationService.updateApplication(currentAppId, draftPayload as any);
        if (!silent) toast.success(`Draft ${result.applicationNumber} saved successfully.`);
      } else {
        const result = await applicationService.submitApplication(draftPayload as any);
        setCurrentAppId(result.id);
        setSearchParams({ id: result.id });
        if (!silent) toast.success(`Draft ${result.applicationNumber} initiated successfully.`);
      }
      setLastAutosaved(new Date().toLocaleTimeString());
    } catch (e) {
      if (!silent) console.error('Failed to save draft', e);
    }
  };

  // Auto save draft scheduler (every 30 seconds)
  useEffect(() => {
    if (submittedApp) return;

    const interval = setInterval(() => {
      saveDraftPayload(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [uploadedFiles, currentAppId, submittedApp]);

  // Stepper steps configuration
  const provisionalSteps = [
    { title: "1. Applicant's Details", icon: User },
    { title: "2. Address", icon: MapPin },
    { title: "3. Request Details", icon: Zap },
    { title: "4. Attachments", icon: Upload },
    { title: "5. Declaration", icon: Shield }
  ];

  const permanentLtSteps = [
    { title: "1. Personal", icon: User },
    { title: "2. Address", icon: MapPin },
    { title: "3. Supply", icon: Zap },
    { title: "4. Existing", icon: Home },
    { title: "5. Attachments", icon: Upload },
    { title: "6. Declaration", icon: Shield }
  ];

  const enhancementSteps = [
    { title: '1. Consumer Details', icon: User },
    { title: '2. Request Details', icon: Zap },
    { title: '3. Attachment(s)', icon: Upload }
  ];

  const disconnectionSteps = [
    { title: "1. Applicant's Details", icon: User },
    { title: "2. Connection Address", icon: MapPin },
    { title: "3. Request For", icon: Zap }
  ];

  const meterTestSteps = [
    { title: '1. Consumer Details', icon: User },
    { title: '2. Meter Details', icon: Zap },
    { title: '3. Reason for Testing', icon: FileText }
  ];

  const steps = isMeterTest
    ? meterTestSteps
    : isDisconnection
    ? disconnectionSteps
    : isCustomThreeStep
      ? enhancementSteps
      : isProvisional 
      ? provisionalSteps 
      : isPermanent 
        ? permanentLtSteps 
        : isTemporary 
          ? [
              { title: "1. Personal", icon: User },
              { title: "2. Address", icon: MapPin },
              { title: "3. Supply", icon: Zap },
              { title: "4. Existing", icon: Home },
              { title: "5. Attachments", icon: Upload },
              { title: "6. Declaration", icon: Shield }
            ]
          : isSeparate
            ? [
                { title: "1. Personal", icon: User },
                { title: "2. Address", icon: MapPin },
                { title: "3. Supply", icon: Zap },
                { title: "4. Existing", icon: Home },
                { title: "5. Attachments", icon: Upload },
                { title: "6. Declaration", icon: Shield }
              ]
            : [
                { title: 'Personal Details', icon: User },
                { title: 'Address Details', icon: MapPin },
                { title: 'Connection Details', icon: Zap },
                { title: 'Property Details', icon: Home },
                { title: 'Business Details', icon: FileText },
                { title: 'Document Upload', icon: Upload },
                { title: 'Declaration', icon: Shield },
                { title: 'Review & Submit', icon: CheckCircle2 }
              ];

  // Drag and Drop files upload handlers
  const handleDrag = (e: React.DragEvent, docType: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [docType]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, docType: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [docType]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(docType, e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(docType, file);
  };

  const processFile = (docType: string, file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Supported formats: PDF, JPG, PNG');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10 MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadstart = () => {
      setUploadProgress(prev => ({ ...prev, [docType]: 10 }));
    };
    reader.onprogress = (ev) => {
      if (ev.lengthComputable) {
        const percent = Math.round((ev.loaded / ev.total) * 100);
        setUploadProgress(prev => ({ ...prev, [docType]: percent }));
      }
    };
    reader.onload = () => {
      setUploadProgress(prev => {
        const copy = { ...prev };
        delete copy[docType];
        return copy;
      });
      setUploadedFiles(prev => ({
        ...prev,
        [docType]: {
          name: file.name,
          size: file.size,
          base64: reader.result as string
        }
      }));
      toast.success(`${docType} uploaded successfully.`);
    };
  };

  const handleFileDelete = (docType: string) => {
    setUploadedFiles(prev => {
      const copy = { ...prev };
      delete copy[docType];
      return copy;
    });
    toast.info(`${docType} removed.`);
  };

  // Validation checking prior to submission
  const validateForm = () => {
    const values = getValues();
    const errorsMap: { [key: string]: { message: string; step: number } } = {};

    if (isMeterTest) {
      if (!values.existingBpNo?.trim()) errorsMap['existingBpNo'] = { message: 'BP/Consumer No is required', step: 1 };
      if (!values.fullName?.trim()) errorsMap['fullName'] = { message: 'Consumer/Applicant name is required', step: 1 };
      if (!values.phoneNumber || values.phoneNumber.length < 8) errorsMap['phoneNumber'] = { message: 'Valid Phone/Mobile is required', step: 1 };
      if (!values.businessArea?.trim()) errorsMap['businessArea'] = { message: 'Business Area is required', step: 1 };
      if (!values.addressLine1?.trim()) errorsMap['addressLine1'] = { message: 'Address/Premises is required', step: 1 };

      setFormErrors(errorsMap);
      return errorsMap;
    }

    if (isDisconnection) {
      if (!values.businessArea?.trim()) errorsMap['businessArea'] = { message: 'Business Area is required', step: 1 };
      if (!values.existingBpNo?.trim()) errorsMap['existingBpNo'] = { message: 'BP/Consumer No is required', step: 1 };
      if (!values.ownerOrgName?.trim()) errorsMap['ownerOrgName'] = { message: 'Business Partner Name is required', step: 1 };
      if (!values.phoneNumber || values.phoneNumber.length < 8) errorsMap['phoneNumber'] = { message: 'Valid Contact Number is required', step: 1 };

      if (!values.addressLine1?.trim()) errorsMap['addressLine1'] = { message: 'Address Line 1 is required', step: 2 };
      if (!values.city?.trim()) errorsMap['city'] = { message: 'City is required', step: 2 };

      if (!values.loadRequirement) errorsMap['loadRequirement'] = { message: 'Reason for Disconnection is required', step: 3 };

      setFormErrors(errorsMap);
      return errorsMap;
    }

    if (isCustomThreeStep) {
      if (!values.businessArea?.trim()) errorsMap['businessArea'] = { message: 'Business Area is required', step: 1 };
      if (!values.existingBpNo?.trim()) errorsMap['existingBpNo'] = { message: 'BP/Consumer No is required', step: 1 };
      if (!values.fullName?.trim()) errorsMap['fullName'] = { message: 'Consumer/Applicant name is required', step: 1 };
      if (!values.ownerOrgName?.trim()) errorsMap['ownerOrgName'] = { message: 'Business Partner name is required', step: 1 };
      if (!values.phoneNumber || values.phoneNumber.length < 10) errorsMap['phoneNumber'] = { message: 'Valid Mobile number is required', step: 1 };
      if (!values.emailId?.trim()) errorsMap['emailId'] = { message: 'Email ID is required', step: 1 };
      if (!values.addressLine1?.trim()) errorsMap['addressLine1'] = { message: 'Premises supply address is required', step: 1 };

      if (isReduction) {
        if (!values.loadRequirement) errorsMap['loadRequirement'] = { message: 'Reduced Load requirement is required', step: 2 };
      } else if (isNameChange) {
        if (!values.relationshipName?.trim()) errorsMap['relationshipName'] = { message: 'Proposed New Name is required', step: 2 };
      } else if (isOwnershipTransfer) {
        if (!values.ownerOrgName?.trim()) errorsMap['ownerOrgName'] = { message: 'New Owner / Legal Heir Name is required', step: 2 };
      } else if (isCategoryChange) {
        if (!values.propertyType?.trim()) errorsMap['propertyType'] = { message: 'Proposed Category is required', step: 2 };
      } else {
        if (!values.loadRequirement) errorsMap['loadRequirement'] = { message: 'Additional Load requirement is required', step: 2 };
      }

      const requiredDocs = ['Identity Proof Document', 'Land Ownership Proof', 'Recent Utility Bill'];
      requiredDocs.forEach(docType => {
        if (!uploadedFiles[docType]) {
          errorsMap[docType] = { message: `${docType} upload is required`, step: 3 };
        }
      });

      setFormErrors(errorsMap);
      return errorsMap;
    }

    if (isProvisional) {
      // Step 1: Applicant's Details
      if (!values.businessArea?.trim()) errorsMap['businessArea'] = { message: 'Business Area is required', step: 1 };
      if (!values.fullName?.trim()) errorsMap['fullName'] = { message: 'Applicant Name is required', step: 1 };
      if (!values.relationshipName?.trim()) errorsMap['relationshipName'] = { message: "Relative Name is required", step: 1 };
      if (!values.phoneNumber || values.phoneNumber.length < 10) errorsMap['phoneNumber'] = { message: 'Valid Phone Number is required', step: 1 };
      if (!values.identityCardType) errorsMap['identityCardType'] = { message: 'Identity Proof Type is required', step: 1 };
      if (!values.identityCardNumber) errorsMap['identityCardNumber'] = { message: 'Identity Proof Number is required', step: 1 };
      
      // Step 1 documents
      if (!uploadedFiles['Passport Photo']) {
        errorsMap['Passport Photo'] = { message: 'Passport size photo of applicant is required', step: 1 };
      }

      // Step 2: Address
      if (!values.addressLine1?.trim()) errorsMap['addressLine1'] = { message: 'Address Line 1 is required', step: 2 };
      if (!values.city?.trim()) errorsMap['city'] = { message: 'City is required', step: 2 };
      if (!values.district?.trim()) errorsMap['district'] = { message: 'District is required', step: 2 };
      if (!values.pinCode || values.pinCode.length !== 6) errorsMap['pinCode'] = { message: 'Valid 6-digit Pincode is required', step: 2 };

      // Step 3: Request Details
      if (!values.loadRequirement) errorsMap['loadRequirement'] = { message: 'Load Requirement is required', step: 3 };
      if (!values.purposeOfConnection) errorsMap['purposeOfConnection'] = { message: 'Purpose of Connection is required', step: 3 };

      // Step 4: Attachments
      const requiredDocs = ['Land Ownership Proof', 'Identity Proof Document'];
      requiredDocs.forEach(docType => {
        if (!uploadedFiles[docType]) {
          errorsMap[docType] = { message: `${docType} upload is required`, step: 4 };
        }
      });

      // Step 5: Declaration
      if (!declarationChecked) {
        errorsMap['declaration'] = { message: 'You must accept the terms declaration', step: 5 };
      }

      setFormErrors(errorsMap);
      return errorsMap;
    }

    if (isPermanent || isTemporary || isSeparate) {
      // Step 1: Personal
      if (!values.businessArea?.trim()) errorsMap['businessArea'] = { message: 'Business Area is required', step: 1 };
      if (!values.ownerOrgName?.trim()) errorsMap['ownerOrgName'] = { message: 'Owner/Organization Name is required', step: 1 };
      if (!values.fullName?.trim()) errorsMap['fullName'] = { message: 'Applicant Name is required', step: 1 };
      if (!values.relationshipName?.trim()) errorsMap['relationshipName'] = { message: "Relative Name is required", step: 1 };
      if (!values.phoneNumber || values.phoneNumber.length < 10) errorsMap['phoneNumber'] = { message: 'Valid Phone Number is required', step: 1 };
      if (!values.emailId?.trim()) errorsMap['emailId'] = { message: 'Email Address is required', step: 1 };
      if (!values.identityCardType) errorsMap['identityCardType'] = { message: 'Identity Proof Type is required', step: 1 };
      if (!values.identityCardNumber) errorsMap['identityCardNumber'] = { message: 'Identity Proof Number is required', step: 1 };
      
      // Step 1 documents
      if (!uploadedFiles['Passport Photo']) {
        errorsMap['Passport Photo'] = { message: 'Passport size photo of applicant is required', step: 1 };
      }

      // Step 2: Address
      if (!values.addressLine1?.trim()) errorsMap['addressLine1'] = { message: 'Address Line 1 is required', step: 2 };
      if (!values.city?.trim()) errorsMap['city'] = { message: 'City is required', step: 2 };
      if (!values.district?.trim()) errorsMap['district'] = { message: 'District is required', step: 2 };
      if (!values.pinCode || values.pinCode.length !== 6) errorsMap['pinCode'] = { message: 'Valid 6-digit Pincode is required', step: 2 };

      // Step 3: Supply
      if (!values.loadRequirement) errorsMap['loadRequirement'] = { message: 'Load Requirement is required', step: 3 };
      if (!values.purposeOfConnection) errorsMap['purposeOfConnection'] = { message: 'Purpose of Connection is required', step: 3 };

      // Step 5: Attachments
      const requiredDocs = ['Land Ownership Proof', 'Identity Proof Document'];
      requiredDocs.forEach(docType => {
        if (!uploadedFiles[docType]) {
          errorsMap[docType] = { message: `${docType} upload is required`, step: 5 };
        }
      });

      // Step 6: Declaration
      if (!declarationChecked) {
        errorsMap['declaration'] = { message: 'You must accept the terms declaration', step: 6 };
      }

      setFormErrors(errorsMap);
      return errorsMap;
    }

    // Step 1: Personal Info
    if (!values.fullName?.trim()) errorsMap['fullName'] = { message: 'Applicant Name is required', step: 1 };
    if (!values.relationshipName?.trim()) errorsMap['relationshipName'] = { message: "Father's / Mother's Name is required", step: 1 };
    if (!values.dateOfBirth) errorsMap['dateOfBirth'] = { message: 'Date of Birth is required', step: 1 };
    if (!values.gender) errorsMap['gender'] = { message: 'Gender is required', step: 1 };
    if (!values.aadhaarNumber || values.aadhaarNumber.length !== 12) errorsMap['aadhaarNumber'] = { message: 'Valid 12-digit Aadhaar is required', step: 1 };
    if (!values.panNumber || values.panNumber.length !== 10) errorsMap['panNumber'] = { message: 'Valid 10-character PAN is required', step: 1 };
    if (!values.phoneNumber || values.phoneNumber.length < 10) errorsMap['phoneNumber'] = { message: 'Valid Mobile Number is required', step: 1 };
    if (!values.emailId?.trim()) errorsMap['emailId'] = { message: 'Email Address is required', step: 1 };
    if (!values.identityCardType) errorsMap['identityCardType'] = { message: 'Identity Proof Type is required', step: 1 };

    // Step 2: Address Details
    if (!values.houseNumber?.trim()) errorsMap['houseNumber'] = { message: 'House Number is required', step: 2 };
    if (!values.addressLine1?.trim()) errorsMap['addressLine1'] = { message: 'Street / Address Line 1 is required', step: 2 };
    if (!values.city?.trim()) errorsMap['city'] = { message: 'Village / City is required', step: 2 };
    if (!values.district?.trim()) errorsMap['district'] = { message: 'District is required', step: 2 };
    if (!values.state?.trim()) errorsMap['state'] = { message: 'State is required', step: 2 };
    if (!values.pinCode || values.pinCode.length !== 6) errorsMap['pinCode'] = { message: 'Valid 6-digit PIN Code is required', step: 2 };

    // Step 3: Connection Details
    if (!values.connectionTypeId) errorsMap['connectionTypeId'] = { message: 'Connection Type is required', step: 3 };
    if (!values.businessArea?.trim()) errorsMap['businessArea'] = { message: 'Business Area is required', step: 3 };
    if (!values.voltageRequirement) errorsMap['voltageRequirement'] = { message: 'Voltage Requirement is required', step: 3 };
    if (!values.loadRequirement) errorsMap['loadRequirement'] = { message: 'Load Requirement is required', step: 3 };
    if (!values.purposeOfConnection) errorsMap['purposeOfConnection'] = { message: 'Purpose of Connection is required', step: 3 };

    // Step 4: Property Details
    if (!values.propertyType?.trim()) errorsMap['propertyType'] = { message: 'Property Type is required', step: 4 };
    if (!values.ownershipType?.trim()) errorsMap['ownershipType'] = { message: 'Ownership Type is required', step: 4 };
    if (!values.plotNumber?.trim()) errorsMap['plotNumber'] = { message: 'Plot Number is required', step: 4 };
    if (!values.surveyNumber?.trim()) errorsMap['surveyNumber'] = { message: 'Survey Number is required', step: 4 };

    // Step 6: Documents
    const requiredDocs = ['Passport Size Photo', 'Aadhaar Card', 'PAN Card', 'Address Proof', 'Ownership Proof', 'Signature'];
    requiredDocs.forEach(docType => {
      if (!uploadedFiles[docType]) {
        errorsMap[docType] = { message: `${docType} upload is required`, step: 6 };
      }
    });

    // Step 7: Declaration
    if (!declarationChecked) {
      errorsMap['declaration'] = { message: 'You must accept the terms declaration', step: 7 };
    }

    setFormErrors(errorsMap);
    return errorsMap;
  };

  const handleStepNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'prev') {
      setCurrentStep(prev => Math.max(1, prev - 1));
    } else {
      setCurrentStep(prev => Math.min(steps.length, prev + 1));
    }
  };

  const onSubmit = async () => {
    const errorsMap = validateForm();
    if (Object.keys(errorsMap).length > 0) {
      // Find first error and jump to that step
      const firstError = Object.values(errorsMap)[0];
      setCurrentStep(firstError.step);
      toast.error('Validation failed. Please complete all highlighted fields.');
      return;
    }

    setIsSubmitting(true);
    const formData = getValues();
    const docsArray = Object.entries(uploadedFiles).map(([type, file]) => ({
      id: 'doc_' + Math.floor(Math.random() * 10000),
      documentType: type,
      fileName: file.name,
      fileSize: file.size,
      filePath: file.base64,
      verificationStatus: 'Pending' as const,
      uploadedAt: new Date().toISOString()
    }));

    const finalPayload = {
      ...formData,
      connectionTypeId: Number(formData.connectionTypeId),
      currentStatus: 'Submitted' as const,
      documents: docsArray
    };

    try {
      let result;
      if (currentAppId) {
        result = await applicationService.updateApplication(currentAppId, finalPayload as any);
      } else {
        result = await applicationService.submitApplication(finalPayload as any);
      }
      setSubmittedApp(result);
      toast.success('Connection Request Submitted successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Section status calculation
  const getStepStatus = (index: number) => {
    const stepNum = index + 1;
    const values = getValues();
    
    // Check if any errors belong to this step
    const hasError = Object.values(formErrors).some(err => err.step === stepNum);
    if (hasError) return 'Correction Required';

    if (isCustomThreeStep) {
      if (stepNum === 1) return values.fullName && values.existingBpNo && values.ownerOrgName ? 'Completed' : 'In Progress';
      if (stepNum === 2) {
        if (isReduction) return values.loadRequirement ? 'Completed' : 'In Progress';
        if (isNameChange) return values.relationshipName ? 'Completed' : 'In Progress';
        if (isOwnershipTransfer) return values.ownerOrgName ? 'Completed' : 'In Progress';
        if (isCategoryChange) return values.propertyType ? 'Completed' : 'In Progress';
        return values.loadRequirement ? 'Completed' : 'In Progress';
      }
      if (stepNum === 3) return Object.keys(uploadedFiles).length >= 3 ? 'Completed' : 'In Progress';
      return 'In Progress';
    }

    if (isProvisional) {
      if (stepNum === 1) return values.fullName && values.relationshipName ? 'Completed' : 'In Progress';
      if (stepNum === 2) return values.addressLine1 && values.pinCode ? 'Completed' : 'In Progress';
      if (stepNum === 3) return values.loadRequirement && values.purposeOfConnection ? 'Completed' : 'In Progress';
      if (stepNum === 4) return Object.keys(uploadedFiles).length > 0 ? 'Completed' : 'In Progress';
      if (stepNum === 5) return declarationChecked ? 'Completed' : 'In Progress';
      return 'In Progress';
    }

    if (isPermanent || isTemporary || isSeparate) {
      if (stepNum === 1) return values.fullName && values.relationshipName && values.ownerOrgName ? 'Completed' : 'In Progress';
      if (stepNum === 2) return values.addressLine1 && values.pinCode ? 'Completed' : 'In Progress';
      if (stepNum === 3) return values.loadRequirement && values.purposeOfConnection ? 'Completed' : 'In Progress';
      if (stepNum === 4) return 'Completed';
      if (stepNum === 5) return Object.keys(uploadedFiles).length > 0 ? 'Completed' : 'In Progress';
      if (stepNum === 6) return declarationChecked ? 'Completed' : 'In Progress';
      return 'In Progress';
    }

    if (stepNum === 1) {
      return values.fullName && values.relationshipName ? 'Completed' : 'In Progress';
    }
    if (stepNum === 2) {
      return values.houseNumber && values.pinCode ? 'Completed' : 'In Progress';
    }
    if (stepNum === 3) {
      return values.loadRequirement && values.purposeOfConnection ? 'Completed' : 'In Progress';
    }
    if (stepNum === 4) {
      return values.plotNumber && values.surveyNumber ? 'Completed' : 'In Progress';
    }
    if (stepNum === 5) {
      return values.vendorName ? 'Completed' : 'In Progress';
    }
    if (stepNum === 6) {
      return Object.keys(uploadedFiles).length >= 6 ? 'Completed' : 'In Progress';
    }
    if (stepNum === 7) {
      return declarationChecked ? 'Completed' : 'In Progress';
    }
    return 'In Progress';
  };

  const renderUploadSlot = (docType: string, description: string) => {
    const file = uploadedFiles[docType];
    const progress = uploadProgress[docType];
    const isDragActive = dragActive[docType];

    return (
      <div 
        className={`p-4 border border-dashed rounded-2xl flex flex-col space-y-3 transition ${
          isDragActive ? 'border-tata-blue bg-blue-50/10' : 'border-gray-250 dark:border-slate-700'
        }`}
        onDragEnter={(e) => handleDrag(e, docType)}
        onDragOver={(e) => handleDrag(e, docType)}
        onDragLeave={(e) => handleDrag(e, docType)}
        onDrop={(e) => handleDrop(e, docType)}
      >
        <div className="flex justify-between items-start">
          <div className="text-left">
            <span className="text-xs font-bold text-gray-800 dark:text-white block">{docType} *</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">{description}</span>
          </div>
          {file && (
            <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[9px] font-black uppercase flex items-center">
              <Check size={10} className="mr-0.5" /> Attached
            </span>
          )}
        </div>

        {file ? (
          <div className="flex items-center justify-between bg-gray-55/40 dark:bg-slate-900/50 p-2.5 rounded-xl border border-gray-100 dark:border-slate-700/50 text-xs">
            <div className="flex items-center space-x-2 truncate">
              <FileText size={16} className="text-[#005BAC] flex-shrink-0" />
              <span className="font-bold truncate text-[11px] text-gray-700 dark:text-gray-300" title={file.name}>{file.name}</span>
            </div>
            <button 
              type="button"
              onClick={() => handleFileDelete(docType)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 flex-shrink-0"
              title="Remove File"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : progress !== undefined ? (
          <div className="flex flex-col space-y-1.5 p-2 bg-white dark:bg-slate-800 rounded-lg">
            <div className="w-full bg-gray-100 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#005BAC] h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-[9px] text-gray-400 font-bold flex items-center justify-end"><RefreshCw size={10} className="mr-1 animate-spin" /> {progress}%</span>
          </div>
        ) : (
          <label className="w-full py-4 border border-dashed border-[#005BAC]/20 hover:border-[#005BAC] bg-gray-50/50 dark:bg-slate-900/10 hover:bg-[#005BAC]/5 text-[#005BAC] dark:text-tata-blue-light text-xs font-bold rounded-xl cursor-pointer transition flex flex-col items-center justify-center space-y-1">
            <Upload size={18} />
            <span>Browse or Drag file here</span>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf, .jpg, .png, .jpeg"
              onChange={(e) => handleFileUpload(docType, e)}
            />
          </label>
        )}
      </div>
    );
  };

  const handlePrintReceipt = (app: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocker is active. Please enable popups to print receipt.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Tata UISL Connection Receipt - ${app.applicationNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; line-height: 1.5; font-size: 13px; }
            .receipt-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
            .header { border-bottom: 2px solid #005BAC; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .logo-text { font-size: 16px; font-weight: 800; color: #005BAC; text-transform: uppercase; }
            .status-badge { background-color: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
            .title { font-size: 14px; font-weight: 800; color: #1e293b; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; text-align: center; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
            .field { display: flex; flex-direction: column; }
            .label { font-size: 10px; text-transform: uppercase; font-weight: bold; color: #94a3b8; margin-bottom: 4px; }
            .value { font-size: 12px; font-weight: bold; color: #334155; }
            .footer-note { border-top: 1px dashed #e2e8f0; margin-top: 25px; padding-top: 15px; font-size: 10px; color: #64748b; text-align: center; line-height: 1.4; }
            .print-btn-bar { display: flex; justify-content: center; margin-top: 20px; }
            .print-btn { background-color: #005BAC; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
            @media print {
              .print-btn-bar { display: none; }
              body { padding: 0; }
              .receipt-card { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <span class="logo-text">TATA Steel Utilities & Infrastructure</span>
              <span class="status-badge">Submitted</span>
            </div>
            <h3 class="title">Connection Registration Receipt</h3>
            <div class="grid">
              <div class="field">
                <span class="label">Applicant Name</span>
                <span class="value">${app.fullName || app.ownerOrgName || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Application Number</span>
                <span class="value" style="font-family: monospace;">${app.applicationNumber}</span>
              </div>
              <div class="field">
                <span class="label">Connection Type</span>
                <span class="value">${app.connectionTypeName || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Registration Date</span>
                <span class="value">${new Date(app.submittedDate).toLocaleDateString()}</span>
              </div>
              <div class="field">
                <span class="label">Volt / Load Spec</span>
                <span class="value">${app.voltageRequirement || 'N/A'} / ${app.loadRequirement || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Contact Number</span>
                <span class="value">${app.phoneNumber || 'N/A'}</span>
              </div>
            </div>
            <div class="footer-note">
              This is a system-generated utility request receipt. No manual signature is required. Your request has been queued for verification. Please keep a copy of this document for future reference.
            </div>
            <div class="print-btn-bar">
              <button class="print-btn" onclick="window.print()">Print This Receipt</button>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (submittedApp) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-150 dark:border-slate-700/60 shadow-lg text-center space-y-8">
        
        {/* Success header banner */}
        <div className="space-y-3">
          <div className="h-14 w-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Connection Form Submitted Successfully</h2>
          <p className="text-xs text-gray-455 max-w-sm mx-auto leading-relaxed">
            Your connection request has been forwarded to the Tata UISL Audit queue. Below is your official registration receipt.
          </p>
        </div>

        {/* Receipt Panel */}
        <div className="bg-gray-55/40 dark:bg-slate-900/30 p-6 rounded-2xl border border-gray-100 dark:border-slate-750 text-xs text-left space-y-4 font-medium leading-relaxed font-sans max-w-md mx-auto">
          <div className="border-b border-gray-200 dark:border-slate-700 pb-3 flex justify-between items-center">
            <h3 className="font-extrabold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider text-[10px]">Tata Steel Utilities & Infrastructure</h3>
            <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-[9px] font-black uppercase">Submitted</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] text-gray-400 block uppercase font-bold">Applicant Name</span>
              <span className="font-bold text-gray-800 dark:text-white text-[11px]">{submittedApp.fullName || submittedApp.ownerOrgName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-400 block uppercase font-bold">Application Number</span>
              <span className="font-bold text-gray-800 dark:text-white text-[11px] font-mono">{submittedApp.applicationNumber}</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-400 block uppercase font-bold">Connection Type</span>
              <span className="font-bold text-gray-800 dark:text-white text-[11px]">{submittedApp.connectionTypeName}</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-400 block uppercase font-bold">Registration Date</span>
              <span className="font-bold text-gray-800 dark:text-white text-[11px]">
                {new Date(submittedApp.submittedDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 justify-center">
          <button 
            onClick={() => handlePrintReceipt(submittedApp)}
            className="px-4 py-2.5 border border-gray-200 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            <Printer size={14} className="inline mr-2" /> Print Receipt
          </button>
          <button 
            onClick={() => navigate('/customer/applications')}
            className="px-5 py-2.5 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition"
          >
            Manage Applications
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-3.5 text-left text-slate-800 dark:text-slate-100">
      
      {isCustomThreeStep ? (
        <>
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-gray-150 dark:border-slate-700/50 flex justify-between items-center w-full animate-fadeIn">
            <div className="text-left">
              <h1 className="text-sm md:text-base font-extrabold text-gray-900 dark:text-white inline-flex items-center gap-1.5 flex-wrap">
                {isReduction && 'Load Reduction Request'}
                {isNameChange && 'Consumer Name Change Request'}
                {isOwnershipTransfer && 'Ownership Transfer Legal Heir Request'}
                {isCategoryChange && 'Change of Consumer Category'}
                {isEnhancement && 'Load Enhancement Request'}
                {isDisconnection && `Create ${divisionParam} Permanent Disconnection Request`}
                {isMeterTest && `Add Request For Testing Of Energy Meter Of${divisionParam} Connection`}
                <span className="text-[10px] text-red-500 font-bold ml-1 font-sans">(Mandatory Fields *)</span>
              </h1>
            </div>
            <button
              type="button"
              onClick={() => {
                const t = isReduction
                  ? 'Load Reduction Request'
                  : isNameChange
                    ? 'Consumer Name Change Request'
                    : isOwnershipTransfer
                      ? 'Ownership Transfer Legal Heir Request'
                      : isCategoryChange
                        ? 'Change of Consumer Category / Shifting of Premises / Shifting of Meter and Switch Requests'
                        : isDisconnection
                          ? 'Permanent Disconnection'
                          : isMeterTest
                            ? 'Energy Meter Testing'
                            : 'Load Enhancement Request';
                navigate(`/admin/applications?type=${encodeURIComponent(t)}`);
              }}
              className="flex items-center px-3 py-1.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg transition-all"
            >
              <ArrowLeft size={12} className="mr-1" /> Back
            </button>
          </div>

          {/* Connected Icon Stepper */}
          <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-gray-200 dark:border-slate-750 shadow-md mb-6">
            <div className="flex items-center justify-between max-w-3xl mx-auto px-4 relative">
              <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
              {steps.map((step, index) => {
                const stepNum = index + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;
                const StepIcon = getStepIcon(step.title, index);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentStep(stepNum)}
                    className="relative z-10 flex flex-col items-center group focus:outline-none cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#005BAC] text-white ring-4 ring-blue-100 dark:ring-blue-900/40 shadow-lg scale-110' 
                        : isCompleted 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'bg-white dark:bg-slate-800 text-gray-400 border-2 border-gray-200 dark:border-slate-700 hover:border-gray-300'
                    }`}>
                      {isCompleted ? <Check size={18} /> : <StepIcon size={18} />}
                    </div>
                    <span className={`text-[11px] font-bold mt-2 transition-colors text-center ${
                      isActive 
                        ? 'text-[#005BAC] dark:text-tata-blue-light font-extrabold' 
                        : isCompleted 
                          ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                          : 'text-gray-400 dark:text-slate-500'
                    }`}>
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content Box */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50">

            {/* Step 1: Consumer Details */}
            {currentStep === 1 && (
              isMeterTest ? (
                <div className="space-y-4 text-left animate-fadeIn">
                  {/* BP No / Consumer No */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="w-56 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">
                      BP No/Consumer No <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1 flex gap-2 max-w-lg">
                      <input
                        type="text"
                        {...register('existingBpNo')}
                        placeholder="Enter BP/Consumer Number"
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = getValues('existingBpNo');
                          if (!val) { toast.error('Please enter a BP/Consumer number'); return; }
                          setValue('fullName', 'Abhishek');
                          setValue('ownerOrgName', 'Abhishek');
                          setValue('phoneNumber', '8271039154');
                          setValue('emailId', 'abhishek.krgupta@yahoo.in');
                          setValue('surveyNumber', 'SRV-8291823');
                          setValue('vendorName', 'Tata Utilities Vendor');
                          setValue('vendorCertificateNumber', 'VND-CERT-90823');
                          setValue('addressLine1', '00002 L4 Type, Road No.2, JAMSHEDPUR Kadma Farm Area 831005');
                          setValue('businessArea', 'JAMSHEDPUR');
                          toast.success('Consumer record retrieved successfully!');
                        }}
                        className="px-4 py-1.5 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-[11px] font-bold rounded-lg transition-all"
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  {/* Service No */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="w-56 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">Service No</label>
                    <div className="flex-1">
                      <input
                        type="text"
                        {...register('surveyNumber')}
                        placeholder="Enter Service Number"
                        className="w-full max-w-lg px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                  </div>

                  {/* Vendor / Vendor Certificate Number */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                      <label className="w-56 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">Vendor</label>
                      <input
                        type="text"
                        {...register('vendorName')}
                        placeholder="Vendor Name"
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                      <label className="w-56 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">Vendor Certificate Number</label>
                      <input
                        type="text"
                        {...register('vendorCertificateNumber')}
                        placeholder="Certificate Number"
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                  </div>

                  {/* Name / Phone / Email */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1 text-left">
                        Name of Consumer / Applicant <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('fullName')}
                        placeholder="Consumer Name"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1 text-left">
                        Phone/Mobile <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('phoneNumber')}
                        placeholder="Mobile Number"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1 text-left">
                        Email ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        {...register('emailId')}
                        placeholder="Email Address"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                  </div>

                  {/* Business Area / Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1 text-left">
                        Business Area <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('businessArea')}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      >
                        <option value="">--Select Business Area--</option>
                        <option value="JAMSHEDPUR">Jamshedpur</option>
                        <option value="ADITYAPUR">Adityapur</option>
                        <option value="RANCHI">Ranchi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1 text-left">
                        Address/Premises where Electricity supplied <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('addressLine1')}
                        placeholder="Enter premises address"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : isDisconnection ? (
                <div className="space-y-4 text-left">
                  {/* Business Area */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="w-48 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">
                      Business Area <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1">
                      <select
                        {...register('businessArea')}
                        className="w-full max-w-lg px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      >
                        <option value="">--Select Business Area--</option>
                        <option value="JAMSHEDPUR">JAMSHEDPUR</option>
                        <option value="ADITYAPUR">ADITYAPUR</option>
                        <option value="RANCHI">RANCHI</option>
                      </select>
                    </div>
                  </div>

                  {/* BP Number */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="w-48 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">
                      Business Partner Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1 flex gap-2 max-w-lg">
                      <input
                        type="text"
                        {...register('existingBpNo')}
                        placeholder="BP No"
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = getValues('existingBpNo');
                          if (!val) {
                            toast.error('Please enter a BP/Consumer number');
                            return;
                          }
                          setValue('fullName', 'Abhishek');
                          setValue('ownerOrgName', 'Abhishek');
                          setValue('phoneNumber', '8271039154');
                          setValue('emailId', 'abhishek.krgupta@yahoo.in');
                          setValue('surveyNumber', 'SRV-8291823');
                          setValue('vendorName', 'Tata Utilities Vendor');
                          setValue('vendorCertificateNumber', 'VND-CERT-90823');
                          setValue('addressLine1', '00002 L4 Type, Road No.2');
                          setValue('addressLine2', 'JAMSHEDPUR Kadma Farm Area');
                          setValue('pinCode', '831005');
                          toast.success('Consumer record retrieved successfully!');
                        }}
                        className="px-4 py-1.5 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-[11px] font-bold rounded-lg transition-all"
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  {/* Service No */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="w-48 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">
                      Service No
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        {...register('surveyNumber')}
                        placeholder="Service No"
                        className="w-full max-w-lg px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                  </div>

                  {/* Business Partner Name */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="w-48 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">
                      Business Partner Name <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        {...register('ownerOrgName')}
                        placeholder="BP Name"
                        className="w-full max-w-lg px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                  </div>

                  {/* Meter Card Details Dropdown + Text Input */}
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="w-48 text-left">
                      <select
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      >
                        <option value="">-- Select --</option>
                        <option value="meter_no">Meter Number</option>
                        <option value="card_no">Meter Card Details</option>
                      </select>
                      <span className="text-red-500 font-bold text-[10px] block mt-1">*</span>
                    </div>
                    <div className="flex-1 max-w-lg">
                      <input
                        type="text"
                        placeholder="Energy Meter Card Details/Meter No."
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="w-48 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        {...register('phoneNumber')}
                        placeholder="Contact Number"
                        className="w-full max-w-lg px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Vendor */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="w-48 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">
                      Vendor
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        {...register('vendorName')}
                        placeholder="Vendor"
                        className="w-full max-w-lg px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                  </div>

                  {/* Vendor Certificate Number */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="w-48 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">
                      Vendor Certificate Number
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        {...register('vendorCertificateNumber')}
                        placeholder="Vendor Certificate Number"
                        className="w-full max-w-lg px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Business Area Row */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="w-48 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">
                      Business Area <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1">
                      <select
                        {...register('businessArea')}
                        className="w-full max-w-lg px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      >
                        <option value="">--Select Business Area--</option>
                        <option value="JAMSHEDPUR">JAMSHEDPUR</option>
                        <option value="ADITYAPUR">ADITYAPUR</option>
                        <option value="RANCHI">RANCHI</option>
                      </select>
                    </div>
                  </div>

                  {/* BP No / Consumer No Row */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="w-48 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">
                      BP No/Consumer No <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1 flex gap-2 max-w-lg">
                      <input
                        type="text"
                        {...register('existingBpNo')}
                        placeholder="Enter BP/Consumer Number"
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = getValues('existingBpNo');
                          if (!val) {
                            toast.error('Please enter a BP/Consumer number');
                            return;
                          }
                          // Pre-populate mock values when user clicks Search
                          setValue('fullName', 'Abhishek');
                          setValue('ownerOrgName', 'Abhishek'); // Business partner name
                          setValue('phoneNumber', '8271039154');
                          setValue('emailId', 'abhishek.krgupta@yahoo.in');
                          setValue('addressLine1', '00002 L4 Type, Road No.2 JAMSHEDPUR Kadma Farm Area 831005 INDIA');
                          toast.success('Consumer record retrieved successfully!');
                        }}
                        className="px-4 py-1.5 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-[11px] font-bold rounded-lg transition-all"
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  {/* Service No Row */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="w-48 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">
                      Service No
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        {...register('surveyNumber')}
                        placeholder="Enter Service Number"
                        className="w-full max-w-lg px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                  </div>

                  {/* Vendor Row */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                      <label className="w-48 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">
                        Vendor
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          {...register('vendorName')}
                          placeholder="Enter Vendor Name"
                          className="w-full max-w-xs px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                      <label className="w-48 text-[11px] font-bold text-gray-750 dark:text-gray-300 text-left">
                        Vendor Certificate Number
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          {...register('vendorCertificateNumber')}
                          placeholder="Enter Certificate Number"
                          className="w-full max-w-xs px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Four Column Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1 text-left">
                        Name of Consumer / Applicant <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('fullName')}
                        placeholder="Applicant Name"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1 text-left">
                        Name of Business Partner <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('ownerOrgName')}
                        placeholder="Business Partner Name"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1 text-left">
                        Phone/Mobile <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('phoneNumber')}
                        placeholder="Mobile Number"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1 text-left">
                        Email ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        {...register('emailId')}
                        placeholder="Email Address"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none font-sans"
                      />
                    </div>
                  </div>

                  {/* Existing Address Box */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1 text-left">
                      Existing Premises Supply Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('addressLine1')}
                      placeholder="Enter premises supply address"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none font-sans"
                    />
                  </div>
                </div>
              )
            )}

            {/* Step 2: Meter Details or Disconnection Address */}
            {currentStep === 2 && (
              isMeterTest ? (
                <div className="space-y-6 text-left animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Main Meter (Meter-1) */}
                    <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-gray-100 dark:border-slate-800 space-y-4">
                      <h3 className="text-xs font-bold text-[#4B3E9E] dark:text-indigo-300 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 pb-2">
                        Meter -1 (Main Meter)
                      </h3>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">Consumer Category</label>
                        <select {...register('propertyType')} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none">
                          <option value="LTDS">LTDS</option>
                          <option value="HT">HT</option>
                          <option value="LT Industrial">LT Industrial</option>
                          <option value="LT Commercial">LT Commercial</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">Meter Sl. No.</label>
                        <input type="text" {...register('surveyNumber')} placeholder="Main Meter Serial Number" className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none font-mono" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">Meter Make</label>
                        <input type="text" {...register('vendorName')} placeholder="e.g. Genus, Secure, HPL" className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">Meter Type</label>
                        <select {...register('voltageRequirement')} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none">
                          <option value="LT">1phasemain</option>
                          <option value="HT">3phase</option>
                          <option value="2Phase">2phase</option>
                        </select>
                      </div>
                    </div>

                    {/* Sub Meter (Meter-2) */}
                    <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-gray-100 dark:border-slate-800 space-y-4">
                      <h3 className="text-xs font-bold text-[#4B3E9E] dark:text-indigo-300 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 pb-2">
                        Meter-2 (Sub/Check Meter)
                      </h3>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">Consumer Category</label>
                        <select {...register('ownershipType')} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none">
                          <option value="LTDS">LTDS</option>
                          <option value="HT">HT</option>
                          <option value="LT Industrial">LT Industrial</option>
                          <option value="LT Commercial">LT Commercial</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">Meter Sl. No.</label>
                        <input type="text" {...register('plotNumber')} placeholder="Sub/Check Meter Serial Number" className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none font-mono" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">Meter Make</label>
                        <input type="text" {...register('vendorCertificateNumber')} placeholder="e.g. Secure, Genus, HPL" className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">Meter Type</label>
                        <select className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none">
                          <option value="1phaseSub">1phaseSub</option>
                          <option value="3phaseSub">3phaseSub</option>
                          <option value="2phaseSub">2phaseSub</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isDisconnection ? (
                <div className="space-y-4 text-left animate-fadeIn">
                  <h3 className="text-xs font-bold text-gray-750 dark:text-gray-300 uppercase tracking-wider mb-3">Permanent Disconnection Supply Address</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                        House No. / Flat No.
                      </label>
                      <input
                        type="text"
                        {...register('houseNumber')}
                        placeholder="House/Flat No."
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        {...register('landmark')}
                        placeholder="Landmark"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('addressLine1')}
                      placeholder="Address Line 1"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      {...register('addressLine2')}
                      placeholder="Address Line 2"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                        Pin Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('pinCode')}
                        placeholder="Pin Code"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                        City/Town <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('city')}
                        placeholder="City"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        {...register('district')}
                        placeholder="District"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        {...register('state')}
                        placeholder="State"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    {isReduction && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          Existing Load (kW) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          defaultValue="5.00"
                          className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold outline-none cursor-not-allowed"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          Reduced Load Requirement (kW) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register('loadRequirement')}
                          placeholder="e.g. 1.00, 2.00..."
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        />
                      </div>
                    </>
                  )}

                  {isNameChange && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          Existing Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          defaultValue="Abhishek"
                          className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold outline-none cursor-not-allowed"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          Proposed New Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register('relationshipName')}
                          placeholder="Enter Proposed Name"
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        />
                      </div>
                    </>
                  )}

                  {isOwnershipTransfer && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          Current Owner Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          defaultValue="Abhishek"
                          className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold outline-none cursor-not-allowed"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          New Owner / Legal Heir Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register('ownerOrgName')}
                          placeholder="Enter Legal Heir Name"
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        />
                      </div>
                    </>
                  )}

                  {isCategoryChange && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          Current Category <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          defaultValue="Domestic"
                          className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold outline-none cursor-not-allowed"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          Proposed Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register('propertyType')}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        >
                          <option value="Commercial">Commercial</option>
                          <option value="Industrial">Industrial</option>
                          <option value="Agricultural">Agricultural</option>
                          <option value="Domestic">Domestic</option>
                        </select>
                      </div>
                    </>
                  )}

                  {isEnhancement && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          Existing Load (kW) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          defaultValue="1.00"
                          className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold outline-none cursor-not-allowed"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          Additional Load Requirement (kW) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register('loadRequirement')}
                          placeholder="e.g. 1.00, 2.00..."
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        />
                      </div>
                    </>
                  )}

                </div>
              </div>
            )
          )}

            {/* Step 3: Attachment(s) or Disconnection Details or Meter Test Reason */}
            {currentStep === 3 && (
              isMeterTest ? (
                <div className="space-y-6 text-left animate-fadeIn">
                  <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-gray-100 dark:border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Reason for Meter Testing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          Reason for Test <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register('loadRequirement')}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        >
                          <option value="Burnt out">Burnt out</option>
                          <option value="Meter Stopped">Meter Stopped</option>
                          <option value="High Consumption">High Consumption / Suspected Fast Meter</option>
                          <option value="Meter Damaged">Meter Damaged / Tampered</option>
                          <option value="Meter Missing">Meter Missing / Stolen</option>
                          <option value="Consumer Request">Consumer Request for Accuracy Test</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">Requested Date</label>
                        <input
                          type="date"
                          {...register('dateOfBirth')}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Supporting Documents</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {renderUploadSlot('Identity Proof Document', 'Aadhaar Card, PAN Card, Voter ID')}
                      {renderUploadSlot('Recent Electricity Bill', 'Copy of the most recent bill')}
                      {renderUploadSlot('Meter Photograph', 'Clear photo showing meter display and seals')}
                    </div>
                  </div>
                </div>
              ) : isDisconnection ? (
                <div className="space-y-6 text-left animate-fadeIn">
                  <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-gray-100 dark:border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Disconnection Parameters</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          Reason for Disconnection <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register('loadRequirement')}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        >
                          <option value="Moving Premises">Moving Premises</option>
                          <option value="Property Sold">Property Sold</option>
                          <option value="High Bill Charges">High Bill Charges</option>
                          <option value="Meter Faulty/Not Required">Meter Faulty / Not Required</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          Requested Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          {...register('dateOfBirth')}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-750 dark:text-gray-300 mb-1">
                          Energy Meter Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register('gender')}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        >
                          <option value="Working">Working (Normal)</option>
                          <option value="Burnt">Burnt</option>
                          <option value="Stolen">Stolen</option>
                          <option value="Disputed">Disputed</option>
                          <option value="Missing">Missing</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Required Disconnection Attachments</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {renderUploadSlot('Identity Proof Document', 'Aadhaar Card, PAN Card, Voter ID')}
                      {renderUploadSlot('Land Ownership Proof', 'Ownership Deed, Rent Agreement, Tax Receipt')}
                      {renderUploadSlot('Recent Utility Bill', 'Copy of the most recent electricity bill')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 border-b border-gray-100 dark:border-slate-700/60 pb-2">Uploaded Documents</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {renderUploadSlot('Identity Proof Document', 'Aadhaar Card, PAN Card, Voter ID')}
                    {renderUploadSlot('Land Ownership Proof', 'Ownership Deed, Rent Agreement, Tax Receipt')}
                    {renderUploadSlot('Recent Utility Bill', 'Copy of the most recent electricity bill')}
                  </div>
                </div>
              )
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex justify-between items-center pt-5 mt-6 border-t border-gray-150 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => handleStepNavigation('prev')}
                disabled={currentStep === 1}
                className="px-5 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => handleStepNavigation('next')}
                  className="px-6 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw size={12} className="animate-spin" />}
                  Submit Request
                </button>
              )}
            </div>

          </div>
        </>
      ) : isProvisional ? (
        <>
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-gray-150 dark:border-slate-700/50 flex justify-between items-center w-full">
            <div className="text-left">
              <h1 className="text-sm md:text-base font-extrabold text-gray-900 dark:text-white inline-flex items-center gap-1.5 flex-wrap">
                Create Provisional {divisionParam} Connection Request
                <span className="text-[10px] text-red-500 font-bold ml-1 font-sans">(Mandatory Fields *)</span>
              </h1>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/applications?type=Provisional Connection')}
              className="flex items-center px-3 py-1.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg transition-all"
            >
              <ArrowLeft size={12} className="mr-1" /> Back
            </button>
          </div>

          {/* Connected Icon Stepper */}
          <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-gray-200 dark:border-slate-750 shadow-md mb-6">
            <div className="flex items-center justify-between max-w-4xl mx-auto px-4 relative">
              <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
              {provisionalSteps.map((step, index) => {
                const stepNum = index + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;
                const StepIcon = getStepIcon(step.title, index);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentStep(stepNum)}
                    className="relative z-10 flex flex-col items-center group focus:outline-none cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#005BAC] text-white ring-4 ring-blue-100 dark:ring-blue-900/40 shadow-lg scale-110' 
                        : isCompleted 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'bg-white dark:bg-slate-800 text-gray-400 border-2 border-gray-200 dark:border-slate-700 hover:border-gray-300'
                    }`}>
                      {isCompleted ? <Check size={18} /> : <StepIcon size={18} />}
                    </div>
                    <span className={`text-[11px] font-bold mt-2 transition-colors text-center ${
                      isActive 
                        ? 'text-[#005BAC] dark:text-tata-blue-light font-extrabold' 
                        : isCompleted 
                          ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                          : 'text-gray-400 dark:text-slate-500'
                    }`}>
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content Box */}
          <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50">
            {currentStep === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3 text-left">
                {/* Left Column */}
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Business Area <span className="text-red-500">*</span></label>
                    <select
                      {...register('businessArea')}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      required
                    >
                      <option value="">--Select Business Area--</option>
                      <option value="JAMSHEDPUR">JAMSHEDPUR</option>
                      <option value="ADITYAPUR">ADITYAPUR</option>
                      <option value="RANCHI">RANCHI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Name of the Applicant <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      {...register('fullName')}
                      placeholder="Name of the Applicant"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/3">
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Relation <span className="text-red-500">*</span></label>
                      <select
                        {...register('relationshipType')}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-255 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Husband">Husband</option>
                      </select>
                    </div>
                    <div className="w-2/3">
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Relative's Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        {...register('relationshipName')}
                        placeholder="Relative Name"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-255 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Identity Card <span className="text-red-500">*</span></label>
                      <select
                        {...register('identityCardType')}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-255 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        required
                      >
                        <option value="">--Select Identity Card--</option>
                        <option value="Aadhaar Card">Aadhar No</option>
                        <option value="PAN Card">Pan No</option>
                        <option value="Voter ID">Voter ID No</option>
                      </select>
                    </div>
                    <div className="w-1/2">
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Identity Card No <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        {...register('identityCardNumber')}
                        placeholder="Aadhar No/PAN/Voter ID"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-255 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      {...register('phoneNumber')}
                      placeholder="Phone Number"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-255 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Alternate Phone Number</label>
                    <input
                      type="text"
                      {...register('alternatePhoneNumber')}
                      placeholder="Alternate Phone Number"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-255 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Email Id</label>
                    <input
                      type="email"
                      {...register('emailId')}
                      placeholder="Email Id"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-255 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Alternate Email Id</label>
                    <input
                      type="email"
                      {...register('alternateEmailId')}
                      placeholder="Alternate Email Id"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-255 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50/70 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-3 text-left">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                        Premises Photo <span className="text-[10px] text-red-500 font-bold">(Size 14x8 cm)</span>
                      </label>
                      <span className="text-[11px] text-gray-400 block truncate mt-0.5">
                        {uploadedFiles['Photo of Premises']?.name || 'No file chosen'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload('Photo of Premises', e)}
                        className="hidden"
                        id="file-premises"
                        accept="image/*,application/pdf"
                      />
                      <label
                        htmlFor="file-premises"
                        className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition whitespace-nowrap flex items-center space-x-1.5"
                      >
                        <Upload size={13} />
                        <span>Choose File</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50/70 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-3 text-left">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                        Passport Photo <span className="text-red-500 font-bold">*</span>
                      </label>
                      <span className="text-[11px] text-gray-400 block truncate mt-0.5">
                        {uploadedFiles['Passport Photo']?.name || 'No file chosen'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload('Passport Photo', e)}
                        className="hidden"
                        id="file-passport"
                        accept="image/*,application/pdf"
                      />
                      <label
                        htmlFor="file-passport"
                        className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition whitespace-nowrap flex items-center space-x-1.5"
                      >
                        <Upload size={13} />
                        <span>Choose File</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50/70 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-3 text-left">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                        Aadhaar Document <span className="text-[10px] text-gray-400 font-medium">(Optional)</span>
                      </label>
                      <span className="text-[11px] text-gray-400 block truncate mt-0.5">
                        {uploadedFiles['Aadhaar Card']?.name || 'No file chosen'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload('Aadhaar Card', e)}
                        className="hidden"
                        id="file-aadhar"
                        accept="image/*,application/pdf"
                      />
                      <label
                        htmlFor="file-aadhar"
                        className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition whitespace-nowrap flex items-center space-x-1.5"
                      >
                        <Upload size={13} />
                        <span>Choose File</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-slate-900/30 rounded-xl border border-gray-200 dark:border-slate-750 flex flex-col gap-2">
                    <label className="block text-[11px] font-black text-gray-800 dark:text-gray-200">Vendor Details</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          {...register('vendorName')}
                          placeholder="Vendor Name"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md text-[11px] font-semibold outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          {...register('vendorCertificateNumber')}
                          placeholder="Cert. Number"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md text-[11px] font-semibold outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3 text-left animate-fadeIn">
                <h3 className="text-xs font-bold text-[#4B3E9E] border-b pb-1">2. Premises Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">House Number / Flat No</label>
                    <input type="text" {...register('houseNumber')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" placeholder="House/Flat No" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Address Line 1 *</label>
                    <input type="text" {...register('addressLine1')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" placeholder="Address Line 1" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Address Line 2</label>
                    <input type="text" {...register('addressLine2')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" placeholder="Address Line 2" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">City / Town *</label>
                    <input type="text" {...register('city')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">District *</label>
                    <input type="text" {...register('district')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Pincode *</label>
                    <input type="text" {...register('pinCode')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" placeholder="6-digit Pincode" required />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3 text-left animate-fadeIn">
                <h3 className="text-xs font-bold text-[#4B3E9E] border-b pb-1">3. Request & Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Application Type</label>
                    <input type="text" {...register('applicationType')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-gray-55 dark:bg-slate-900 dark:text-white outline-none" readOnly />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Voltage Requirement *</label>
                    <select {...register('voltageRequirement')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none">
                      <option value="LT">LT Connection</option>
                      <option value="HT">HT Connection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Load Requirement (in kW/HP) *</label>
                    <input type="text" {...register('loadRequirement')} placeholder="e.g. 5 kW" className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Purpose of Connection *</label>
                    <select {...register('purposeOfConnection')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none">
                      <option value="Domestic">Domestic</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Property Type</label>
                    <select {...register('propertyType')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none">
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial Property</option>
                      <option value="Industrial">Industrial Property</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Plot Number</label>
                    <input type="text" {...register('plotNumber')} placeholder="Plot Number" className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-3 text-left animate-fadeIn">
                <h3 className="text-xs font-bold text-[#4B3E9E] border-b pb-1">4. Additional Attachments</h3>
                <p className="text-[11px] text-gray-400">Please upload the required proof documents below. Valid formats: PDF, JPG, PNG up to 10MB.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {['Land Ownership Proof', 'Identity Proof Document', 'Recent Utility Bill'].map((docType) => (
                    <div key={docType} className="p-3 bg-gray-50/70 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700 flex justify-between items-center text-xs">
                      <div className="text-left max-w-[70%]">
                        <span className="block font-bold text-gray-700 dark:text-gray-200 truncate">{docType} *</span>
                        <span className="text-[11px] text-gray-400 block mt-0.5 truncate">
                          {uploadedFiles[docType]?.name || 'No file chosen'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload(docType, e)}
                          className="hidden"
                          id={`file-${docType}`}
                          accept="image/*,application/pdf"
                        />
                        <label
                          htmlFor={`file-${docType}`}
                          className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition whitespace-nowrap flex items-center space-x-1.5"
                        >
                          <Upload size={13} />
                          <span>Choose File</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-3 text-left animate-fadeIn">
                <h3 className="text-xs font-bold text-[#4B3E9E] border-b pb-1">5. Self Declaration</h3>
                <div className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={declarationChecked}
                      onChange={(e) => setDeclarationChecked(e.target.checked)}
                      className="rounded text-[#4B3E9E] focus:ring-[#4B3E9E] h-4 w-4 mt-0.5 cursor-pointer"
                      id="dec-chk"
                    />
                    <label htmlFor="dec-chk" className="text-xs text-gray-650 dark:text-gray-350 leading-relaxed font-semibold cursor-pointer select-none">
                      I hereby declare that all the information furnished by me in this application is true, correct, and complete to the best of my knowledge. I agree to abide by the terms, conditions, and regulations of Tata UISL.
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!declarationChecked || isSubmitting}
                    onClick={onSubmit}
                    className={`px-6 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-black rounded-lg shadow transition flex items-center space-x-2 ${
                      (!declarationChecked || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <span>Submit Request</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Stepper Footer Controls matching Reference Image 2 */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-150 dark:border-slate-750">
              <div>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                ) : <div />}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => saveDraftPayload(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Save Draft
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="px-6 py-2.5 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!declarationChecked || isSubmitting}
                    onClick={onSubmit}
                    className={`px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                      (!declarationChecked || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      ) : isSixStep ? (
        <>
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-gray-150 dark:border-slate-700/50 flex justify-between items-center w-full">
            <div className="text-left">
              <h1 className="text-sm md:text-base font-extrabold text-gray-900 dark:text-white inline-flex items-center gap-1.5 flex-wrap">
                Create {isSeparate ? 'Separate' : (isTemporary ? 'Temporary' : `Permanent ${isPermanentLt ? 'LT' : 'HT'}`)} {divisionParam} Connection Request
                <span className="text-[10px] text-red-500 font-bold ml-1 font-sans">(Mandatory Fields *)</span>
              </h1>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/applications?type=' + (isSeparate ? 'Separate Connection' : (isTemporary ? 'Temporary Connection' : (isPermanentLt ? 'Permanent LT Connection' : 'Permanent HT Connection'))))}
              className="flex items-center px-3 py-1.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg transition-all"
            >
              <ArrowLeft size={12} className="mr-1" /> Back
            </button>
          </div>

          {/* Connected Icon Stepper */}
          <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-gray-200 dark:border-slate-750 shadow-md mb-6">
            <div className="flex items-center justify-between max-w-4xl mx-auto px-4 relative">
              <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
              {permanentLtSteps.map((step, index) => {
                const stepNum = index + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;
                const StepIcon = getStepIcon(step.title, index);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentStep(stepNum)}
                    className="relative z-10 flex flex-col items-center group focus:outline-none cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#005BAC] text-white ring-4 ring-blue-100 dark:ring-blue-900/40 shadow-lg scale-110' 
                        : isCompleted 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'bg-white dark:bg-slate-800 text-gray-400 border-2 border-gray-200 dark:border-slate-700 hover:border-gray-300'
                    }`}>
                      {isCompleted ? <Check size={18} /> : <StepIcon size={18} />}
                    </div>
                    <span className={`text-[11px] font-bold mt-2 transition-colors text-center ${
                      isActive 
                        ? 'text-[#005BAC] dark:text-tata-blue-light font-extrabold' 
                        : isCompleted 
                          ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                          : 'text-gray-400 dark:text-slate-500'
                    }`}>
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content Box */}
          <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50">
            {currentStep === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3 text-left">
                {/* Left Column */}
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">
                      Business Area <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['JAMSHEDPUR', 'ADITYAPUR', 'RANCHI'].map(area => {
                        const isSelected = watch('businessArea') === area;
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => setValue('businessArea', area)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-[#005BAC] dark:text-tata-blue-light border-[#005BAC] ring-2 ring-[#005BAC]/20 shadow-xs'
                                : 'bg-gray-50/70 dark:bg-slate-900/40 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <MapPin size={13} />
                            <span>{area}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Owner / Organization Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      {...register('ownerOrgName')}
                      placeholder="Enter Owner or Organization Name"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] transition-all shadow-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Name of the Applicant <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      {...register('fullName')}
                      placeholder="Full Name of the Applicant"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] transition-all shadow-xs"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="w-1/3">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Relation <span className="text-red-500">*</span></label>
                      <select
                        {...register('relationshipType')}
                        className="w-full px-3 py-2.5 bg-gray-50/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] transition-all shadow-xs"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Husband">Husband</option>
                      </select>
                    </div>
                    <div className="w-2/3">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Relative's Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        {...register('relationshipName')}
                        placeholder="Relative's Name"
                        className="w-full px-3.5 py-2.5 bg-gray-50/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] transition-all shadow-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">
                      Identity Proof Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'Aadhaar Card', label: 'Aadhaar Card' },
                        { id: 'PAN Card', label: 'PAN Card' },
                        { id: 'Voter ID', label: 'Voter ID' }
                      ].map(idCard => {
                        const isSelected = watch('identityCardType') === idCard.id;
                        return (
                          <button
                            key={idCard.id}
                            type="button"
                            onClick={() => setValue('identityCardType', idCard.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-[#005BAC] dark:text-tata-blue-light border-[#005BAC] ring-2 ring-[#005BAC]/20 shadow-xs'
                                : 'bg-gray-50/70 dark:bg-slate-900/40 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <FileText size={13} />
                            <span>{idCard.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Identity Card Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      {...register('identityCardNumber')}
                      placeholder="Enter Aadhaar / PAN / Voter ID Number"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] transition-all shadow-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      {...register('phoneNumber')}
                      placeholder="Phone Number"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-255 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Alternate Phone Number</label>
                    <input
                      type="text"
                      {...register('alternatePhoneNumber')}
                      placeholder="Alternate Phone Number"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-255 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Email Id <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      {...register('emailId')}
                      placeholder="Email Id"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-255 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Alternate Email Id</label>
                    <input
                      type="email"
                      {...register('alternateEmailId')}
                      placeholder="Alternate Email Id"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-255 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50/70 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-3 text-left">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                        Premises Photo <span className="text-[10px] text-red-500 font-bold">(Size 14x8 cm)</span>
                      </label>
                      <span className="text-[11px] text-gray-400 block truncate mt-0.5">
                        {uploadedFiles['Photo of Premises']?.name || 'No file chosen'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload('Photo of Premises', e)}
                        className="hidden"
                        id="file-premises-lt"
                        accept="image/*,application/pdf"
                      />
                      <label
                        htmlFor="file-premises-lt"
                        className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition whitespace-nowrap flex items-center space-x-1.5"
                      >
                        <Upload size={13} />
                        <span>Choose File</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50/70 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-3 text-left">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                        Passport Photo <span className="text-red-500 font-bold">*</span>
                      </label>
                      <span className="text-[11px] text-gray-400 block truncate mt-0.5">
                        {uploadedFiles['Passport Photo']?.name || 'No file chosen'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload('Passport Photo', e)}
                        className="hidden"
                        id="file-passport-lt"
                        accept="image/*,application/pdf"
                      />
                      <label
                        htmlFor="file-passport-lt"
                        className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition whitespace-nowrap flex items-center space-x-1.5"
                      >
                        <Upload size={13} />
                        <span>Choose File</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50/70 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-3 text-left">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                        Aadhaar Document <span className="text-[10px] text-gray-400 font-medium">(Optional)</span>
                      </label>
                      <span className="text-[11px] text-gray-400 block truncate mt-0.5">
                        {uploadedFiles['Aadhaar Card']?.name || 'No file chosen'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload('Aadhaar Card', e)}
                        className="hidden"
                        id="file-aadhar-lt"
                        accept="image/*,application/pdf"
                      />
                      <label
                        htmlFor="file-aadhar-lt"
                        className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition whitespace-nowrap flex items-center space-x-1.5"
                      >
                        <Upload size={13} />
                        <span>Choose File</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-slate-900/30 rounded-xl border border-gray-200 dark:border-slate-750 flex flex-col gap-2">
                    <label className="block text-[11px] font-black text-gray-800 dark:text-gray-200">Vendor Details</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          {...register('vendorName')}
                          placeholder="Vendor Name"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md text-[11px] font-semibold outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          {...register('vendorCertificateNumber')}
                          placeholder="Cert. Number"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md text-[11px] font-semibold outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3 text-left animate-fadeIn">
                <h3 className="text-xs font-bold text-[#4B3E9E] border-b pb-1">2. Premises Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">House Number / Flat No</label>
                    <input type="text" {...register('houseNumber')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" placeholder="House/Flat No" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Address Line 1 *</label>
                    <input type="text" {...register('addressLine1')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" placeholder="Address Line 1" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Address Line 2</label>
                    <input type="text" {...register('addressLine2')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" placeholder="Address Line 2" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">City / Town *</label>
                    <input type="text" {...register('city')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">District *</label>
                    <input type="text" {...register('district')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Pincode *</label>
                    <input type="text" {...register('pinCode')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" placeholder="6-digit Pincode" required />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3 text-left animate-fadeIn">
                <h3 className="text-xs font-bold text-[#4B3E9E] border-b pb-1">3. Supply Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Application Type</label>
                    <input type="text" {...register('applicationType')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-gray-55 dark:bg-slate-900 dark:text-white outline-none" readOnly />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Voltage Requirement *</label>
                    <select {...register('voltageRequirement')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none">
                      <option value="LT">LT Connection</option>
                      <option value="HT">HT Connection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Load Requirement (in kW/HP) *</label>
                    <input type="text" {...register('loadRequirement')} placeholder="e.g. 5 kW" className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Purpose of Connection *</label>
                    <select {...register('purposeOfConnection')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none">
                      <option value="Domestic">Domestic</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Property Type</label>
                    <select {...register('propertyType')} className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none">
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial Property</option>
                      <option value="Industrial">Industrial Property</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Plot Number</label>
                    <input type="text" {...register('plotNumber')} placeholder="Plot Number" className="w-full px-3 py-1.5 border dark:border-slate-700 rounded-md text-[11px] bg-white dark:bg-slate-900 dark:text-white outline-none" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-3 text-left animate-fadeIn">
                <h3 className="text-xs font-bold text-[#4B3E9E] border-b pb-1">4. Existing Connection Details</h3>
                <p className="text-[11px] text-gray-400">Do you have any existing BP connection at this premises?</p>
                
                <div className="space-y-3 p-3.5 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 text-xs font-bold text-gray-800 dark:text-white cursor-pointer">
                      <input
                        type="radio"
                        checked={createNewBp === true}
                        onChange={() => setValue('createNewBp', true)}
                        className="text-[#4B3E9E] focus:ring-[#4B3E9E] h-4 w-4"
                      />
                      <span>Create New BP (Business Partner)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs font-bold text-gray-800 dark:text-white cursor-pointer">
                      <input
                        type="radio"
                        checked={createNewBp === false}
                        onChange={() => setValue('createNewBp', false)}
                        className="text-[#4B3E9E] focus:ring-[#4B3E9E] h-4 w-4"
                      />
                      <span>Use Existing BP Number</span>
                    </label>
                  </div>

                  {!createNewBp && (
                    <div className="animate-fadeIn space-y-1.5 mt-2 max-w-sm">
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300">Existing BP / Consumer Number <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        {...register('existingBpNo')}
                        placeholder="Enter 10-digit BP Number"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-3 text-left animate-fadeIn">
                <h3 className="text-xs font-bold text-[#4B3E9E] border-b pb-1">5. Attachments</h3>
                <p className="text-[11px] text-gray-400">Please upload the required proof documents below. Valid formats: PDF, JPG, PNG up to 10MB.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {['Land Ownership Proof', 'Identity Proof Document', 'Recent Utility Bill'].map((docType) => (
                    <div key={docType} className="p-3 bg-gray-50/70 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700 flex justify-between items-center text-xs">
                      <div className="text-left max-w-[70%]">
                        <span className="block font-bold text-gray-700 dark:text-gray-200 truncate">{docType} *</span>
                        <span className="text-[11px] text-gray-400 block mt-0.5 truncate">
                          {uploadedFiles[docType]?.name || 'No file chosen'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload(docType, e)}
                          className="hidden"
                          id={`file-${docType}-lt`}
                          accept="image/*,application/pdf"
                        />
                        <label
                          htmlFor={`file-${docType}-lt`}
                          className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition whitespace-nowrap flex items-center space-x-1.5"
                        >
                          <Upload size={13} />
                          <span>Choose File</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-3 text-left animate-fadeIn">
                <h3 className="text-xs font-bold text-[#4B3E9E] border-b pb-1">6. Self Declaration</h3>
                <div className="p-3 bg-gray-55 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={declarationChecked}
                      onChange={(e) => setDeclarationChecked(e.target.checked)}
                      className="rounded text-[#4B3E9E] focus:ring-[#4B3E9E] h-4 w-4 mt-0.5 cursor-pointer"
                      id="dec-chk-lt"
                    />
                    <label htmlFor="dec-chk-lt" className="text-xs text-gray-650 dark:text-gray-350 leading-relaxed font-semibold cursor-pointer select-none">
                      I hereby declare that all the information furnished by me in this application is true, correct, and complete to the best of my knowledge. I agree to abide by the terms, conditions, and regulations of Tata UISL.
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!declarationChecked || isSubmitting}
                    onClick={onSubmit}
                    className={`px-6 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-black rounded-lg shadow transition flex items-center space-x-2 ${
                      (!declarationChecked || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <span>Submit Request</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Stepper Footer Controls */}
            <div className="flex justify-end items-center mt-4 pt-3 border-t border-gray-150 dark:border-slate-700 gap-3">
              
              {/* Save As Draft */}
              <button
                type="button"
                onClick={() => saveDraftPayload(false)}
                className="px-4 py-2 bg-[#FFB800] hover:bg-[#e6a600] text-slate-900 text-xs font-black rounded-xl shadow-sm transition-all"
              >
                Save As Draft
              </button>

              {/* Previous */}
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-4 py-2 bg-[#A0AEC0] hover:bg-[#8a9ba8] text-slate-900 text-xs font-black rounded-xl shadow-sm transition-all"
                >
                  Previous
                </button>
              )}

              {/* Next / Submit */}
              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-5 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-black rounded-xl shadow-sm transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!declarationChecked || isSubmitting}
                  onClick={onSubmit}
                  className={`px-5 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-black rounded-xl shadow-sm transition-all ${
                    (!declarationChecked || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Upper header */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white">Connection Service Form</h1>
          <p className="text-xs text-gray-400 mt-1">Complete all sections of the application form. You can save your draft progress at any time.</p>
        </div>

        <div className="flex items-center space-x-4">
          {lastAutosaved && (
            <span className="text-[10px] text-gray-400 font-bold italic">
              Auto Saved: {lastAutosaved}
            </span>
          )}
          <button
            type="button"
            onClick={() => saveDraftPayload(false)}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            Save as Draft
          </button>
        </div>
      </div>

      {/* Stepper progress indicator with clickable tabs */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50 flex flex-wrap gap-4 justify-between items-center">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const stepNum = index + 1;
          const isActive = currentStep === stepNum;
          
          const stepStatus = getStepStatus(index);

          let statusBadgeClass = 'bg-gray-100 text-gray-450 dark:bg-slate-750 dark:text-slate-500';
          if (stepStatus === 'Completed') {
            statusBadgeClass = 'bg-green-100 text-green-600 dark:bg-green-950/20 dark:text-green-400';
          } else if (stepStatus === 'Correction Required') {
            statusBadgeClass = 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400';
          }

          return (
            <button 
              key={index} 
              type="button"
              onClick={() => setCurrentStep(stepNum)}
              className="flex items-center space-x-2 flex-shrink-0 mx-2 hover:opacity-85 transition outline-none"
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                isActive 
                  ? 'bg-[#005BAC] text-white shadow-md' 
                  : statusBadgeClass
              }`}>
                {StepIcon ? <StepIcon size={14} /> : stepNum}
              </div>
              <div className="flex flex-col items-start hidden md:flex text-left">
                <span className={`text-[11px] font-bold ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-450'}`}>
                  {step.title}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">{stepStatus}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Error Summary Alert banner */}
      {Object.keys(formErrors).length > 0 && (
        <div className="bg-red-50 border border-red-100 dark:bg-red-950/15 dark:border-red-900/30 p-4 rounded-2xl flex items-start space-x-3 text-xs text-red-700 dark:text-red-400">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="font-extrabold">Form validation failed. Please check the following sections:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {Object.entries(formErrors).map(([key, err]) => (
                <li key={key}>Section {err.step}: {err.message}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Form sections contents */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-150 dark:border-slate-700/50">
        
        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider border-b pb-2 flex items-center">
              <User size={16} className="mr-2" /> Section 1: Personal Details
            </h3>

            {/* Create BP checkbox option */}
            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-150 dark:border-slate-750 flex items-center justify-between">
              <div className="text-left space-y-0.5">
                <span className="text-xs font-bold text-gray-800 dark:text-white">Create New BP Profile?</span>
                <span className="text-[10px] text-gray-400 block">Check this if you do not have an existing Business Partner contract.</span>
              </div>
              <input 
                type="checkbox"
                {...register('createNewBp')}
                className="rounded text-tata-blue focus:ring-tata-blue h-4 w-4"
              />
            </div>

            {!createNewBp && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Existing BP Number *</label>
                <input 
                  type="text"
                  {...register('existingBpNo')}
                  placeholder="Enter your 10-digit BP Number"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Applicant Full Name *</label>
                <input 
                  type="text"
                  {...register('fullName')}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Relation</label>
                  <select 
                    {...register('relationshipType')}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Relative's Name *</label>
                  <input 
                    type="text"
                    {...register('relationshipName')}
                    placeholder="Relative full name"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Date of Birth *</label>
                <input 
                  type="date"
                  {...register('dateOfBirth')}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Gender *</label>
                <select 
                  {...register('gender')}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Identity Proof Type *</label>
                <select 
                  {...register('identityCardType')}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Aadhaar Number *</label>
                <input 
                  type="text"
                  maxLength={12}
                  {...register('aadhaarNumber')}
                  placeholder="12-digit number"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">PAN Number *</label>
                <input 
                  type="text"
                  maxLength={10}
                  {...register('panNumber')}
                  placeholder="10-character code"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mobile Number *</label>
                <input 
                  type="text"
                  {...register('phoneNumber')}
                  placeholder="10-digit mobile"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Alternate Mobile Number</label>
                <input 
                  type="text"
                  {...register('alternatePhoneNumber')}
                  placeholder="Optional alternate mobile"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address *</label>
                <input 
                  type="email"
                  {...register('emailId')}
                  placeholder="example@email.com"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Alternate Email Address</label>
                <input 
                  type="email"
                  {...register('alternateEmailId')}
                  placeholder="Optional alternate email"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: Address Details */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider border-b pb-2 flex items-center">
              <MapPin size={16} className="mr-2" /> Section 2: Premises Address Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">House Number *</label>
                <input 
                  type="text"
                  {...register('houseNumber')}
                  placeholder="Flat/House number"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Street / Road *</label>
                <input 
                  type="text"
                  {...register('addressLine1')}
                  placeholder="Street or road name"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Landmark</label>
                <input 
                  type="text"
                  {...register('landmark')}
                  placeholder="Nearby landmark"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Village / City *</label>
                <input 
                  type="text"
                  {...register('city')}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">District *</label>
                <input 
                  type="text"
                  {...register('district')}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">State *</label>
                <input 
                  type="text"
                  {...register('state')}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">PIN Code *</label>
                <input 
                  type="text"
                  maxLength={6}
                  {...register('pinCode')}
                  placeholder="6-digit PIN"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>
            </div>

          </div>
        )}

        {/* STEP 3: Connection Details */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider border-b pb-2 flex items-center">
              <Zap size={16} className="mr-2" /> Section 3: Connection Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Connection Type *</label>
                <select 
                  {...register('connectionTypeId')}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="1">Domestic Connection</option>
                  <option value="2">Commercial Connection</option>
                  <option value="3">Industrial Power Line</option>
                  <option value="4">Temporary Grid Connection</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Business Area / Ward *</label>
                <input 
                  type="text"
                  {...register('businessArea')}
                  placeholder="Jamshedpur East / Jamshedpur West"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Voltage Requirement *</label>
                <select 
                  {...register('voltageRequirement')}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="LT">Low Tension (LT - 230V / 415V)</option>
                  <option value="HT">High Tension (HT - 11KV / 33KV)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Load Requirement *</label>
                <input 
                  type="text"
                  {...register('loadRequirement')}
                  placeholder="e.g. 5 KW / 10 KVA / 3 HP"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Purpose of Connection *</label>
                <select 
                  {...register('purposeOfConnection')}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="Domestic">Domestic Residential</option>
                  <option value="Commercial">Commercial Enterprises</option>
                  <option value="Industrial">Industrial Manufacturing</option>
                  <option value="Agricultural">Agricultural Irrigation</option>
                </select>
              </div>
            </div>

          </div>
        )}

        {/* STEP 4: Property Details */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider border-b pb-2 flex items-center">
              <Home size={16} className="mr-2" /> Section 4: Property Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Property Type *</label>
                <select 
                  {...register('propertyType')}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="Residential">Residential Building</option>
                  <option value="Flat">Multi-storey Flat</option>
                  <option value="Retail">Retail Shop / Showroom</option>
                  <option value="Warehouse">Warehouse / Godown</option>
                  <option value="Industrial Plot">Industrial Factory Plot</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ownership Type *</label>
                <select 
                  {...register('ownershipType')}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="Owner">Registered Owner</option>
                  <option value="Tenant">Tenant / Lease Holder</option>
                  <option value="Co-Owner">Joint / Co-Owner</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Plot Number *</label>
                <input 
                  type="text"
                  {...register('plotNumber')}
                  placeholder="Premises Plot/Holding number"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Survey Number *</label>
                <input 
                  type="text"
                  {...register('surveyNumber')}
                  placeholder="Land Khata/Survey number"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>
            </div>

          </div>
        )}

        {/* STEP 5: Business Details (Optional) */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider border-b pb-2 flex items-center">
              <FileText size={16} className="mr-2" /> Section 5: Organization & Business Details (Optional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Organization / Firm Name</label>
                <input 
                  type="text"
                  {...register('ownerOrgName')}
                  placeholder="Enter registered firm name"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Electrical Contractor Name</label>
                <input 
                  type="text"
                  {...register('vendorName')}
                  placeholder="Contractor/Vendor name"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">electrical Contractor License No</label>
                <input 
                  type="text"
                  {...register('vendorCertificateNumber')}
                  placeholder="License certificate number"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                />
              </div>
            </div>

          </div>
        )}

        {/* STEP 6: Document Upload */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider border-b pb-2 flex items-center">
              <Upload size={16} className="mr-2" /> Section 6: Verification Document Uploads
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderUploadSlot('Passport Size Photo', 'Upload recent passport photograph (max 10MB)')}
              {renderUploadSlot('Aadhaar Card', 'Identity validation photo / scan card (max 10MB)')}
              {renderUploadSlot('PAN Card', 'Tax card validation photo / scan card (max 10MB)')}
              {renderUploadSlot('Address Proof', 'Upload registry deed copy or electricity bill (max 10MB)')}
              {renderUploadSlot('Ownership Proof', 'Sale deed copy or tax mutation records (max 10MB)')}
              {renderUploadSlot('Signature', 'Attached signature specimen verification image (max 10MB)')}
            </div>

          </div>
        )}

        {/* STEP 7: Declaration */}
        {currentStep === 7 && (
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider border-b pb-2 flex items-center">
              <Shield size={16} className="mr-2" /> Section 7: Terms Declaration
            </h3>

            <div className="p-6 bg-gray-55/65 dark:bg-slate-900/35 border border-gray-150 dark:border-slate-750 rounded-2xl space-y-4 text-xs leading-relaxed text-gray-650 dark:text-gray-300">
              <p>
                1. I hereby declare that all the information furnished by me in this application form is true, correct, and complete to the best of my knowledge and belief.
              </p>
              <p>
                2. I agree to abide by all the grid safety regulations, security deposit requisites, tariff billing regulations, and general connection terms specified by Tata Steel Utilities and Infrastructure Services Limited (Tata UISL).
              </p>
              <p>
                3. I permit field inspection officers to visit my property premises to complete load surveys and grid coordinates tracing details.
              </p>
              
              <div className="flex items-start space-x-3 border-t border-gray-200 dark:border-slate-700/60 pt-4">
                <input 
                  type="checkbox"
                  id="decCheckbox"
                  checked={declarationChecked}
                  onChange={(e) => setDeclarationChecked(e.target.checked)}
                  className="rounded text-[#005BAC] focus:ring-[#005BAC] h-4.5 w-4.5 mt-0.5"
                />
                <label htmlFor="decCheckbox" className="font-bold text-gray-700 dark:text-white cursor-pointer select-none">
                  I accept all terms and conditions of connection release guidelines *
                </label>
              </div>
            </div>

          </div>
        )}

        {/* STEP 8: Review & Submit */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider border-b pb-2 flex items-center">
              <CheckCircle2 size={16} className="mr-2" /> Section 8: Final Review & Submission
            </h3>

            <div className="p-4 bg-yellow-50/50 border border-yellow-250/20 dark:bg-yellow-950/10 rounded-2xl text-xs flex items-start space-x-2.5 text-yellow-800 dark:text-yellow-400">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <p className="font-semibold leading-relaxed">
                Review all Connection Form details before submitting. Once submitted, the application request will be locked for Verification Officer auditing.
              </p>
            </div>

            {/* Application Data Read Only preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left leading-normal border border-gray-150 dark:border-slate-750 p-6 rounded-2xl bg-gray-50/50 dark:bg-slate-900/10">
              
              {/* Section 1: Personal Info */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-[#005BAC] dark:text-tata-blue-light uppercase text-[10px] tracking-wider border-b pb-1.5">1. Personal Info</h4>
                <p><span className="font-bold text-gray-400">Business Partner (BP):</span> {getValues().createNewBp ? 'Create New BP Profile' : `Use Existing BP: ${getValues().existingBpNo || 'N/A'}`}</p>
                <p><span className="font-bold text-gray-400">Full Name:</span> {getValues().fullName || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Relation Relative:</span> {getValues().relationshipType || 'Father'}: {getValues().relationshipName || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">DOB / Gender:</span> {getValues().dateOfBirth || 'N/A'} / {getValues().gender || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Identity Proof Type:</span> {getValues().identityCardType || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Aadhaar No:</span> {getValues().aadhaarNumber || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">PAN Card No:</span> {getValues().panNumber || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Mobile Number:</span> {getValues().phoneNumber || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Alt Mobile:</span> {getValues().alternatePhoneNumber || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Email Address:</span> {getValues().emailId || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Alt Email:</span> {getValues().alternateEmailId || 'N/A'}</p>
              </div>

              {/* Section 2: Premises Address */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-[#005BAC] dark:text-tata-blue-light uppercase text-[10px] tracking-wider border-b pb-1.5">2. Premises Address</h4>
                <p><span className="font-bold text-gray-400">House Number:</span> {getValues().houseNumber || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Street / Road:</span> {getValues().addressLine1 || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Landmark:</span> {getValues().landmark || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Village / City:</span> {getValues().city || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">District:</span> {getValues().district || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">State:</span> {getValues().state || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">PIN Code:</span> {getValues().pinCode || 'N/A'}</p>
              </div>

              {/* Section 3: Connection Specs */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-[#005BAC] dark:text-tata-blue-light uppercase text-[10px] tracking-wider border-b pb-1.5">3. Connection Specs</h4>
                <p>
                  <span className="font-bold text-gray-400">Connection Category:</span>{' '}
                  {getValues().connectionTypeId === '1'
                    ? 'Domestic Connection'
                    : getValues().connectionTypeId === '2'
                    ? 'Commercial Connection'
                    : getValues().connectionTypeId === '3'
                    ? 'Industrial Power Line'
                    : 'Temporary Grid Connection'}
                </p>
                <p><span className="font-bold text-gray-400">Business Area:</span> {getValues().businessArea || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Voltage Requirement:</span> {getValues().voltageRequirement === 'LT' ? 'Low Tension (LT - 230V / 415V)' : 'High Tension (HT - 11KV / 33KV)'}</p>
                <p><span className="font-bold text-gray-400">Load Requirement:</span> {getValues().loadRequirement || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Purpose of Connection:</span> {getValues().purposeOfConnection || 'N/A'}</p>
              </div>

              {/* Section 4: Property Details */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-[#005BAC] dark:text-tata-blue-light uppercase text-[10px] tracking-wider border-b pb-1.5">4. Property Details</h4>
                <p><span className="font-bold text-gray-400">Property Type:</span> {getValues().propertyType || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Ownership Type:</span> {getValues().ownershipType || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Plot Number:</span> {getValues().plotNumber || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Survey Number:</span> {getValues().surveyNumber || 'N/A'}</p>
              </div>

              {/* Section 5: Wiring & contractor */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-[#005BAC] dark:text-tata-blue-light uppercase text-[10px] tracking-wider border-b pb-1.5">5. Wiring & Contractor Info</h4>
                <p><span className="font-bold text-gray-400">Organization Name:</span> {getValues().ownerOrgName || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">Contractor Name:</span> {getValues().vendorName || 'N/A'}</p>
                <p><span className="font-bold text-gray-400">License Number:</span> {getValues().vendorCertificateNumber || 'N/A'}</p>
              </div>

              {/* Section 6: Document Uploads */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-[#005BAC] dark:text-tata-blue-light uppercase text-[10px] tracking-wider border-b pb-1.5">6. Uploaded Documents</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    'Passport Size Photo',
                    'Aadhaar Card',
                    'PAN Card',
                    'Address Proof',
                    'Ownership Proof',
                    'Signature'
                  ].map((docType) => (
                    <div key={docType} className="flex items-center space-x-1.5 py-0.5">
                      <span className={uploadedFiles[docType] ? 'text-green-650 font-bold' : 'text-red-500 font-bold'}>
                        {uploadedFiles[docType] ? '✓' : '✗'}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300 truncate">{docType}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Footer Navigation Buttons matching Reference Image 2 */}
        <div className="border-t border-gray-150 dark:border-slate-750 pt-6 mt-8 flex justify-between items-center">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => handleStepNavigation('prev')}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => saveDraftPayload(false)}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Save Draft
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => handleStepNavigation('next')}
                className="px-6 py-2.5 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                <CheckCircle2 size={16} />
              </button>
            )}
          </div>
        </div>

      </div>

      </>
    )}

    </div>
  );
};
