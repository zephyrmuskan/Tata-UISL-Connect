// Mock Data Store with LocalStorage Persistence for Tata UISL Portal
import { IMPORTED_APPLICATIONS } from './mockApplicationsSeed';

export interface User {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: 'Customer' | 'Admin';
  officerRole?: 'SuperAdmin' | 'Officer1' | 'Officer2' | 'Officer3' | 'Customer';
  employeeId?: string;
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
  currentStatus: 'Draft' | 'Submitted' | 'Under Verification' | 'Pending Officer 1' | 'Pending Officer 2' | 'Pending Officer 3' | 'Correction Required' | 'Approved' | 'Rejected' | 'Completed' | 'InProgress' | 'Hold' | 'Regretted' | 'Returned' | 'Archived';
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
  employeeId?: string;
  userName: string;
  role?: string;
  module?: string;
  action: string;
  tableName: string;
  recordId?: string;
  timestamp: string;
  ipAddress: string;
  browser?: string;
  operatingSystem?: string;
  device?: string;
  status?: string;
  ticketId?: string;
  ticketNumber?: string;
  approvedBy?: string;
  beforeJson?: string;
  afterJson?: string;
  details: string;
}

export interface UserSession {
  id: string;
  userId: number;
  employeeId?: string;
  role: string;
  loginTimestamp: string;
  logoutTimestamp?: string;
  browserClosureTimestamp?: string;
  isTimeout: boolean;
  ipAddress: string;
  browser: string;
  operatingSystem: string;
  device: string;
  sessionDuration?: number;
}

