// Mock Data Store with LocalStorage Persistence for Tata UISL Portal
import { IMPORTED_APPLICATIONS } from './mockApplicationsSeed';

export interface User {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: 'Customer' | 'Admin';
  officerRole?: 'SuperAdmin' | 'Officer1' | 'Officer2' | 'Officer3' | 'Customer';
  isActive: boolean;
  createdAt: string;
}

export interface ConnectionType {
  id: number;
  name: string;
  category: 'Domestic' | 'Commercial' | 'Industrial' | 'Other';
}

export interface ApplicationDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  filePath: string; // Base64 data or mock URL
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  uploadedAt: string;
  rejectionReason?: string;
}

export interface ApplicationRemark {
  id: string;
  applicationId: string;
  officerName: string;
  remarks: string;
  createdAt: string;
}

export interface Application {
  id: string;
  applicationNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  
  // Section 1 - Personal Info
  fullName?: string;
  fatherName?: string;
  motherName?: string;
  gender?: string;
  dateOfBirth?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  occupation?: string;
  annualIncome?: number;

  createNewBp?: boolean;
  existingBpNo?: string;
  businessArea?: string;
  ownerOrgName?: string;
  relationshipType?: string;
  relationshipName?: string;
  identityCardType?: string;
  identityCardNumber?: string;
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  emailId?: string;
  alternateEmailId?: string;
  vendorName?: string;
  vendorCertificateNumber?: string;
  
  // Section 2 - Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  district?: string;
  pinCode?: string;
  
  // Section 3 - Connection Details
  connectionTypeId?: number;
  connectionTypeName?: string;
  connectionCategory?: string; // Domestic, Commercial, Industrial, Temporary
  applicationType?: string;
  
  // Section 4 - Property Details
  propertyType?: string;
  houseNumber?: string;
  wardNumber?: string;
  area?: string;
  landmark?: string;
  voltageRequirement?: string;
  loadRequirement?: string;
  purposeOfConnection?: string;
  ownershipType?: string;
  plotNumber?: string;
  surveyNumber?: string;
  division?: string;
  
  // System Fields
  currentStatus: 'Draft' | 'Submitted' | 'Under Verification' | 'Pending Officer 1' | 'Pending Officer 2' | 'Pending Officer 3' | 'Correction Required' | 'Approved' | 'Rejected' | 'Completed' | 'InProgress';
  currentStage: string; // 14 stages
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  lastUpdated: string;
  submittedDate: string;
  assignedOfficer: string;
  profileCompletion: number;
  documents: ApplicationDocument[];
  remarks: ApplicationRemark[];
  statusHistory?: { status: string; stage?: string; updatedDate: string; updatedByName: string; notes: string; }[];
}

export interface Notification {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: number;
  userName: string;
  action: string;
  tableName: string;
  recordId?: string;
  timestamp: string;
  ipAddress: string;
  details: string;
}

// Default Data Seed
const DEFAULT_USERS: User[] = [
  { id: 1, fullName: 'System Administrator', email: 'admin@tatauisl.com', mobileNumber: '9999999999', role: 'Admin', officerRole: 'SuperAdmin', isActive: true, createdAt: '2026-01-01T10:00:00Z' },
  { id: 2, fullName: 'Rajesh Kumar', email: 'rajesh.kumar@gmail.com', mobileNumber: '9876543210', role: 'Customer', officerRole: 'Customer', isActive: true, createdAt: '2026-06-01T12:00:00Z' },
  { id: 3, fullName: 'Priya Sharma', email: 'priya.sharma@yahoo.com', mobileNumber: '8765432109', role: 'Customer', officerRole: 'Customer', isActive: true, createdAt: '2026-06-10T14:30:00Z' },
  { id: 4, fullName: 'Officer 1 - Doc Verifier', email: 'officer1@tatauisl.com', mobileNumber: '9988776651', role: 'Admin', officerRole: 'Officer1', isActive: true, createdAt: '2026-06-10T14:30:00Z' },
  { id: 5, fullName: 'Officer 2 - Tech Surveyor', email: 'officer2@tatauisl.com', mobileNumber: '9988776652', role: 'Admin', officerRole: 'Officer2', isActive: true, createdAt: '2026-06-10T14:30:00Z' },
  { id: 6, fullName: 'Officer 3 - Approval Officer', email: 'officer3@tatauisl.com', mobileNumber: '9988776653', role: 'Admin', officerRole: 'Officer3', isActive: true, createdAt: '2026-06-10T14:30:00Z' }
];

