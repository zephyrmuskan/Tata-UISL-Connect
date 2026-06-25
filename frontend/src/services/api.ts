// API and Mock Layer Integration for Tata UISL Portal
import axios from 'axios';
import * as mockDb from './mockData';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'; // Default to true if not explicitly 'false'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('tata_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to delay mock operations to simulate network latency
const mockDelay = <T>(result: T): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(result), 400));
};

// -------------------------------------------------------------
// AUTH SERVICE
// -------------------------------------------------------------
export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: mockDb.User }> => {
    if (USE_MOCK_API) {
      const users = mockDb.getMockUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) throw new Error('User not found. Please register.');
      if (!user.isActive) throw new Error('Your account is deactivated. Contact Admin.');
      
      // Mock Check (Admin uses Admin@123, Customers can use anything for demo)
      if (user.role === 'Admin' && password !== 'Admin@123') {
        throw new Error('Invalid Admin password. Use "Admin@123" for demo.');
      }
      
      const token = 'mock_jwt_token_' + user.id + '_' + Date.now();
      localStorage.setItem('tata_auth_token', token);
      localStorage.setItem('tata_current_user', JSON.stringify(user));
      mockDb.writeAuditLog(user.id, user.fullName, 'Login', 'Users', user.id.toString(), 'Successful login');
      
      return mockDelay({ token, user });
    } else {
      const response = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('tata_auth_token', response.data.token);
      localStorage.setItem('tata_current_user', JSON.stringify(response.data.user));
      return response.data;
    }
  },

  register: async (fullName: string, email: string, mobileNumber: string): Promise<{ message: string }> => {
    if (USE_MOCK_API) {
      const users = mockDb.getMockUsers();
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) throw new Error('Email already registered.');
      
      const newUser: mockDb.User = {
        id: users.length + 1,
        fullName,
        email,
        mobileNumber,
        role: 'Customer',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      mockDb.setMockUsers(users);
      mockDb.writeAuditLog(newUser.id, newUser.fullName, 'Registration', 'Users', newUser.id.toString(), 'User registered self');
      
      // Seed initial OTP request
      localStorage.setItem('tata_pending_otp_email', email);
      
      return mockDelay({ message: 'Registration successful! Verification OTP sent to ' + email });
    } else {
      const response = await apiClient.post('/auth/register', { fullName, email, mobileNumber });
      return response.data;
    }
  },

  verifyOtp: async (email: string, otp: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
      if (otp === '123456' || otp === '000000') {
        localStorage.removeItem('tata_pending_otp_email');
        return mockDelay({ success: true });
      }
      throw new Error('Invalid OTP. Use demo OTP: "123456"');
    } else {
      const response = await apiClient.post('/auth/verify-otp', { email, otp });
      return response.data;
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    if (USE_MOCK_API) {
      const users = mockDb.getMockUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) throw new Error('No user found with this email.');
      return mockDelay({ message: 'Password reset link sent to your registered email.' });
    } else {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    }
  },

  resetPassword: async (email: string, token: string, newPassword: string): Promise<{ message: string }> => {
    if (USE_MOCK_API) {
      return mockDelay({ message: 'Password reset successfully. You can now login.' });
    } else {
      const response = await apiClient.post('/auth/reset-password', { email, token, newPassword });
      return response.data;
    }
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    const userJson = localStorage.getItem('tata_current_user');
    if (!userJson) throw new Error('User not logged in.');
    const currentUser = JSON.parse(userJson) as mockDb.User;

    if (USE_MOCK_API) {
      mockDb.writeAuditLog(currentUser.id, currentUser.fullName, 'Change Password', 'Users', currentUser.id.toString(), 'Changed password successfully');
      return mockDelay({ message: 'Password changed successfully!' });
    } else {
      const response = await apiClient.post('/profile/change-password', { oldPassword, newPassword });
      return response.data;
    }
  },

  getCurrentUser: (): mockDb.User | null => {
    const userJson = localStorage.getItem('tata_current_user');
    return userJson ? JSON.parse(userJson) : null;
  },

  logout: () => {
    const user = authService.getCurrentUser();
    if (user && USE_MOCK_API) {
      mockDb.writeAuditLog(user.id, user.fullName, 'Logout', 'Users', user.id.toString(), 'Successful logout');
    }
    localStorage.removeItem('tata_auth_token');
    localStorage.removeItem('tata_current_user');
  }
};