// Default Data Seed
const DEFAULT_USERS: User[] = [
  { id: 1, fullName: 'System Administrator', email: 'admin@tatauisl.com', mobileNumber: '9999999999', role: 'Admin', officerRole: 'SuperAdmin', employeeId: 'EMP001', isActive: true, createdAt: '2026-01-01T10:00:00Z' },
  { id: 2, fullName: 'Rajesh Kumar', email: 'rajesh.kumar@gmail.com', mobileNumber: '9876543210', role: 'Customer', officerRole: 'Customer', employeeId: '', isActive: true, createdAt: '2026-06-01T12:00:00Z' },
  { id: 3, fullName: 'Priya Sharma', email: 'priya.sharma@yahoo.com', mobileNumber: '8765432109', role: 'Customer', officerRole: 'Customer', employeeId: '', isActive: true, createdAt: '2026-06-10T14:30:00Z' },
  { id: 4, fullName: 'Officer 1 - Doc Verifier', email: 'officer1@tatauisl.com', mobileNumber: '9988776651', role: 'Admin', officerRole: 'Officer1', employeeId: 'EMP002', isActive: true, createdAt: '2026-06-10T14:30:00Z' },
  { id: 5, fullName: 'Officer 2 - Tech Surveyor', email: 'officer2@tatauisl.com', mobileNumber: '9988776652', role: 'Admin', officerRole: 'Officer2', employeeId: 'EMP003', isActive: true, createdAt: '2026-06-10T14:30:00Z' },
  { id: 6, fullName: 'Officer 3 - Approval Officer', email: 'officer3@tatauisl.com', mobileNumber: '9988776653', role: 'Admin', officerRole: 'Officer3', employeeId: 'EMP004', isActive: true, createdAt: '2026-06-10T14:30:00Z' }
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
  let apps: Application[] = getStorageItem<Application[]>('tata_applications', DEFAULT_APPLICATIONS);

  // If stored apps in browser local storage is less than our 100 seed items, reseed all items
  if (!apps || apps.length < DEFAULT_APPLICATIONS.length) {
    const map = new Map<string, Application>();
    DEFAULT_APPLICATIONS.forEach(a => map.set(a.applicationNumber || a.id, a));
    if (apps && apps.length > 0) {
      apps.forEach((a: Application) => map.set(a.applicationNumber || a.id, a));
    }
    apps = Array.from(map.values());
    setStorageItem('tata_applications', apps);
  } else {
    let needsUpdate = false;
    for (const seedApp of DEFAULT_APPLICATIONS) {
      if (!apps.some(a => a.id === seedApp.id || a.applicationNumber === seedApp.applicationNumber)) {
        apps.push(seedApp);
        needsUpdate = true;
      }
    }
    if (needsUpdate) {
      setStorageItem('tata_applications', apps);
    }
  }
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

export const writeAuditLog = (
  userId: number | undefined,
  userName: string,
  action: string,
  tableName: string,
  recordId?: string,
  details = '',
  status = 'Success',
  beforeJson?: string,
  afterJson?: string,
  ticketId?: string,
  ticketNumber?: string,
  approvedBy?: string
) => {
  const logs = getMockAuditLogs();
  const users = getMockUsers();
  const user = users.find(u => u.id === userId);

  // Parse User Agent
  const ua = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  let os = 'Unknown OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  let browser = 'Unknown Browser';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  const device = ua.includes('Mobile') ? 'Mobile' : 'Desktop';
  const ipAddress = '192.168.1.100'; // Mock local IP

  const newLog: AuditLog = {
    id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 100),
    userId,
    employeeId: user?.employeeId || '',
    userName,
    role: user?.role || 'Customer',
    module: tableName,
    action,
    tableName,
    recordId,
    timestamp: new Date().toISOString(),
    ipAddress,
    browser,
    operatingSystem: os,
    device,
    status,
    ticketId,
    ticketNumber,
    approvedBy,
    beforeJson,
    afterJson,
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

export const getMockUserSessions = (): UserSession[] => getStorageItem('tata_user_sessions', []);
export const setMockUserSessions = (sessions: UserSession[]) => setStorageItem('tata_user_sessions', sessions);

export const writeUserSession = (userId: number, role: string, employeeId?: string): string => {
  const sessions = getMockUserSessions();
  const sessionId = 'mock_session_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  
  const ua = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  let os = 'Unknown OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';
  
  let browser = 'Unknown Browser';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  const device = ua.includes('Mobile') ? 'Mobile' : 'Desktop';
  
  const newSession: UserSession = {
    id: sessionId,
    userId,
    employeeId,
    role,
    loginTimestamp: new Date().toISOString(),
    isTimeout: false,
    ipAddress: '192.168.1.100',
    browser,
    operatingSystem: os,
    device
  };
  sessions.push(newSession);
  setMockUserSessions(sessions);
  return sessionId;
};

export const closeUserSession = (sessionId: string, isTimeout = false, isBrowserClosure = false) => {
  const sessions = getMockUserSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (session && !session.logoutTimestamp && !session.browserClosureTimestamp) {
    const now = new Date();
    if (isBrowserClosure) {
      session.browserClosureTimestamp = now.toISOString();
    } else {
      session.logoutTimestamp = now.toISOString();
    }
    session.isTimeout = isTimeout;
    const duration = Math.floor((now.getTime() - new Date(session.loginTimestamp).getTime()) / 1000);
    session.sessionDuration = duration;
    setMockUserSessions(sessions);
    
    // Log audit event
    const users = getMockUsers();
    const user = users.find(u => u.id === session.userId);
    const action = isBrowserClosure ? 'Browser Closure' : isTimeout ? 'Session Timeout' : 'Logout';
    writeAuditLog(
      session.userId,
      user?.fullName || 'User',
      action,
      'UserSessions',
      session.id,
      `User session ended. Duration: ${duration}s. Reason: ${action}`
    );
  }
};

export const getMockDailyStats = () => {
  const apps = getMockApplications();
  const logs = getMockAuditLogs();

  const totalCreated = apps.length;
  const totalDrafts = apps.filter(a => a.currentStatus === 'Draft').length;
  const totalSubmitted = apps.filter(a => a.currentStatus !== 'Draft').length;
  const totalApproved = apps.filter(a => a.currentStatus === 'Approved' || a.currentStatus === 'Completed').length;
  const totalRejected = apps.filter(a => a.currentStatus === 'Rejected').length;
  const totalPending = apps.filter(a => !['Draft', 'Completed', 'Approved', 'Rejected'].includes(a.currentStatus)).length;

  const totalReturned = logs.filter(l => ['Return', 'Returned', 'Correction Required'].includes(l.action)).length;
  const totalAccepted = logs.filter(l => ['Accept', 'Accepted', 'Assign', 'Approve'].includes(l.action)).length;

  const processedPerOfficer: Record<string, number> = {};
  logs.forEach(l => {
    if (['Approve', 'Reject', 'Forward Stage', 'Update Application'].includes(l.action)) {
      const name = l.userName;
      if (name && name !== 'System' && name !== 'System Administrator') {
        processedPerOfficer[name] = (processedPerOfficer[name] || 0) + 1;
      }
    }
  });

  const completedApps = apps.filter(a => ['Completed', 'Approved'].includes(a.currentStatus) && a.submittedDate);
  let avgProcessingTimeMinutes = 0;
  if (completedApps.length > 0) {
    const totalMinutes = completedApps.reduce((sum, a) => {
      const start = new Date(a.submittedDate);
      const end = new Date(a.lastUpdated);
      return sum + Math.max(0, (end.getTime() - start.getTime()) / 60000);
    }, 0);
    avgProcessingTimeMinutes = Math.round(totalMinutes / completedApps.length * 10) / 10;
  }

  return {
    totalCreated,
    totalDrafts,
    totalSubmitted,
    totalApproved,
    totalRejected,
    totalReturned,
    totalAccepted,
    totalPending,
    processedPerOfficer,
    avgProcessingTimeMinutes
  };
};

// -------------------------------------------------------------
// DOCUMENT VERIFICATION ENGINE INTERFACES & MOCK STORE
// -------------------------------------------------------------
export interface VerificationFieldResult {
  fieldName: string;
  applicationValue: string;
  documentValue: string;
  matchType: 'Exact Match' | 'Fuzzy Match' | 'Semantic/Address Match';
  matchStatus: 'Exact Match' | 'Partial Match' | 'Mismatch' | 'Field Not Found';
  confidenceScore: number;
  severity: 'Low' | 'Medium' | 'High';
  differenceNote?: string;
  suggestedAction?: string;
  documentType?: string;
}

export interface DocumentQualityMetric {
  documentId?: string;
  documentType: string;
  blurScore: number;
  resolutionScore: number;
  rotationAngle: number;
  isCropped: boolean;
  isDuplicate: boolean;
  hasWatermark: boolean;
  readabilityScore: number;
  overallQualityScore: number;
  qualityStatus: 'High Quality' | 'Good Quality' | 'Fair Quality' | 'Low Quality';
}

export interface ExtractedDocumentData {
  documentId?: string;
  documentType: string;
  ocrEngine?: string;
  confidenceScore: number;
  extractedFields: Record<string, string>;
}

export interface VerificationSummaryData {
  applicationId: string;
  applicationNumber: string;
  overallScore: number;
  identityMatchScore: number;
  addressMatchScore: number;
  ocrConfidenceScore: number;
  documentQualityScore: number;
  totalFieldsCompared: number;
  exactMatches: number;
  partialMatches: number;
  mismatches: number;
  missingFields: number;
  verificationStatus: string;
  decision?: string;
  decisionRemarks?: string;
  isOverridden?: boolean;
  verifiedByName?: string;
  verifiedAt?: string;
  results: VerificationFieldResult[];
  extractedDocuments: ExtractedDocumentData[];
  qualityMetrics: DocumentQualityMetric[];
  systemRecommendations: string[];
  processedAt: string;
}

export interface VerificationAuditEntry {
  id: number;
  userId?: number;
  employeeId?: string;
  userName?: string;
  applicationNumber: string;
  action: string;
  verificationScore: number;
  previousStatus?: string;
  newStatus: string;
  isOverride: boolean;
  remarks?: string;
  ipAddress?: string;
  timestamp: string;
}

const MOCK_VERIFICATION_CACHE: Record<string, VerificationSummaryData> = {};
const MOCK_VERIFICATION_AUDIT_LOGS: VerificationAuditEntry[] = [];

export const runMockDocumentVerification = (app: Application): VerificationSummaryData => {
  if (MOCK_VERIFICATION_CACHE[app.id]) {
    return MOCK_VERIFICATION_CACHE[app.id];
  }

  const fullName = app.fullName || app.customerName || 'Test Customer';
  const aadhaar = app.aadhaarNumber || app.identityCardNumber || '123456789012';
  const pan = app.panNumber || 'ABCDE1234F';
  const father = app.fatherName || 'Ramesh Sharma';
  const dob = app.dateOfBirth || '1990-05-15';
  const addressParts = [app.houseNumber, app.addressLine1, app.addressLine2, app.area, app.city, app.pinCode].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(', ') : 'Test Road, Jamshedpur - 831001';

  // Field comparisons with realistic OCR document extractions
  const results: VerificationFieldResult[] = [
    {
      fieldName: 'Applicant Name',
      applicationValue: fullName,
      documentValue: fullName,
      matchType: 'Exact Match',
      matchStatus: 'Exact Match',
      confidenceScore: 100,
      severity: 'Low',
      differenceNote: 'Exact character sequence match.',
      suggestedAction: 'Auto-verified successfully.',
      documentType: 'Aadhaar Card'
    },
    {
      fieldName: 'Aadhaar Number',
      applicationValue: aadhaar,
      documentValue: aadhaar,
      matchType: 'Exact Match',
      matchStatus: 'Exact Match',
      confidenceScore: 100,
      severity: 'Low',
      differenceNote: 'Government Unique ID match verified.',
      suggestedAction: 'Auto-verified successfully.',
      documentType: 'Aadhaar Card'
    },
    {
      fieldName: 'PAN Number',
      applicationValue: pan !== 'N/A' && pan ? pan : 'ABCDE1234F',
      documentValue: 'ABCDE1234F',
      matchType: 'Exact Match',
      matchStatus: pan && pan !== 'N/A' && pan !== 'ABCDE1234F' ? 'Partial Match' : 'Exact Match',
      confidenceScore: pan && pan !== 'N/A' && pan !== 'ABCDE1234F' ? 88 : 100,
      severity: 'Low',
      differenceNote: 'Taxpayer Permanent Account Number matched.',
      suggestedAction: 'Auto-verified successfully.',
      documentType: 'PAN Card'
    },
    {
      fieldName: "Father's Name",
      applicationValue: father !== 'N/A' && father ? father : 'Ramesh Sharma',
      documentValue: `${(father && father !== 'N/A' ? father : 'Ramesh Sharma').split(' ')[0]} Kumar ${(father && father !== 'N/A' ? father : 'Ramesh Sharma').split(' ')[1] || 'Sharma'}`,
      matchType: 'Fuzzy Match',
      matchStatus: 'Partial Match',
      confidenceScore: 89,
      severity: 'Medium',
      differenceNote: "'Kumar' middle name present in document.",
      suggestedAction: 'Review middle name variation manually.',
      documentType: 'PAN Card'
    },
    {
      fieldName: 'Date of Birth',
      applicationValue: dob !== 'N/A' && dob ? dob : '1990-05-15',
      documentValue: dob !== 'N/A' && dob ? dob : '1990-05-15',
      matchType: 'Exact Match',
      matchStatus: 'Exact Match',
      confidenceScore: 100,
      severity: 'Low',
      differenceNote: 'Date of birth match verified.',
      suggestedAction: 'Auto-verified successfully.',
      documentType: 'Aadhaar Card'
    },
    {
      fieldName: 'Complete Address',
      applicationValue: address,
      documentValue: address,
      matchType: 'Semantic/Address Match',
      matchStatus: 'Exact Match',
      confidenceScore: 96,
      severity: 'Low',
      differenceNote: 'Address & locality match verified.',
      suggestedAction: 'Premises verified.',
      documentType: 'Electricity Bill'
    }
  ];

  const extractedDocuments: ExtractedDocumentData[] = [
    {
      documentType: 'Aadhaar Card',
      ocrEngine: 'Engine Standard OCR (High Precision)',
      confidenceScore: 98,
      extractedFields: {
        'Applicant Name': fullName,
        'Aadhaar Number': aadhaar,
        'Date of Birth': dob !== 'N/A' ? dob : '1990-05-15',
        'Gender': app.gender || 'Male',
        'Address': address
      }
    },
    {
      documentType: 'PAN Card',
      ocrEngine: 'Engine Standard OCR (High Precision)',
      confidenceScore: 97,
      extractedFields: {
        'Applicant Name': fullName,
        'PAN Number': pan !== 'N/A' ? pan : 'ABCDE1234F',
        "Father's Name": `${(father !== 'N/A' ? father : 'Ramesh Sharma').split(' ')[0]} Kumar ${(father !== 'N/A' ? father : 'Ramesh Sharma').split(' ')[1] || 'Sharma'}`,
        'Date of Birth': dob !== 'N/A' ? dob : '1990-05-15'
      }
    },
    {
      documentType: 'Electricity Bill',
      ocrEngine: 'Engine Standard OCR (High Precision)',
      confidenceScore: 96,
      extractedFields: {
        'Customer Name': fullName,
        'Consumer Number': 'CN-88492014',
        'Address': address,
        'Account Number': 'ACT-449102'
      }
    }
  ];

  const qualityMetrics: DocumentQualityMetric[] = [
    {
      documentType: 'Aadhaar Card',
      blurScore: 95,
      resolutionScore: 98,
      rotationAngle: 0,
      isCropped: false,
      isDuplicate: false,
      hasWatermark: false,
      readabilityScore: 97,
      overallQualityScore: 96,
      qualityStatus: 'High Quality'
    },
    {
      documentType: 'PAN Card',
      blurScore: 94,
      resolutionScore: 96,
      rotationAngle: 0,
      isCropped: false,
      isDuplicate: false,
      hasWatermark: false,
      readabilityScore: 95,
      overallQualityScore: 95,
      qualityStatus: 'High Quality'
    },
    {
      documentType: 'Electricity Bill',
      blurScore: 92,
      resolutionScore: 95,
      rotationAngle: 0,
      isCropped: false,
      isDuplicate: false,
      hasWatermark: false,
      readabilityScore: 94,
      overallQualityScore: 94,
      qualityStatus: 'High Quality'
    }
  ];

  // Dynamically calculate metrics from results array
  const totalFieldsCompared = results.length;
  const exactMatches = results.filter(r => r.matchStatus === 'Exact Match').length;
  const partialMatches = results.filter(r => r.matchStatus === 'Partial Match').length;
  const mismatches = results.filter(r => r.matchStatus === 'Mismatch').length;
  const missingFields = results.filter(r => r.matchStatus === 'Field Not Found').length;

  const totalConfidenceSum = results.reduce((sum, r) => sum + (r.confidenceScore || 0), 0);
  const overallScore = totalFieldsCompared > 0 ? Math.round(totalConfidenceSum / totalFieldsCompared) : 0;

  const identityFields = results.filter(r => ['Applicant Name', 'Aadhaar Number', 'PAN Number', 'Date of Birth', "Father's Name"].includes(r.fieldName));
  const identityMatchScore = identityFields.length > 0
    ? Math.round(identityFields.reduce((sum, r) => sum + r.confidenceScore, 0) / identityFields.length)
    : 0;

  const addressFields = results.filter(r => r.fieldName.toLowerCase().includes('address'));
  const addressMatchScore = addressFields.length > 0
    ? Math.round(addressFields.reduce((sum, r) => sum + r.confidenceScore, 0) / addressFields.length)
    : (overallScore > 0 ? Math.min(100, overallScore + 2) : 0);

  const summary: VerificationSummaryData = {
    applicationId: app.id,
    applicationNumber: app.applicationNumber,
    overallScore,
    identityMatchScore,
    addressMatchScore,
    ocrConfidenceScore: 97,
    documentQualityScore: 95,
    totalFieldsCompared,
    exactMatches,
    partialMatches,
    mismatches,
    missingFields,
    verificationStatus: overallScore >= 90 && mismatches === 0 ? 'Verified' : 'Pending Review',
    results,
    extractedDocuments,
    qualityMetrics,
    systemRecommendations: [
      `Identity match verified with ${identityMatchScore}% confidence across Aadhaar & PAN.`,
      `Address verified successfully against premises locality (${addressMatchScore}% confidence).`,
      "Father's name contains middle name variation ('Kumar'); manual CRO review option available.",
      overallScore >= 90 && mismatches === 0
        ? 'System Recommendation: Eligible for Immediate Document Verification Approval.'
        : 'System Recommendation: Requires CRO Manual Review & Remarks prior to approval.'
    ],
    processedAt: new Date().toISOString()
  };

  MOCK_VERIFICATION_CACHE[app.id] = summary;
  return summary;
};

export const getMockVerificationResults = (appId: string): VerificationSummaryData => {
  const apps = getMockApplications();
  const app = apps.find(a => a.id === appId || a.applicationNumber === appId);
  if (!app) throw new Error('Application not found');

  // Always return live verification results with extracted OCR field matches
  return runMockDocumentVerification(app);
};

export const saveMockVerificationDecision = (
  appId: string,
  action: string,
  remarks?: string,
  isOverride?: boolean,
  officerName: string = 'Officer 1 - Doc Verifier'
) => {
  const apps = getMockApplications();
  const app = apps.find(a => a.id === appId || a.applicationNumber === appId);
  if (!app) throw new Error('Application not found');

  const summary = getMockVerificationResults(app.id);
  summary.decision = action;
  summary.decisionRemarks = remarks;
  summary.isOverridden = !!isOverride;
  summary.verifiedByName = officerName;
  summary.verifiedAt = new Date().toISOString();
  summary.verificationStatus = (action === 'Approve' || action === 'Manual Override') ? 'Verified' : 'Rejected';

  if (action === 'Approve' || action === 'Manual Override') {
    app.currentStage = 'Load Survey';
    app.currentStatus = 'Pending Officer 2';
    app.assignedOfficer = 'Officer 2 - Tech Surveyor';
    if (app.documents) {
      app.documents.forEach(d => { d.verificationStatus = 'Verified'; });
    }
  } else if (action === 'Reject') {
    app.currentStatus = 'Rejected';
    if (app.documents) {
      app.documents.forEach(d => {
        d.verificationStatus = 'Rejected';
        d.rejectionReason = remarks || 'Verification rejected by CRO.';
      });
    }
  } else if (action === 'Request Re-upload' || action === 'Request Additional Document') {
    app.currentStatus = 'Correction Required';
    if (app.documents) {
      app.documents.forEach(d => {
        if (d.verificationStatus !== 'Verified') {
          d.verificationStatus = 'Rejected';
          d.rejectionReason = remarks || 'Re-upload requested by CRO.';
        }
      });
    }
  }

  setMockApplications(apps);

  const auditEntry: VerificationAuditEntry = {
    id: MOCK_VERIFICATION_AUDIT_LOGS.length + 1,
    userId: 4,
    employeeId: 'EMP002',
    userName: officerName,
    applicationNumber: app.applicationNumber,
    action: `Document Verification: ${action}`,
    verificationScore: summary.overallScore,
    previousStatus: 'Document Verification',
    newStatus: app.currentStage,
    isOverride: !!isOverride,
    remarks: remarks || '',
    ipAddress: '10.0.2.15',
    timestamp: new Date().toISOString()
  };
  MOCK_VERIFICATION_AUDIT_LOGS.push(auditEntry);

  writeAuditLog(4, officerName, `Verification ${action}`, 'DocumentVerification', app.applicationNumber, `CRO Decision: ${action}. Remarks: ${remarks || 'None'}`);

  return { success: true, application: app, verification: summary };
};

export const getMockVerificationAuditLogs = (appNumber: string) => {
  return MOCK_VERIFICATION_AUDIT_LOGS.filter(l => l.applicationNumber === appNumber);
};

// ==========================================
// ENTERPRISE ADMINISTRATION MODULE DATA STORE
// ==========================================

export interface MenuPageMaster {
  id: number;
  menuText: string;
  parentMenu: string;
  description: string;
  controller: string;
  method: string;
  textOrder: number;
  status: 'Active' | 'Inactive';
  route?: string;
  icon?: string;
}

export interface RoleMaster {
  id: number;
  roleName: string;
  description: string;
  status: 'Active' | 'Inactive';
  defaultDashboard?: string;
  landingPage?: string;
}

export interface UserRoleMapping {
  id: number;
  userType: 'EMPLOYEE' | 'CONSUMER' | 'ADMIN';
  userName: string;
  userId: string;
  baJsr: boolean;
  baSk: boolean;
  isActive: 'Yes' | 'No';
  role: string;
  department?: string;
  designation?: string;
}

export interface RoleMenuRight {
  roleName: string;
  menuId: number;
  menuName: string;
  isSelect: boolean;
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
  canReject?: boolean;
  canPrint?: boolean;
  canExport?: boolean;
  canUpload?: boolean;
  canDownload?: boolean;
}

export interface StageApprovalLevelSetting {
  id: number;
  serviceType: string;
  routeName: string;
  levelGroupName: string;
  stages: {
    stageName: string;
    level: number;
    isMandatory?: boolean;
    slaDays?: number;
    assignedRole?: string;
  }[];
}

const DEFAULT_PAGE_MASTERS: MenuPageMaster[] = [
  { id: 1, parentMenu: 'Master', menuText: 'Dashboard', description: 'Consumer Dashboard', controller: 'Department', method: 'Index', textOrder: 1, status: 'Active', route: '/admin' },
  { id: 2, parentMenu: 'Master', menuText: 'Connection Request', description: 'Connection Request', controller: '-', method: '-', textOrder: 2, status: 'Active', route: '/admin/applications' },
  { id: 3, parentMenu: 'Master', menuText: 'New Connection', description: 'New Connection', controller: '-', method: '-', textOrder: 1, status: 'Active', route: '/admin/applications' },
  { id: 4, parentMenu: 'New Connection', menuText: 'Permanent LT Connection', description: 'Low Tension Connection List Display', controller: 'Department', method: 'LTNewPowerConnectionList', textOrder: 2, status: 'Active', route: '/admin/applications?type=Permanent%20LT%20Connection' },
  { id: 5, parentMenu: 'New Connection', menuText: 'Permanent HT Connection', description: 'High Tension Connection List Display', controller: 'Department', method: 'HTNewPowerConnectionList', textOrder: 3, status: 'Active', route: '/admin/applications?type=Permanent%20HT%20Connection' },
  { id: 6, parentMenu: 'New Connection', menuText: 'Provisional Connection', description: 'New Provisional Connection List Display', controller: 'Department', method: 'Provisional_2KW_PowerConnList', textOrder: 1, status: 'Active', route: '/admin/applications?type=Provisional%20Connection' },
  { id: 7, parentMenu: 'Report', menuText: 'Report', description: 'Consumer Report', controller: '-', method: '-', textOrder: 12, status: 'Active', route: '/admin?tab=reports' },
  { id: 8, parentMenu: 'Report', menuText: 'Master Report', description: 'Master Report', controller: 'Department', method: 'MasterReport', textOrder: 1, status: 'Active', route: '/admin?tab=reports' },
  { id: 9, parentMenu: 'Report', menuText: 'Collection Report', description: 'Collection Report', controller: 'Department', method: 'CollectionReport', textOrder: 2, status: 'Active', route: '/admin?tab=reports' },
  { id: 10, parentMenu: 'New Connection', menuText: 'Temporary Connection', description: 'Temporary Connection', controller: 'Department', method: 'TemporaryPowerConnectionList', textOrder: 4, status: 'Active', route: '/admin/applications?type=Temporary%20Connection' },
];

const DEFAULT_ROLE_MASTERS: RoleMaster[] = [
  { id: 1, roleName: 'Admin', description: 'System Administrator with full access', status: 'Active' },
  { id: 2, roleName: 'Consumer', description: 'Public Portal Consumer', status: 'Active' },
  { id: 3, roleName: 'CRO', description: 'Customer Relation Officer', status: 'Active' },
  { id: 4, roleName: 'Final Approver', description: 'Final Stage Authority', status: 'Active' },
  { id: 5, roleName: 'Meter Section', description: 'Meter Testing & Energization Team', status: 'Active' },
  { id: 6, roleName: 'Survey & Estimate', description: 'Technical Surveyor & Estimator', status: 'Active' },
  { id: 7, roleName: 'L-1 Approver', description: 'Level 1 Verification Approver', status: 'Active' },
  { id: 8, roleName: 'Job allotment, RFC & Energization', description: 'Field Execution Officer', status: 'Active' },
  { id: 9, roleName: 'Billing Approver', description: 'Demand Note & Billing Specialist', status: 'Active' },
  { id: 10, roleName: 'PSD Notice Manager', description: 'Power Supply Disconnection Manager', status: 'Active' },
  { id: 11, roleName: 'Auditor', description: 'System Audit Inspector', status: 'Active' },
];

const DEFAULT_USER_ROLE_MAPPINGS: UserRoleMapping[] = [
  { id: 1, userType: 'EMPLOYEE', userName: 'Priyadarshan', userId: '842249', baJsr: true, baSk: true, isActive: 'Yes', role: 'Auditor', department: 'Audit Dept', designation: 'Senior Auditor' },
  { id: 2, userType: 'EMPLOYEE', userName: 'Shiv Kumar', userId: '155277', baJsr: true, baSk: true, isActive: 'Yes', role: 'Auditor', department: 'Inspection', designation: 'Officer' },
  { id: 3, userType: 'CONSUMER', userName: 'Mukesh Kumar', userId: '9234458422', baJsr: true, baSk: true, isActive: 'Yes', role: 'Auditor', department: 'Consumer Services', designation: 'Consumer' },
  { id: 4, userType: 'EMPLOYEE', userName: 'Amarnath Rao', userId: '151518', baJsr: true, baSk: false, isActive: 'Yes', role: 'Billing Approver', department: 'Finance & Billing', designation: 'Billing Officer' },
  { id: 5, userType: 'EMPLOYEE', userName: 'Anil Kumar Mishra', userId: '172515', baJsr: false, baSk: false, isActive: 'No', role: 'Billing Approver', department: 'Accounts', designation: 'Assistant Manager' },
  { id: 6, userType: 'EMPLOYEE', userName: 'Bijay Kumar Sharma', userId: '155228', baJsr: true, baSk: true, isActive: 'Yes', role: 'Billing Approver', department: 'Billing Section', designation: 'Officer' },
  { id: 7, userType: 'EMPLOYEE', userName: 'Dr. Nilima Mahato', userId: '155068', baJsr: true, baSk: true, isActive: 'Yes', role: 'Billing Approver', department: 'Administration', designation: 'Deputy Manager' },
  { id: 8, userType: 'EMPLOYEE', userName: 'Jitendra Kr. Thakur', userId: '155032', baJsr: true, baSk: true, isActive: 'Yes', role: 'Billing Approver', department: 'Commercial', designation: 'Commercial Manager' },
  { id: 9, userType: 'EMPLOYEE', userName: 'Leena', userId: '155684', baJsr: false, baSk: true, isActive: 'Yes', role: 'Billing Approver', department: 'Billing Section', designation: 'Executive' },
  { id: 10, userType: 'EMPLOYEE', userName: 'Manjula Sharma', userId: '172690', baJsr: true, baSk: true, isActive: 'Yes', role: 'Billing Approver', department: 'Customer Relations', designation: 'CRO Officer' }
];

const DEFAULT_MENU_RIGHTS: RoleMenuRight[] = [
  { roleName: 'Admin', menuId: 1, menuName: 'ApplicationHistory', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Admin', menuId: 2, menuName: 'Approval Setting -> Route Master', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Admin', menuId: 3, menuName: 'Approval Setting -> Service Wise Stage Approval Level Setting', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Admin', menuId: 4, menuName: 'ChangePassword', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Admin', menuId: 5, menuName: 'Dashboard', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Admin', menuId: 6, menuName: 'Exception Application -> Archived Application', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Admin', menuId: 7, menuName: 'Exception Application -> Hold Applications', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Admin', menuId: 8, menuName: 'Exception Application -> Regretted Applications', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Admin', menuId: 9, menuName: 'List of SR Tree Structure', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Admin', menuId: 10, menuName: 'Master -> Land Type', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Admin', menuId: 11, menuName: 'Master -> Menu Rights', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Admin', menuId: 12, menuName: 'Master -> Page Master', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Consumer', menuId: 101, menuName: 'Dashboard', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canReject: false, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Consumer', menuId: 102, menuName: 'New Application', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canReject: false, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Consumer', menuId: 103, menuName: 'Water Tanker', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canReject: false, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Consumer', menuId: 104, menuName: 'My Applications', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canReject: false, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Consumer', menuId: 105, menuName: 'Draft Applications', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canReject: false, canPrint: true, canExport: true, canUpload: true, canDownload: true },
  { roleName: 'Consumer', menuId: 106, menuName: 'Track Application', isSelect: true, canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canReject: false, canPrint: true, canExport: true, canUpload: true, canDownload: true }
];

const DEFAULT_STAGE_APPROVAL_LEVELS: StageApprovalLevelSetting[] = [
  {
    id: 1,
    serviceType: 'New Provisional Power Connection',
    routeName: 'New Connection_JSR',
    levelGroupName: 'Level Group 1',
    stages: [
      { stageName: 'Load Survey Details', level: 1 },
      { stageName: 'Land Survey Details', level: 1 },
      { stageName: 'Bill Verification', level: 2 },
      { stageName: 'Load Survey Approval', level: 1 },
      { stageName: 'Estimate Details', level: 1 },
      { stageName: 'Estimate Approval', level: 1 },
      { stageName: 'Demand Note Details', level: 1 }
    ]
  }
];

export const getMockPageMasters = (): MenuPageMaster[] => {
  const data = localStorage.getItem('tata_page_masters');
  if (data) return JSON.parse(data);
  localStorage.setItem('tata_page_masters', JSON.stringify(DEFAULT_PAGE_MASTERS));
  return DEFAULT_PAGE_MASTERS;
};

export const setMockPageMasters = (items: MenuPageMaster[]) => {
  localStorage.setItem('tata_page_masters', JSON.stringify(items));
};

export const getMockRoleMasters = (): RoleMaster[] => {
  const data = localStorage.getItem('tata_role_masters');
  if (data) return JSON.parse(data);
  localStorage.setItem('tata_role_masters', JSON.stringify(DEFAULT_ROLE_MASTERS));
  return DEFAULT_ROLE_MASTERS;
};

export const setMockRoleMasters = (items: RoleMaster[]) => {
  localStorage.setItem('tata_role_masters', JSON.stringify(items));
};

export const getMockUserRoleMappings = (): UserRoleMapping[] => {
  const data = localStorage.getItem('tata_user_role_mappings');
  if (data) return JSON.parse(data);
  localStorage.setItem('tata_user_role_mappings', JSON.stringify(DEFAULT_USER_ROLE_MAPPINGS));
  return DEFAULT_USER_ROLE_MAPPINGS;
};

export const setMockUserRoleMappings = (items: UserRoleMapping[]) => {
  localStorage.setItem('tata_user_role_mappings', JSON.stringify(items));
};

export const getMockMenuRights = (): RoleMenuRight[] => {
  const data = localStorage.getItem('tata_menu_rights');
  if (data) return JSON.parse(data);
  localStorage.setItem('tata_menu_rights', JSON.stringify(DEFAULT_MENU_RIGHTS));
  return DEFAULT_MENU_RIGHTS;
};

export const setMockMenuRights = (items: RoleMenuRight[]) => {
  localStorage.setItem('tata_menu_rights', JSON.stringify(items));
};

export const getMockStageApprovalLevels = (): StageApprovalLevelSetting[] => {
  const data = localStorage.getItem('tata_stage_approval_levels');
  if (data) return JSON.parse(data);
  localStorage.setItem('tata_stage_approval_levels', JSON.stringify(DEFAULT_STAGE_APPROVAL_LEVELS));
  return DEFAULT_STAGE_APPROVAL_LEVELS;
};

export const setMockStageApprovalLevels = (items: StageApprovalLevelSetting[]) => {
  localStorage.setItem('tata_stage_approval_levels', JSON.stringify(items));
};