const DEFAULT_CONNECTION_TYPES: ConnectionType[] = [
  { id: 1, name: 'Domestic New Connection', category: 'Domestic' },
  { id: 2, name: 'Commercial New Connection', category: 'Commercial' },
  { id: 3, name: 'Industrial New Connection', category: 'Industrial' },
  { id: 4, name: 'Domestic Name Transfer', category: 'Domestic' },
  { id: 5, name: 'Domestic Load Enhancement', category: 'Domestic' },
  { id: 6, name: 'Temporary Connection (Construction/Events)', category: 'Other' }
];

const DEFAULT_APPLICATIONS: Application[] = [
  ...IMPORTED_APPLICATIONS,
  {
    id: 'app_001',
    applicationNumber: 'TATA-UISL-2026-98124',
    customerId: 2,
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh.kumar@gmail.com',
    customerMobile: '9876543210',
    fullName: 'Rajesh Kumar',
    fatherName: 'Ram Sharan Kumar',
    motherName: 'Sita Devi',
    gender: 'Male',
    dateOfBirth: '1985-05-15',
    aadhaarNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    occupation: 'Self Employed',
    annualIncome: 450000,
    addressLine1: 'H.No 124, Sector 4, Bistupur',
    addressLine2: 'Near Regal Ground',
    city: 'Jamshedpur',
    state: 'Jharkhand',
    district: 'East Singhbhum',
    pinCode: '831001',
    connectionTypeId: 1,
    connectionTypeName: 'Domestic New Connection',
    connectionCategory: 'Domestic',
    applicationType: 'New Connection',
    propertyType: 'Residential Flat',
    houseNumber: '124',
    wardNumber: 'Ward 12',
    area: 'Bistupur',
    landmark: 'Regal Ground',
    currentStatus: 'Completed',
    currentStage: 'Completed',
    priority: 'Medium',
    lastUpdated: '2026-06-20T16:00:00Z',
    submittedDate: '2026-06-15T09:15:00Z',
    assignedOfficer: 'Unassigned',
    profileCompletion: 100,
    documents: [
      { id: 'doc_101', documentType: 'Aadhaar Card', fileName: 'aadhaar_rajesh.pdf', fileSize: 1024000, filePath: '#', verificationStatus: 'Verified', uploadedAt: '2026-06-15T09:20:00Z' },
      { id: 'doc_102', documentType: 'PAN Card', fileName: 'pan_rajesh.jpg', fileSize: 450000, filePath: '#', verificationStatus: 'Verified', uploadedAt: '2026-06-15T09:21:00Z' },
      { id: 'doc_103', documentType: 'Ownership Proof', fileName: 'property_deed.pdf', fileSize: 5400000, filePath: '#', verificationStatus: 'Verified', uploadedAt: '2026-06-15T09:23:00Z' }
    ],
    remarks: [
      { id: 'rem_101', applicationId: 'app_001', officerName: 'Officer 3 - Approval Officer', remarks: 'Physical connection completed, smart meter installed.', createdAt: '2026-06-20T16:00:00Z' }
    ],
    statusHistory: [
      { status: 'Submitted', stage: 'Application Verification', updatedDate: '2026-06-15T09:15:00Z', updatedByName: 'Rajesh Kumar', notes: 'Form submitted.' },
      { status: 'Pending Officer 1', stage: 'Application Verification', updatedDate: '2026-06-16T10:00:00Z', updatedByName: 'Officer 1 - Doc Verifier', notes: 'Verification initiated.' },
      { status: 'Pending Officer 2', stage: 'Load Survey', updatedDate: '2026-06-18T14:30:00Z', updatedByName: 'Officer 2 - Tech Surveyor', notes: 'Documents accepted. Moving to technical checks.' },
      { status: 'Pending Officer 3', stage: 'Demand Note', updatedDate: '2026-06-19T11:00:00Z', updatedByName: 'Officer 3 - Approval Officer', notes: 'Load verification cleared. Demand note generated.' },
      { status: 'Completed', stage: 'Completed', updatedDate: '2026-06-20T16:00:00Z', updatedByName: 'Officer 3 - Approval Officer', notes: 'Smart meter energized.' }
    ]
  },
  {
    id: 'app_002',
    applicationNumber: 'TATA-UISL-2026-98150',
    customerId: 3,
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@yahoo.com',
    customerMobile: '8765432109',
    fullName: 'Priya Sharma',
    fatherName: 'Sanjay Sharma',
    motherName: 'Sunita Sharma',
    gender: 'Female',
    dateOfBirth: '1992-09-24',
    aadhaarNumber: '987654321098',
    panNumber: 'XYZWP5678Q',
    occupation: 'Corporate Professional',
    annualIncome: 850000,
    addressLine1: 'Flat 4B, Hill View Apartments',
    addressLine2: 'CH Area',
    city: 'Jamshedpur',
    state: 'Jharkhand',
    district: 'East Singhbhum',
    pinCode: '831008',
    connectionTypeId: 2,
    connectionTypeName: 'Commercial New Connection',
    connectionCategory: 'Commercial',
    applicationType: 'New Connection',
    propertyType: 'Retail Shop',
    houseNumber: 'Shop No 12, Ground Floor',
    wardNumber: 'Ward 3',
    area: 'Sakchi',
    landmark: 'Sakchi Market Plaza',
    currentStatus: 'Pending Officer 1',
    currentStage: 'Document Verification',
    priority: 'High',
    lastUpdated: '2026-06-23T10:00:00Z',
    submittedDate: '2026-06-22T11:45:00Z',
    assignedOfficer: 'Officer 1 - Doc Verifier',
    profileCompletion: 80,
    documents: [
      { id: 'doc_201', documentType: 'Aadhaar Card', fileName: 'priya_aadhaar.pdf', fileSize: 1204000, filePath: '#', verificationStatus: 'Pending', uploadedAt: '2026-06-22T11:50:00Z' },
      { id: 'doc_202', documentType: 'PAN Card', fileName: 'priya_pan.png', fileSize: 300000, filePath: '#', verificationStatus: 'Rejected', uploadedAt: '2026-06-22T11:51:00Z', rejectionReason: 'The PAN card image is blurry. Please re-upload a clear copy.' },
      { id: 'doc_203', documentType: 'Passport Size Photo', fileName: 'photo.jpg', fileSize: 150000, filePath: '#', verificationStatus: 'Verified', uploadedAt: '2026-06-22T11:52:00Z' }
    ],
    remarks: [
      { id: 'rem_201', applicationId: 'app_002', officerName: 'Officer 1 - Doc Verifier', remarks: 'Requested re-upload of PAN card due to poor scan quality.', createdAt: '2026-06-23T10:00:00Z' }
    ],
    statusHistory: [
      { status: 'Submitted', stage: 'Application Verification', updatedDate: '2026-06-22T11:45:00Z', updatedByName: 'Priya Sharma', notes: 'Form submitted.' },
      { status: 'Correction Required', stage: 'Document Verification', updatedDate: '2026-06-23T10:00:00Z', updatedByName: 'Officer 1 - Doc Verifier', notes: 'PAN Card scan is blurry.' }
    ]
  },
  {
    id: 'app_003',
    applicationNumber: 'TATA-UISL-2026-30248',
    customerId: 2,
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh.kumar@gmail.com',
    customerMobile: '9876543210',
    fullName: 'Rajesh Kumar',
    currentStatus: 'Draft',
    currentStage: 'Application Verification',
    priority: 'Low',
    lastUpdated: '2026-06-28T10:00:00Z',
    submittedDate: '2026-06-28T10:00:00Z',
    assignedOfficer: 'Unassigned',
    profileCompletion: 25,
    documents: [],
    remarks: [],
    statusHistory: []
  },
  {
    id: 'app_004',
    applicationNumber: 'TATA-UISL-2026-44109',
    customerId: 3,
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@yahoo.com',
    customerMobile: '8765432109',
    fullName: 'Priya Sharma',
    currentStatus: 'Pending Officer 2',
    currentStage: 'Load Survey',
    priority: 'High',
    lastUpdated: '2026-07-01T15:20:00Z',
    submittedDate: '2026-06-29T10:00:00Z',
    assignedOfficer: 'Officer 2 - Tech Surveyor',
    profileCompletion: 70,
    documents: [
      { id: 'doc_401', documentType: 'Aadhaar Card', fileName: 'priya_aadhaar.pdf', fileSize: 1204000, filePath: '#', verificationStatus: 'Verified', uploadedAt: '2026-06-29T10:05:00Z' },
      { id: 'doc_402', documentType: 'PAN Card', fileName: 'priya_pan.png', fileSize: 300000, filePath: '#', verificationStatus: 'Verified', uploadedAt: '2026-06-29T10:06:00Z' }
    ],
    remarks: [],
    statusHistory: [
      { status: 'Submitted', stage: 'Application Verification', updatedDate: '2026-06-29T10:00:00Z', updatedByName: 'Priya Sharma', notes: 'Form submitted.' },
      { status: 'Pending Officer 1', stage: 'Application Verification', updatedDate: '2026-06-30T10:00:00Z', updatedByName: 'Officer 1 - Doc Verifier', notes: 'Verification initiated.' },
      { status: 'Pending Officer 2', stage: 'Load Survey', updatedDate: '2026-07-01T15:20:00Z', updatedByName: 'Officer 1 - Doc Verifier', notes: 'Verification complete. Delegated to Technical.' }
    ]
  },
  {
    id: 'app_005',
    applicationNumber: '260626021792',
    customerId: 4,
    customerName: 'Abhishek',
    customerEmail: 'abhishek.krgupta@yahoo.in',
    customerMobile: '8271039154',
    fullName: 'Abhishek',
    fatherName: 'Late S. R. Gupta',
    motherName: 'K. Devi',
    gender: 'Male',
    dateOfBirth: '1990-01-01',
    aadhaarNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    occupation: 'Business',
    annualIncome: 600000,
    addressLine1: 'wsrsdf , sdf f, asdasdfsdsdfsfsf sdffdsf dsf fsdf, sdfsdf ssf f sf fs f dffds fdsdddsdsd, asddsf fs, sdf',
    addressLine2: '345345',
    city: 'JAMSHEDPUR',
    state: 'Jharkhand',
    district: 'East Singhbhum',
    pinCode: '831001',
    connectionTypeId: 1,
    connectionTypeName: 'New Power Connection LT',
    connectionCategory: 'Commercial',
    applicationType: 'New Connection',
    division: 'Electricity',
    businessArea: 'JAMSHEDPUR',
    currentStatus: 'InProgress',
    currentStage: 'Load Survey Approval',
    priority: 'Medium',
    lastUpdated: '2026-07-02T10:00:00Z',
    submittedDate: '2026-06-26T10:00:00Z',
    assignedOfficer: 'Abhishek',
    profileCompletion: 80,
    documents: [],
    remarks: [],
    statusHistory: [
      { status: 'Submitted', stage: 'Application Verification', updatedDate: '2026-06-26T10:00:00Z', updatedByName: 'Abhishek', notes: 'Form submitted.' },
      { status: 'InProgress', stage: 'Load Survey Approval', updatedDate: '2026-07-02T10:00:00Z', updatedByName: 'Officer 1 - Doc Verifier', notes: 'Load survey initialized.' }
    ]
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: 'not_001', userId: 2, title: 'Application Submitted Successfully', message: 'Your application TATA-UISL-2026-98124 has been submitted. Tracking has been initialized.', type: 'Success', isRead: true, createdAt: '2026-06-15T09:25:00Z' },
  { id: 'not_002', userId: 2, title: 'Connection Setup Scheduled', message: 'An installation officer is scheduled to visit your property on 2026-06-19.', type: 'Info', isRead: true, createdAt: '2026-06-18T10:00:00Z' },
  { id: 'not_003', userId: 2, title: 'Power Connection Activated', message: 'Congratulations! Your connection under application number TATA-UISL-2026-98124 is now active.', type: 'Success', isRead: false, createdAt: '2026-06-20T16:05:00Z' },
  { id: 'not_004', userId: 3, title: 'Document Re-upload Required', message: 'Officer Neha Sen has requested a re-upload of your PAN Card because the image is blurry.', type: 'Warning', isRead: false, createdAt: '2026-06-23T10:05:00Z' },
  
  // Seed notifications for Admin & Officers
  { id: 'not_005', userId: 1, title: 'New Application Pending', message: 'Application TATA-UISL-2026-98150 by Priya Sharma is pending Document Verification stage.', type: 'Info', isRead: false, createdAt: '2026-06-22T11:55:00Z' },
  { id: 'not_006', userId: 1, title: 'Database Backup Completed', message: 'The automated database backup finished successfully with zero errors.', type: 'Success', isRead: true, createdAt: '2026-07-01T02:00:00Z' },
  { id: 'not_007', userId: 1, title: 'SLA Breach Warning', message: 'Application TATA-UISL-2026-87123 is exceeding the SLA duration limit in Technical Assessment.', type: 'Warning', isRead: false, createdAt: '2026-07-02T08:00:00Z' },
  { id: 'not_008', userId: 4, title: 'Pending Document Audit', message: 'You have 3 new customer applications assigned to your desk for verification checks.', type: 'Info', isRead: false, createdAt: '2026-07-02T09:00:00Z' },
  { id: 'not_009', userId: 5, title: 'Field Load Survey Requested', message: 'A residential building connection request in Bistupur is ready for physical coordinates survey.', type: 'Info', isRead: false, createdAt: '2026-07-02T09:30:00Z' },
  { id: 'not_010', userId: 6, title: 'Awaiting Estimate Approval', message: 'An industrial cost estimate of 5,40,000 INR requires your final verification and release authorization.', type: 'Warning', isRead: false, createdAt: '2026-07-02T10:00:00Z' }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  { id: 'log_001', userId: 1, userName: 'System Administrator', action: 'User Seeding', tableName: 'Users', recordId: '1', timestamp: '2026-06-25T09:00:00Z', ipAddress: '127.0.0.1', details: 'Initial system users seeded.' },
  { id: 'log_002', userId: 3, userName: 'Priya Sharma', action: 'Application Creation', tableName: 'Applications', recordId: 'app_002', timestamp: '2026-06-22T11:45:00Z', ipAddress: '192.168.1.45', details: 'Priya Sharma submitted a new connection request.' },
  { id: 'log_003', userId: 1, userName: 'Officer Neha Sen', action: 'Document Verification Update', tableName: 'Documents', recordId: 'doc_202', timestamp: '2026-06-23T10:00:00Z', ipAddress: '10.0.2.14', details: 'Officer rejected Priya\'s PAN Card due to blurriness.' }
];