// -------------------------------------------------------------
// APPLICATION SERVICE
// -------------------------------------------------------------
export const applicationService = {
  submitApplication: async (applicationData: Partial<mockDb.Application>): Promise<mockDb.Application> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const apps = mockDb.getMockApplications();
      const connTypes = mockDb.getMockConnectionTypes();
      
      const connType = connTypes.find(t => t.id === Number(applicationData.connectionTypeId)) || connTypes[0];
      const appNum = 'TATA-UISL-2026-' + Math.floor(10000 + Math.random() * 90000);
      
      const newApp: mockDb.Application = {
        id: 'app_' + Date.now(),
        applicationNumber: appNum,
        customerId: user.id,
        customerName: user.fullName,
        customerEmail: user.email,
        customerMobile: user.mobileNumber,
        
        fullName: applicationData.fullName || user.fullName,
        fatherName: applicationData.fatherName || '',
        motherName: applicationData.motherName || '',
        gender: applicationData.gender || 'Male',
        dateOfBirth: applicationData.dateOfBirth || '',
        aadhaarNumber: applicationData.aadhaarNumber || '',
        panNumber: applicationData.panNumber || '',
        occupation: applicationData.occupation || '',
        annualIncome: Number(applicationData.annualIncome) || 0,
        
        addressLine1: applicationData.addressLine1 || '',
        addressLine2: applicationData.addressLine2 || '',
        city: applicationData.city || '',
        state: applicationData.state || '',
        district: applicationData.district || '',
        pinCode: applicationData.pinCode || '',
        
        connectionTypeId: connType.id,
        connectionTypeName: connType.name,
        connectionCategory: connType.category,
        applicationType: applicationData.applicationType || 'New Connection',
        
        propertyType: applicationData.propertyType || '',
        houseNumber: applicationData.houseNumber || '',
        wardNumber: applicationData.wardNumber || '',
        area: applicationData.area || '',
        landmark: applicationData.landmark || '',
        
        currentStatus: 'Submitted',
        submittedDate: new Date().toISOString(),
        assignedOfficer: 'Unassigned',
        profileCompletion: 80,
        documents: applicationData.documents || [],
        remarks: []
      };

      apps.unshift(newApp);
      mockDb.setMockApplications(apps);
      mockDb.addNotification(user.id, 'Application Submitted', `Application ${appNum} submitted. Complete document upload to proceed.`, 'Success');
      mockDb.writeAuditLog(user.id, user.fullName, 'Submit Application', 'Applications', newApp.id, `Created application ${appNum}`);
      
      return mockDelay(newApp);
    } else {
      const response = await apiClient.post('/applications', applicationData);
      return response.data;
    }
  },

  getApplications: async (): Promise<mockDb.Application[]> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const apps = mockDb.getMockApplications();
      if (user.role === 'Admin') {
        return mockDelay(apps);
      } else {
        return mockDelay(apps.filter(a => a.customerId === user.id));
      }
    } else {
      const response = await apiClient.get('/applications');
      return response.data;
    }
  },

  getApplicationById: async (id: string): Promise<mockDb.Application> => {
    if (USE_MOCK_API) {
      const apps = mockDb.getMockApplications();
      const app = apps.find(a => a.id === id);
      if (!app) throw new Error('Application not found');
      return mockDelay(app);
    } else {
      const response = await apiClient.get(`/applications/${id}`);
      return response.data;
    }
  },

  updateApplicationStatus: async (
    id: string, 
    status: mockDb.Application['currentStatus'], 
    remarks: string
  ): Promise<mockDb.Application> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const apps = mockDb.getMockApplications();
      const appIndex = apps.findIndex(a => a.id === id);
      if (appIndex === -1) throw new Error('Application not found');

      const app = apps[appIndex];
      app.currentStatus = status;
      
      if (remarks) {
        const remarkObj: mockDb.ApplicationRemark = {
          id: 'rem_' + Date.now(),
          applicationId: id,
          officerName: user.fullName,
          remarks: remarks,
          createdAt: new Date().toISOString()
        };
        app.remarks.push(remarkObj);
      }

      apps[appIndex] = app;
      mockDb.setMockApplications(apps);
      
      // Notify customer
      mockDb.addNotification(
        app.customerId, 
        `Application Status: ${status}`, 
        `Your application ${app.applicationNumber} status is now: ${status}. Remarks: ${remarks || 'None'}`,
        status === 'Rejected' ? 'Error' : status === 'Approved' ? 'Success' : 'Info'
      );
      
      mockDb.writeAuditLog(user.id, user.fullName, 'Status Change', 'Applications', id, `Changed status of ${app.applicationNumber} to ${status}`);

      return mockDelay(app);
    } else {
      const response = await apiClient.put(`/applications/${id}/status`, { status, remarks });
      return response.data;
    }
  },

  assignOfficer: async (id: string, officerName: string): Promise<mockDb.Application> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const apps = mockDb.getMockApplications();
      const appIndex = apps.findIndex(a => a.id === id);
      if (appIndex === -1) throw new Error('Application not found');

      const app = apps[appIndex];
      app.assignedOfficer = officerName;
      
      apps[appIndex] = app;
      mockDb.setMockApplications(apps);
      
      mockDb.writeAuditLog(user.id, user.fullName, 'Assign Officer', 'Applications', id, `Assigned officer ${officerName} to ${app.applicationNumber}`);

      return mockDelay(app);
    } else {
      const response = await apiClient.put(`/applications/${id}/assign`, { officerName });
      return response.data;
    }
  }
};

