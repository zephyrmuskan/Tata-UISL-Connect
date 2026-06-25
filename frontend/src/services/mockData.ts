// Mock Data Store with LocalStorage Persistence for Tata UISL Portal

export interface User {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: 'Customer' | 'Admin';
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
  fullName: string;
  fatherName: string;
  motherName: string;
  gender: string;
  dateOfBirth: string;
  aadhaarNumber: string;
  panNumber: string;
  occupation: string;
  annualIncome: number;
  
  // Section 2 - Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  district: string;
  pinCode: string;
  
  // Section 3 - Connection Details
  connectionTypeId: number;
  connectionTypeName: string;
  connectionCategory: string; // Domestic, Commercial, Industrial, Temporary
  applicationType: 'New Connection' | 'Name Transfer' | 'Load Enhancement' | 'Temporary Connection';
  
  // Section 4 - Property Details
  propertyType: string;
  houseNumber: string;
  wardNumber: string;
  area: string;
  landmark: string;
  
  // System Fields
  currentStatus: 'Submitted' | 'Document Verification' | 'Under Review' | 'Approved' | 'Rejected' | 'Connection Completed';
  submittedDate: string;
  assignedOfficer: string;
  profileCompletion: number;
  documents: ApplicationDocument[];
  remarks: ApplicationRemark[];
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
  { id: 1, fullName: 'System Administrator', email: 'admin@tatauisl.com', mobileNumber: '9999999999', role: 'Admin', isActive: true, createdAt: '2026-01-01T10:00:00Z' },
  { id: 2, fullName: 'Rajesh Kumar', email: 'rajesh.kumar@gmail.com', mobileNumber: '9876543210', role: 'Customer', isActive: true, createdAt: '2026-06-01T12:00:00Z' },
  { id: 3, fullName: 'Priya Sharma', email: 'priya.sharma@yahoo.com', mobileNumber: '8765432109', role: 'Customer', isActive: true, createdAt: '2026-06-10T14:30:00Z' }
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
    currentStatus: 'Connection Completed',
    submittedDate: '2026-06-15T09:15:00Z',
    assignedOfficer: 'Officer Alok Prasad',
    profileCompletion: 100,
    documents: [
      { id: 'doc_101', documentType: 'Aadhaar Card', fileName: 'aadhaar_rajesh.pdf', fileSize: 1024000, filePath: '#', verificationStatus: 'Verified', uploadedAt: '2026-06-15T09:20:00Z' },
      { id: 'doc_102', documentType: 'PAN Card', fileName: 'pan_rajesh.jpg', fileSize: 450000, filePath: '#', verificationStatus: 'Verified', uploadedAt: '2026-06-15T09:21:00Z' },
      { id: 'doc_103', documentType: 'Ownership Proof', fileName: 'property_deed.pdf', fileSize: 5400000, filePath: '#', verificationStatus: 'Verified', uploadedAt: '2026-06-15T09:23:00Z' }
    ],
    remarks: [
      { id: 'rem_101', applicationId: 'app_001', officerName: 'Officer Alok Prasad', remarks: 'Physical connection completed, smart meter installed.', createdAt: '2026-06-20T16:00:00Z' }
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
    currentStatus: 'Document Verification',
    submittedDate: '2026-06-22T11:45:00Z',
    assignedOfficer: 'Officer Neha Sen',
    profileCompletion: 80,
    documents: [
      { id: 'doc_201', documentType: 'Aadhaar Card', fileName: 'priya_aadhaar.pdf', fileSize: 1204000, filePath: '#', verificationStatus: 'Pending', uploadedAt: '2026-06-22T11:50:00Z' },
      { id: 'doc_202', documentType: 'PAN Card', fileName: 'priya_pan.png', fileSize: 300000, filePath: '#', verificationStatus: 'Rejected', uploadedAt: '2026-06-22T11:51:00Z', rejectionReason: 'The PAN card image is blurry. Please re-upload a clear copy.' },
      { id: 'doc_203', documentType: 'Passport Size Photo', fileName: 'photo.jpg', fileSize: 150000, filePath: '#', verificationStatus: 'Verified', uploadedAt: '2026-06-22T11:52:00Z' }
    ],
    remarks: [
      { id: 'rem_201', applicationId: 'app_002', officerName: 'Officer Neha Sen', remarks: 'Requested re-upload of PAN card due to poor scan quality.', createdAt: '2026-06-23T10:00:00Z' }
    ]
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: 'not_001', userId: 2, title: 'Application Submitted Successfully', message: 'Your application TATA-UISL-2026-98124 has been submitted. Tracking has been initialized.', type: 'Success', isRead: true, createdAt: '2026-06-15T09:25:00Z' },
  { id: 'not_002', userId: 2, title: 'Connection Setup Scheduled', message: 'An installation officer is scheduled to visit your property on 2026-06-19.', type: 'Info', isRead: true, createdAt: '2026-06-18T10:00:00Z' },
  { id: 'not_003', userId: 2, title: 'Power Connection Activated', message: 'Congratulations! Your connection under application number TATA-UISL-2026-98124 is now active.', type: 'Success', isRead: false, createdAt: '2026-06-20T16:05:00Z' },
  { id: 'not_004', userId: 3, title: 'Document Re-upload Required', message: 'Officer Neha Sen has requested a re-upload of your PAN Card because the image is blurry.', type: 'Warning', isRead: false, createdAt: '2026-06-23T10:05:00Z' }
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

export const getMockApplications = (): Application[] => getStorageItem('tata_applications', DEFAULT_APPLICATIONS);
export const setMockApplications = (apps: Application[]) => setStorageItem('tata_applications', apps);

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