const DEFAULT_SETTINGS = {
  requiredDocuments: ['Aadhaar Card', 'PAN Card', 'Passport Size Photo', 'Address Proof', 'Ownership Proof', 'Electricity Bill', 'Signature'],
  allowRegistration: 'true',
  supportEmail: 'support.uisl@tatasteel.com',
  supportPhone: '1800-345-6789'
};

// Helper functions for reading/writing LocalStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(item);
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// State Managers
export const getMockUsers = (): User[] => getStorageItem('tata_users', DEFAULT_USERS);
export const setMockUsers = (users: User[]) => setStorageItem('tata_users', users);

export const getMockConnectionTypes = (): ConnectionType[] => getStorageItem('tata_conn_types', DEFAULT_CONNECTION_TYPES);
export const setMockConnectionTypes = (types: ConnectionType[]) => setStorageItem('tata_conn_types', types);

export const setMockApplications = (apps: Application[]) => setStorageItem('tata_applications', apps);
export const getMockApplications = (): Application[] => {
  const apps = getStorageItem('tata_applications', DEFAULT_APPLICATIONS);
  if (!apps.some(a => a.applicationNumber === '260626021792')) {
    const newApp: Application = {
      id: 'app_005',
      applicationNumber: '260626021792',
      customerId: 4,
      customerName: 'Abhishek',
      customerEmail: 'abhishek.krgupta@yahoo.in',
      customerMobile: '8271039154',
      fullName: 'Abhishek',
      fatherName: 'Late S. R. Gupta',
      motherName: 'K. Devi',
      gender: 'Male',
      dateOfBirth: '1990-01-01',
      aadhaarNumber: '123456789012',
      panNumber: 'ABCDE1234F',
      occupation: 'Business',
      annualIncome: 600000,
      addressLine1: 'wsrsdf , sdf f, asdasdfsdsdfsfsf sdffdsf dsf fsdf, sdfsdf ssf f sf fs f dffds fdsdddsdsd, asddsf fs, sdf',
      addressLine2: '345345',
      city: 'JAMSHEDPUR',
      state: 'Jharkhand',
      district: 'East Singhbhum',
      pinCode: '831001',
      connectionTypeId: 1,
      connectionTypeName: 'New Power Connection LT',
      connectionCategory: 'Commercial',
      applicationType: 'New Connection',
      division: 'Electricity',
      businessArea: 'JAMSHEDPUR',
      currentStatus: 'InProgress',
      currentStage: 'Load Survey Approval',
      priority: 'Medium',
      lastUpdated: '2026-07-02T10:00:00Z',
      submittedDate: '2026-06-26T10:00:00Z',
      assignedOfficer: 'Abhishek',
      profileCompletion: 80,
      documents: [],
      remarks: [],
      statusHistory: [
        { status: 'Submitted', stage: 'Application Verification', updatedDate: '2026-06-26T10:00:00Z', updatedByName: 'Abhishek', notes: 'Form submitted.' },
        { status: 'InProgress', stage: 'Load Survey Approval', updatedDate: '2026-07-02T10:00:00Z', updatedByName: 'Officer 1 - Doc Verifier', notes: 'Load survey initialized.' }
      ]
    };
    apps.unshift(newApp);
    setMockApplications(apps);
  }
  return apps;
};