// -------------------------------------------------------------
// DOCUMENT SERVICE
// -------------------------------------------------------------
export const documentService = {
  uploadDocument: async (
    applicationId: string, 
    documentType: string, 
    fileName: string, 
    fileSize: number, 
    fileBase64: string
  ): Promise<mockDb.ApplicationDocument> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const apps = mockDb.getMockApplications();
      const appIndex = apps.findIndex(a => a.id === applicationId);
      if (appIndex === -1) throw new Error('Application not found');

      const app = apps[appIndex];
      
      const newDoc: mockDb.ApplicationDocument = {
        id: 'doc_' + Date.now() + '_' + Math.floor(Math.random() * 100),
        documentType,
        fileName,
        fileSize,
        filePath: fileBase64, // Real base64 storage
        verificationStatus: 'Pending',
        uploadedAt: new Date().toISOString()
      };

      // Remove existing document of the same type if present (replaces it)
      app.documents = app.documents.filter(d => d.documentType !== documentType);
      app.documents.push(newDoc);
      
      // Calculate profile completion based on required docs uploaded (e.g. 7 required docs)
      const reqDocsCount = mockDb.getMockSettings().requiredDocuments.length;
      const uploadedReqCount = app.documents.filter(d => 
        mockDb.getMockSettings().requiredDocuments.includes(d.documentType)
      ).length;
      app.profileCompletion = Math.min(100, Math.round(((uploadedReqCount) / reqDocsCount) * 100));

      apps[appIndex] = app;
      mockDb.setMockApplications(apps);
      
      mockDb.writeAuditLog(user.id, user.fullName, 'Upload Document', 'Documents', newDoc.id, `Uploaded ${documentType} for ${app.applicationNumber}`);

      return mockDelay(newDoc);
    } else {
      const response = await apiClient.post(`/applications/${applicationId}/documents`, { documentType, fileName, fileSize, fileBase64 });
      return response.data;
    }
  },

  verifyDocument: async (
    applicationId: string, 
    documentId: string, 
    status: 'Verified' | 'Rejected', 
    reason?: string
  ): Promise<mockDb.Application> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const apps = mockDb.getMockApplications();
      const appIndex = apps.findIndex(a => a.id === applicationId);
      if (appIndex === -1) throw new Error('Application not found');

      const app = apps[appIndex];
      const docIndex = app.documents.findIndex(d => d.id === documentId);
      if (docIndex === -1) throw new Error('Document not found');

      app.documents[docIndex].verificationStatus = status;
      app.documents[docIndex].rejectionReason = reason;
      
      apps[appIndex] = app;
      mockDb.setMockApplications(apps);
      
      // Notify customer
      if (status === 'Rejected') {
        mockDb.addNotification(
          app.customerId,
          'Document Rejected',
          `Your ${app.documents[docIndex].documentType} in application ${app.applicationNumber} was rejected. Reason: ${reason}`,
          'Warning'
        );
      } else {
        mockDb.addNotification(
          app.customerId,
          'Document Verified',
          `Your ${app.documents[docIndex].documentType} has been verified successfully.`,
          'Success'
        );
      }
      
      mockDb.writeAuditLog(user.id, user.fullName, 'Verify Document', 'Documents', documentId, `Verified ${app.documents[docIndex].documentType} as ${status}`);

      return mockDelay(app);
    } else {
      const response = await apiClient.put(`/applications/${applicationId}/documents/${documentId}/verify`, { status, reason });
      return response.data;
    }
  }
};

// -------------------------------------------------------------
// NOTIFICATION SERVICE
// -------------------------------------------------------------
export const notificationService = {
  getNotifications: async (): Promise<mockDb.Notification[]> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const notifs = mockDb.getMockNotifications();
      return mockDelay(notifs.filter(n => n.userId === user.id));
    } else {
      const response = await apiClient.get('/notifications');
      return response.data;
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    if (USE_MOCK_API) {
      const notifs = mockDb.getMockNotifications();
      const index = notifs.findIndex(n => n.id === id);
      if (index !== -1) {
        notifs[index].isRead = true;
        mockDb.setMockNotifications(notifs);
      }
      return mockDelay(undefined);
    } else {
      await apiClient.put(`/notifications/${id}/read`);
    }
  },

  sendCustomNotification: async (userId: number, title: string, message: string, type: 'Info' | 'Success' | 'Warning' | 'Error'): Promise<void> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      mockDb.addNotification(userId, title, message, type);
      mockDb.writeAuditLog(user.id, user.fullName, 'Send Notification', 'Notifications', undefined, `Sent custom notification to User ID ${userId}`);
      return mockDelay(undefined);
    } else {
      await apiClient.post('/admin/notifications', { userId, title, message, type });
    }
  }
};

// -------------------------------------------------------------
// CUSTOMER SERVICE (ADMIN ACTIONS)
// -------------------------------------------------------------
export const customerService = {
  getCustomers: async (): Promise<mockDb.User[]> => {
    if (USE_MOCK_API) {
      const users = mockDb.getMockUsers();
      return mockDelay(users.filter(u => u.role === 'Customer'));
    } else {
      const response = await apiClient.get('/admin/customers');
      return response.data;
    }
  },

  toggleCustomerStatus: async (id: number): Promise<mockDb.User[]> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const users = mockDb.getMockUsers();
      const index = users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      
      users[index].isActive = !users[index].isActive;
      mockDb.setMockUsers(users);
      
      mockDb.writeAuditLog(user.id, user.fullName, 'Toggle Active Status', 'Users', id.toString(), `Toggled status of user ${users[index].email} to ${users[index].isActive}`);
      
      return mockDelay(users.filter(u => u.role === 'Customer'));
    } else {
      const response = await apiClient.put(`/admin/customers/${id}/toggle`);
      return response.data;
    }
  },

  resetCustomerPassword: async (id: number): Promise<{ message: string }> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const users = mockDb.getMockUsers();
      const targetUser = users.find(u => u.id === id);
      if (!targetUser) throw new Error('User not found');
      
      mockDb.writeAuditLog(user.id, user.fullName, 'Reset Password', 'Users', id.toString(), `Reset password for user ${targetUser.email}`);
      return mockDelay({ message: `Password reset link/token generated successfully for ${targetUser.fullName}.` });
    } else {
      const response = await apiClient.post(`/admin/customers/${id}/reset-password`);
      return response.data;
    }
  }
};

// -------------------------------------------------------------
// SETTINGS SERVICE
// -------------------------------------------------------------
export const settingsService = {
  getSettings: async () => {
    if (USE_MOCK_API) {
      return mockDelay(mockDb.getMockSettings());
    } else {
      const response = await apiClient.get('/settings');
      return response.data;
    }
  },

  updateSettings: async (settingsData: any) => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const current = mockDb.getMockSettings();
      const updated = { ...current, ...settingsData };
      mockDb.setMockSettings(updated);
      mockDb.writeAuditLog(user.id, user.fullName, 'Update Settings', 'Settings', undefined, 'System configurations modified');
      return mockDelay(updated);
    } else {
      const response = await apiClient.put('/settings', settingsData);
      return response.data;
    }
  },

  getConnectionTypes: async (): Promise<mockDb.ConnectionType[]> => {
    if (USE_MOCK_API) {
      return mockDelay(mockDb.getMockConnectionTypes());
    } else {
      const response = await apiClient.get('/settings/connection-types');
      return response.data;
    }
  },

  saveConnectionType: async (type: Partial<mockDb.ConnectionType>): Promise<mockDb.ConnectionType[]> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const types = mockDb.getMockConnectionTypes();
      if (type.id) {
        const idx = types.findIndex(t => t.id === type.id);
        if (idx !== -1) types[idx] = { ...types[idx], ...type } as mockDb.ConnectionType;
      } else {
        const newType: mockDb.ConnectionType = {
          id: types.length + 1,
          name: type.name || '',
          category: type.category || 'Other'
        };
        types.push(newType);
      }
      mockDb.setMockConnectionTypes(types);
      mockDb.writeAuditLog(user.id, user.fullName, 'Save Connection Type', 'ConnectionTypes', type.id?.toString() || 'New', `Saved connection type: ${type.name}`);
      return mockDelay(types);
    } else {
      const response = await apiClient.post('/settings/connection-types', type);
      return response.data;
    }
  },

  deleteConnectionType: async (id: number): Promise<mockDb.ConnectionType[]> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const types = mockDb.getMockConnectionTypes();
      const filtered = types.filter(t => t.id !== id);
      mockDb.setMockConnectionTypes(filtered);
      mockDb.writeAuditLog(user.id, user.fullName, 'Delete Connection Type', 'ConnectionTypes', id.toString(), `Deleted connection type ID ${id}`);
      return mockDelay(filtered);
    } else {
      const response = await apiClient.delete(`/settings/connection-types/${id}`);
      return response.data;
    }
  },

  getAuditLogs: async (): Promise<mockDb.AuditLog[]> => {
    if (USE_MOCK_API) {
      return mockDelay(mockDb.getMockAuditLogs());
    } else {
      const response = await apiClient.get('/admin/audit-logs');
      return response.data;
    }
  }
};