export const getMockNotifications = (): Notification[] => getStorageItem('tata_notifications', DEFAULT_NOTIFICATIONS);
export const setMockNotifications = (notifs: Notification[]) => setStorageItem('tata_notifications', notifs);

export const getMockAuditLogs = (): AuditLog[] => getStorageItem('tata_audit_logs', DEFAULT_AUDIT_LOGS);
export const setMockAuditLogs = (logs: AuditLog[]) => setStorageItem('tata_audit_logs', logs);

export const getMockSettings = () => getStorageItem('tata_settings', DEFAULT_SETTINGS);
export const setMockSettings = (settings: typeof DEFAULT_SETTINGS) => setStorageItem('tata_settings', settings);

export const writeAuditLog = (userId: number | undefined, userName: string, action: string, tableName: string, recordId?: string, details = '') => {
  const logs = getMockAuditLogs();
  const newLog: AuditLog = {
    id: 'log_' + Date.now(),
    userId,
    userName,
    action,
    tableName,
    recordId,
    timestamp: new Date().toISOString(),
    ipAddress: '127.0.0.1', // Mock IP
    details
  };
  logs.unshift(newLog); // Newest first
  setMockAuditLogs(logs);
};

export const addNotification = (userId: number, title: string, message: string, type: 'Info' | 'Success' | 'Warning' | 'Error' = 'Info') => {
  const notifs = getMockNotifications();
  const newNotif: Notification = {
    id: 'not_' + Date.now(),
    userId,
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  notifs.unshift(newNotif);
  setMockNotifications(notifs);
};

export interface WorkflowRoute {
  id: number;
  name: string;
  levelGroup: string;
  stages: WorkflowStage[];
}

export interface WorkflowStage {
  id: number;
  routeId: number;
  stageName: string;
  sequenceOrder: number;
  workflowLevel: string;
  department: string;
  requiredAction: string;
}

export interface OfficerDetail {
  id: number;
  name: string;
  employeeId: string;
  department: string;
  workload: number;
  availabilityStatus: 'Available' | 'Unavailable';
}

export interface OfficerAssignment {
  stageName: string;
  officerId: number;
}

const DEFAULT_WORKFLOW_ROUTES: WorkflowRoute[] = [
  {
    id: 1,
    name: 'Low Tension Route R1',
    levelGroup: 'LT G1',
    stages: [
      { id: 101, routeId: 1, stageName: 'Load Survey Details', sequenceOrder: 1, workflowLevel: 'Level 1', department: 'Technical', requiredAction: 'Verify connected load and premises layout' },
      { id: 102, routeId: 1, stageName: 'Land Survey Details', sequenceOrder: 2, workflowLevel: 'Level 1', department: 'Technical', requiredAction: 'Confirm boundary coordinates and clearance' },
      { id: 103, routeId: 1, stageName: 'Load Survey Approval', sequenceOrder: 3, workflowLevel: 'Level 2', department: 'Technical', requiredAction: 'Approve surveyed capacity limit' },
      { id: 104, routeId: 1, stageName: 'Estimate Details', sequenceOrder: 4, workflowLevel: 'Level 1', department: 'Engineering', requiredAction: 'Draft material cost estimates' },
      { id: 105, routeId: 1, stageName: 'Estimate Approval', sequenceOrder: 5, workflowLevel: 'Level 2', department: 'Engineering', requiredAction: 'Verify and authorize estimated budget' },
      { id: 106, routeId: 1, stageName: 'Bill Verification Level 1', sequenceOrder: 6, workflowLevel: 'Level 1', department: 'Accounts', requiredAction: 'Verify payment voucher clearance' },
      { id: 107, routeId: 1, stageName: 'Bill Verification Level 2', sequenceOrder: 7, workflowLevel: 'Level 2', department: 'Accounts', requiredAction: 'Audit transaction details' },
      { id: 108, routeId: 1, stageName: 'Demand Note', sequenceOrder: 8, workflowLevel: 'Level 1', department: 'Accounts', requiredAction: 'Issue official payment demand note' },
      { id: 109, routeId: 1, stageName: 'Job Allotment', sequenceOrder: 9, workflowLevel: 'Level 1', department: 'Operations', requiredAction: 'Allot installation task to field team' },
      { id: 110, routeId: 1, stageName: 'RFC Entry', sequenceOrder: 10, workflowLevel: 'Level 1', department: 'Operations', requiredAction: 'Log Ready For Commissioning state details' },
      { id: 111, routeId: 1, stageName: 'Energization', sequenceOrder: 11, workflowLevel: 'Level 1', department: 'Operations', requiredAction: 'Commission connection and mount smart meter' },
      { id: 112, routeId: 1, stageName: 'Move-In', sequenceOrder: 12, workflowLevel: 'Level 1', department: 'Customer Service', requiredAction: 'Activate consumer profile contract' }
    ]
  },
  {
    id: 2,
    name: 'Low Tension Route R2',
    levelGroup: 'LT G2',
    stages: [
      { id: 201, routeId: 2, stageName: 'Load Survey Details', sequenceOrder: 1, workflowLevel: 'Level 1', department: 'Technical', requiredAction: 'Verify connected load layout' },
      { id: 202, routeId: 2, stageName: 'Estimate Details', sequenceOrder: 2, workflowLevel: 'Level 1', department: 'Engineering', requiredAction: 'Draft material cost estimates' },
      { id: 203, routeId: 2, stageName: 'Estimate Approval', sequenceOrder: 3, workflowLevel: 'Level 2', department: 'Engineering', requiredAction: 'Verify estimated budget' },
      { id: 204, routeId: 2, stageName: 'Demand Note', sequenceOrder: 4, workflowLevel: 'Level 1', department: 'Accounts', requiredAction: 'Issue payment demand note' },
      { id: 205, routeId: 2, stageName: 'Energization', sequenceOrder: 5, workflowLevel: 'Level 1', department: 'Operations', requiredAction: 'Energize and mount meter' }
    ]
  },
  {
    id: 3,
    name: 'High Tension Route',
    levelGroup: 'HT',
    stages: [
      { id: 301, routeId: 3, stageName: 'Load Survey Details', sequenceOrder: 1, workflowLevel: 'Level 1', department: 'Technical', requiredAction: 'Verify connected load layout' },
      { id: 302, routeId: 3, stageName: 'Estimate Details', sequenceOrder: 2, workflowLevel: 'Level 1', department: 'Engineering', requiredAction: 'Draft material cost estimates' },
      { id: 303, routeId: 3, stageName: 'Estimate Approval', sequenceOrder: 3, workflowLevel: 'Level 2', department: 'Engineering', requiredAction: 'Verify estimated budget' },
      { id: 304, routeId: 3, stageName: 'Demand Note', sequenceOrder: 4, workflowLevel: 'Level 1', department: 'Accounts', requiredAction: 'Issue payment demand note' },
      { id: 305, routeId: 3, stageName: 'Energization', sequenceOrder: 5, workflowLevel: 'Level 1', department: 'Operations', requiredAction: 'Energize and mount meter' }
    ]
  },
  {
    id: 4,
    name: 'Commercial Workflow',
    levelGroup: 'Commercial',
    stages: [
      { id: 401, routeId: 4, stageName: 'Load Survey Details', sequenceOrder: 1, workflowLevel: 'Level 1', department: 'Technical', requiredAction: 'Verify connected load layout' },
      { id: 402, routeId: 4, stageName: 'Estimate Details', sequenceOrder: 2, workflowLevel: 'Level 1', department: 'Engineering', requiredAction: 'Draft material cost estimates' },
      { id: 403, routeId: 4, stageName: 'Estimate Approval', sequenceOrder: 3, workflowLevel: 'Level 2', department: 'Engineering', requiredAction: 'Verify estimated budget' },
      { id: 404, routeId: 4, stageName: 'Demand Note', sequenceOrder: 4, workflowLevel: 'Level 1', department: 'Accounts', requiredAction: 'Issue payment demand note' },
      { id: 405, routeId: 4, stageName: 'Energization', sequenceOrder: 5, workflowLevel: 'Level 1', department: 'Operations', requiredAction: 'Energize and mount meter' }
    ]
  },
  {
    id: 5,
    name: 'Industrial Workflow',
    levelGroup: 'Industrial',
    stages: [
      { id: 501, routeId: 5, stageName: 'Load Survey Details', sequenceOrder: 1, workflowLevel: 'Level 1', department: 'Technical', requiredAction: 'Verify connected load layout' },
      { id: 502, routeId: 5, stageName: 'Estimate Details', sequenceOrder: 2, workflowLevel: 'Level 1', department: 'Engineering', requiredAction: 'Draft material cost estimates' },
      { id: 503, routeId: 5, stageName: 'Estimate Approval', sequenceOrder: 3, workflowLevel: 'Level 2', department: 'Engineering', requiredAction: 'Verify estimated budget' },
      { id: 504, routeId: 5, stageName: 'Demand Note', sequenceOrder: 4, workflowLevel: 'Level 1', department: 'Accounts', requiredAction: 'Issue payment demand note' },
      { id: 505, routeId: 5, stageName: 'Energization', sequenceOrder: 5, workflowLevel: 'Level 1', department: 'Operations', requiredAction: 'Energize and mount meter' }
    ]
  }
];

export const getMockWorkflowRoutes = (): WorkflowRoute[] => getStorageItem('tata_wf_routes', DEFAULT_WORKFLOW_ROUTES);
