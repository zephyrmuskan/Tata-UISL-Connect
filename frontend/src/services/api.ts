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

// Extract API error messages if available for frontend toasts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(apiError));
  }
);

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
      
      const isDraft = applicationData.currentStatus === 'Draft';
      const currentStatus = isDraft ? 'Draft' : 'Pending Officer 1';
      const assignedOfficer = isDraft ? 'Unassigned' : 'Officer 1 - Doc Verifier';

      const newApp: mockDb.Application = {
        id: 'app_' + Date.now(),
        applicationNumber: appNum,
        customerId: user.id,
        customerName: user.fullName,
        customerEmail: user.email,
        customerMobile: user.mobileNumber,
        
        fullName: applicationData.fullName || user.fullName,
        fatherName: applicationData.relationshipType === 'Father' ? applicationData.relationshipName : (applicationData.fatherName || ''),
        motherName: applicationData.motherName || '',
        gender: applicationData.gender || 'Male',
        dateOfBirth: applicationData.dateOfBirth || '',
        aadhaarNumber: applicationData.identityCardType === 'Aadhaar Card' ? applicationData.identityCardNumber : (applicationData.aadhaarNumber || ''),
        panNumber: applicationData.identityCardType === 'PAN Card' ? applicationData.identityCardNumber : (applicationData.panNumber || ''),
        occupation: applicationData.occupation || '',
        annualIncome: Number(applicationData.annualIncome) || 0,

        createNewBp: applicationData.createNewBp ?? true,
        existingBpNo: applicationData.existingBpNo || '',
        businessArea: applicationData.businessArea || '',
        ownerOrgName: applicationData.ownerOrgName || '',
        relationshipType: applicationData.relationshipType || '',
        relationshipName: applicationData.relationshipName || '',
        identityCardType: applicationData.identityCardType || '',
        identityCardNumber: applicationData.identityCardNumber || '',
        phoneNumber: applicationData.phoneNumber || '',
        alternatePhoneNumber: applicationData.alternatePhoneNumber || '',
        emailId: applicationData.emailId || '',
        alternateEmailId: applicationData.alternateEmailId || '',
        vendorName: applicationData.vendorName || '',
        vendorCertificateNumber: applicationData.vendorCertificateNumber || '',
        
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
        
        currentStatus: currentStatus,
        currentStage: 'Application Verification',
        priority: applicationData.priority || 'Medium',
        dueDate: isDraft ? undefined : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
        submittedDate: new Date().toISOString(),
        assignedOfficer: assignedOfficer,
        profileCompletion: isDraft ? 25 : 50,
        documents: applicationData.documents || [],
        remarks: [],
        statusHistory: [
          {
            status: currentStatus,
            stage: 'Application Verification',
            updatedDate: new Date().toISOString(),
            updatedByName: user.fullName,
            notes: isDraft ? 'Draft connection request created.' : 'Connection request submitted by customer.'
          }
        ]
      };

      apps.unshift(newApp);
      mockDb.setMockApplications(apps);
      mockDb.addNotification(user.id, 'Application Registered', isDraft ? `Draft application ${appNum} created.` : `Application ${appNum} submitted.`, 'Success');
      mockDb.writeAuditLog(user.id, user.fullName, 'Submit Application', 'Applications', newApp.id, `Created application ${appNum}`);
      
      return mockDelay(newApp);
    } else {
      const response = await apiClient.post('/applications', applicationData);
      return response.data;
    }
  },

  importApplications: async (appsList: Partial<mockDb.Application>[]): Promise<{ message: string; count: number }> => {
    if (USE_MOCK_API) {
      const apps = mockDb.getMockApplications();
      const importedApps: mockDb.Application[] = appsList.map((a, index) => {
        const appNum = a.applicationNumber || 'TATA-UISL-2026-' + Math.floor(10000 + Math.random() * 90000);
        return {
          id: 'app_import_' + Date.now() + '_' + index,
          applicationNumber: appNum,
          customerId: 1,
          customerName: a.customerName || a.fullName || 'Imported Customer',
          customerEmail: a.customerEmail || 'imported@tata.com',
          customerMobile: a.customerMobile || '9142041131',
          fullName: a.fullName || a.customerName || 'Imported Applicant',
          fatherName: '',
          motherName: '',
          gender: 'Male',
          dateOfBirth: '1995-01-01',
          aadhaarNumber: '',
          panNumber: '',
          occupation: 'Business',
          annualIncome: 500000,
          createNewBp: true,
          existingBpNo: a.existingBpNo || '',
          businessArea: a.businessArea || 'JAMSHEDPUR',
          division: a.division || 'Electricity',
          ownerOrgName: '',
          relationshipType: '',
          relationshipName: '',
          identityCardType: '',
          identityCardNumber: '',
          phoneNumber: a.customerMobile || '9142041131',
          alternatePhoneNumber: '',
          emailId: a.customerEmail || 'imported@tata.com',
          alternateEmailId: '',
          vendorName: '',
          vendorCertificateNumber: '',
          addressLine1: a.addressLine1 || 'Jamshedpur Town',
          addressLine2: a.addressLine2 || '',
          city: 'Jamshedpur',
          state: 'Jharkhand',
          district: 'East Singhbhum',
          pinCode: '831001',
          connectionTypeId: 1,
          connectionTypeName: a.connectionTypeName || 'New LT Connection',
          connectionCategory: 'Domestic',
          applicationType: a.applicationType || 'New Connection',
          propertyType: 'Owned',
          houseNumber: '',
          wardNumber: '',
          area: '',
          landmark: '',
          voltageRequirement: '230V',
          loadRequirement: '2 kW',
          currentStatus: a.currentStatus || 'Pending Officer 1',
          currentStage: a.currentStage || 'Application Verification',
          priority: a.priority || 'Medium',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date().toISOString(),
          submittedDate: a.submittedDate || new Date().toISOString(),
          assignedOfficer: a.assignedOfficer || 'Officer 1 - Doc Verifier',
          profileCompletion: 50,
          documents: [],
          remarks: [],
          statusHistory: [
            {
              status: a.currentStatus || 'Pending Officer 1',
              stage: a.currentStage || 'Application Verification',
              updatedDate: new Date().toISOString(),
              updatedByName: 'System Import',
              notes: 'Imported via CSV template.'
            }
          ]
        };
      });

      const updatedApps = [...importedApps, ...apps];
      mockDb.setMockApplications(updatedApps);
      return mockDelay({ message: `Successfully imported ${importedApps.length} applications.`, count: importedApps.length });
    } else {
      const response = await apiClient.post('/applications/bulk', appsList);
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
  },

  addApplicationRemark: async (id: string, remarks: string): Promise<mockDb.Application> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const apps = mockDb.getMockApplications();
      const appIndex = apps.findIndex(a => a.id === id);
      if (appIndex === -1) throw new Error('Application not found');

      const app = apps[appIndex];
      const remarkObj: mockDb.ApplicationRemark = {
        id: 'rem_' + Date.now(),
        applicationId: id,
        officerName: user.fullName,
        remarks: remarks,
        createdAt: new Date().toISOString()
      };
      app.remarks = app.remarks || [];
      app.remarks.push(remarkObj);
      
      app.statusHistory = app.statusHistory || [];
      app.statusHistory.push({
        status: app.currentStatus,
        stage: app.currentStage,
        updatedDate: new Date().toISOString(),
        updatedByName: user.fullName,
        notes: `Feedback Added: ${remarks}`
      });

      apps[appIndex] = app;
      mockDb.setMockApplications(apps);
      mockDb.writeAuditLog(user.id, user.fullName, 'Add Remark', 'Applications', id, `Added remark/feedback to application.`);

      return mockDelay(app);
    } else {
      const response = await apiClient.post(`/applications/${id}/remarks`, { remarks });
      return response.data;
    }
  },

  updateApplication: async (id: string, applicationData: any): Promise<mockDb.Application> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const apps = mockDb.getMockApplications();
      const appIndex = apps.findIndex(a => a.id === id);
      if (appIndex === -1) throw new Error('Application not found');

      const app = apps[appIndex];
      // Merge updated fields
      Object.keys(applicationData).forEach(key => {
        (app as any)[key] = applicationData[key];
      });

      app.lastUpdated = new Date().toISOString();

      if (applicationData.currentStatus === 'Submitted') {
        if (app.currentStatus === 'Correction Required' && app.assignedOfficer && app.assignedOfficer !== 'Unassigned') {
          if (app.assignedOfficer.includes('Officer 1')) {
            app.currentStatus = 'Pending Officer 1';
          } else if (app.assignedOfficer.includes('Officer 2')) {
            app.currentStatus = 'Pending Officer 2';
          } else if (app.assignedOfficer.includes('Officer 3')) {
            app.currentStatus = 'Pending Officer 3';
          } else {
            app.currentStatus = 'Pending Officer 1';
          }
        } else {
          app.currentStatus = 'Pending Officer 1';
          app.currentStage = 'Application Verification';
          app.assignedOfficer = 'Officer 1 - Doc Verifier';
          app.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        }

        app.statusHistory = app.statusHistory || [];
        app.statusHistory.push({
          status: app.currentStatus,
          stage: app.currentStage,
          updatedDate: new Date().toISOString(),
          updatedByName: user.fullName,
          notes: 'Resubmitted by customer.'
        });
        mockDb.addNotification(app.customerId, 'Application Submitted', `Application ${app.applicationNumber} has been submitted.`, 'Success');
      } else {
        app.currentStatus = 'Draft';
      }

      apps[appIndex] = app;
      mockDb.setMockApplications(apps);
      mockDb.writeAuditLog(user.id, user.fullName, 'Update Application', 'Applications', id, `Updated connection request details.`);
      return mockDelay(app);
    } else {
      const response = await apiClient.put(`/applications/${id}`, applicationData);
      return response.data;
    }
  },

  updateStage: async (id: string, stageData: { newStage: string, action: string, remarks: string }): Promise<mockDb.Application> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const apps = mockDb.getMockApplications();
      const appIndex = apps.findIndex(a => a.id === id);
      if (appIndex === -1) throw new Error('Application not found');

      const app = apps[appIndex];
      const { action, remarks } = stageData;

      if (action === 'Reject') {
        app.currentStatus = 'Rejected';
        app.currentStage = 'Completed';
        app.assignedOfficer = 'Unassigned';
      } else if (action === 'Correction') {
        app.currentStatus = 'Correction Required';
      } else { // Approve
        if (app.currentStage === 'Application Verification') {
          app.currentStage = 'Document Verification';
          app.currentStatus = 'Pending Officer 1';
        } else if (app.currentStage === 'Document Verification') {
          app.currentStage = 'Load Survey';
          app.currentStatus = 'Pending Officer 2';
          app.assignedOfficer = 'Officer 2 - Tech Surveyor';
        } else if (app.currentStage === 'Load Survey') {
          app.currentStage = 'Land Survey';
          app.currentStatus = 'Pending Officer 2';
        } else if (app.currentStage === 'Land Survey') {
          app.currentStage = 'Bill Verification';
          app.currentStatus = 'Pending Officer 2';
        } else if (app.currentStage === 'Bill Verification') {
          app.currentStage = 'Estimate Details';
          app.currentStatus = 'Pending Officer 2';
        } else if (app.currentStage === 'Estimate Details') {
          app.currentStage = 'Estimate Approval';
          app.currentStatus = 'Pending Officer 2';
        } else if (app.currentStage === 'Estimate Approval') {
          app.currentStage = 'Demand Note';
          app.currentStatus = 'Pending Officer 3';
          app.assignedOfficer = 'Officer 3 - Approval Officer';
        } else if (app.currentStage === 'Demand Note') {
          app.currentStage = 'Connection Approval';
          app.currentStatus = 'Pending Officer 3';
        } else if (app.currentStage === 'Connection Approval') {
          app.currentStage = 'Job Allotment';
          app.currentStatus = 'Pending Officer 3';
        } else if (app.currentStage === 'Job Allotment') {
          app.currentStage = 'RFC Entry';
          app.currentStatus = 'Pending Officer 3';
        } else if (app.currentStage === 'RFC Entry') {
          app.currentStage = 'Energization';
          app.currentStatus = 'Pending Officer 3';
        } else if (app.currentStage === 'Energization') {
          app.currentStage = 'Move-In';
          app.currentStatus = 'Pending Officer 3';
        } else if (app.currentStage === 'Move-In') {
          app.currentStage = 'Completed';
          app.currentStatus = 'Completed';
          app.assignedOfficer = 'Unassigned';
        }
      }

      app.lastUpdated = new Date().toISOString();
      app.dueDate = app.currentStatus.startsWith('Pending') ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined;

      if (remarks) {
        app.remarks = app.remarks || [];
        app.remarks.push({
          id: 'rem_' + Date.now(),
          applicationId: id,
          officerName: user.fullName,
          remarks,
          createdAt: new Date().toISOString()
        });
      }

      app.statusHistory = app.statusHistory || [];
      app.statusHistory.push({
        status: app.currentStatus,
        stage: app.currentStage,
        updatedDate: new Date().toISOString(),
        updatedByName: user.fullName,
        notes: remarks || `Moved to stage ${app.currentStage}`
      });

      apps[appIndex] = app;
      mockDb.setMockApplications(apps);
      mockDb.writeAuditLog(user.id, user.fullName, `Workflow - ${action}`, 'Applications', id, `Transitioned application to ${app.currentStage}`);
      return mockDelay(app);
    } else {
      const response = await apiClient.put(`/applications/${id}/update-stage`, stageData);
      return response.data;
    }
  },

  deleteApplication: async (id: string): Promise<void> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (USE_MOCK_API) {
      const apps = mockDb.getMockApplications();
      const filtered = apps.filter(a => a.id !== id);
      mockDb.setMockApplications(filtered);
      mockDb.writeAuditLog(user.id, user.fullName, 'Delete Draft Application', 'Applications', id, `Deleted draft connection request ID ${id}`);
      return mockDelay(undefined);
    } else {
      await apiClient.delete(`/applications/${id}`);
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
      const userNotifs = notifs.filter(n => n.userId === user.id);
      
      if (userNotifs.length === 0) {
        if (user.id === 1) {
          const adminDefaults = [
            { id: 'not_005', userId: 1, title: 'New Application Pending', message: 'Application TATA-UISL-2026-98150 by Priya Sharma is pending Document Verification stage.', type: 'Info' as const, isRead: false, createdAt: new Date().toISOString() },
            { id: 'not_006', userId: 1, title: 'Database Backup Completed', message: 'The automated database backup finished successfully with zero errors.', type: 'Success' as const, isRead: true, createdAt: new Date().toISOString() },
            { id: 'not_007', userId: 1, title: 'SLA Breach Warning', message: 'Application TATA-UISL-2026-87123 is exceeding the SLA duration limit in Technical Assessment.', type: 'Warning' as const, isRead: false, createdAt: new Date().toISOString() }
          ];
          mockDb.setMockNotifications([...notifs, ...adminDefaults]);
          return mockDelay(adminDefaults);
        } else if (user.role === 'Admin') {
          const officerDefaults = [
            { id: 'not_008', userId: user.id, title: 'Pending Document Audit', message: 'You have new customer applications assigned to your desk for verification checks.', type: 'Info' as const, isRead: false, createdAt: new Date().toISOString() }
          ];
          mockDb.setMockNotifications([...notifs, ...officerDefaults]);
          return mockDelay(officerDefaults);
        }
      }
      return mockDelay(userNotifs);
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

export const workflowService = {
  addRoute: async (payload: any): Promise<any> => {
    if (USE_MOCK_API) {
      const routes = mockDb.getMockWorkflowRoutes();
      const newRoute = {
        id: Date.now(),
        name: payload.name,
        levelGroup: payload.levelGroup,
        stages: payload.stages.map((s: any, idx: number) => ({
          id: Date.now() + idx,
          routeId: Date.now(),
          stageName: s.stageName,
          sequenceOrder: idx + 1,
          workflowLevel: s.assignee,
          department: 'Operations',
          requiredAction: 'Required action'
        }))
      };
      routes.push(newRoute);
      localStorage.setItem('tata_wf_routes', JSON.stringify(routes));
      return mockDelay({ message: 'Route added successfully' });
    } else {
      const response = await apiClient.post('/workflow/routes', payload);
      return response.data;
    }
  },
  updateRoute: async (id: number, payload: any): Promise<any> => {
    if (USE_MOCK_API) {
      const routes = mockDb.getMockWorkflowRoutes();
      const idx = routes.findIndex(r => r.id === id);
      if (idx !== -1) {
        routes[idx] = {
          ...routes[idx],
          name: payload.name,
          levelGroup: payload.levelGroup,
          stages: payload.stages.map((s: any, sIdx: number) => ({
            id: Date.now() + sIdx,
            routeId: id,
            stageName: s.stageName,
            sequenceOrder: sIdx + 1,
            workflowLevel: s.assignee,
            department: 'Operations',
            requiredAction: 'Required action'
          }))
        };
        localStorage.setItem('tata_wf_routes', JSON.stringify(routes));
      }
      return mockDelay({ message: 'Route updated successfully' });
    } else {
      const response = await apiClient.put(`/workflow/routes/${id}`, payload);
      return response.data;
    }
  },

  deleteRoute: async (id: number): Promise<any> => {
    if (USE_MOCK_API) {
      const routes = mockDb.getMockWorkflowRoutes();
      const filtered = routes.filter(r => r.id !== id);
      localStorage.setItem('tata_wf_routes', JSON.stringify(filtered));
      return mockDelay({ message: 'Route deleted successfully' });
    } else {
      const response = await apiClient.delete(`/workflow/routes/${id}`);
      return response.data;
    }
  },
  getRoutes: async (): Promise<mockDb.WorkflowRoute[]> => {
    if (USE_MOCK_API) {
      return mockDelay(mockDb.getMockWorkflowRoutes());
    } else {
      const response = await apiClient.get('/workflow/routes');
      return response.data;
    }
  },

  getStages: async (routeId: number): Promise<mockDb.WorkflowStage[]> => {
    if (USE_MOCK_API) {
      const routes = mockDb.getMockWorkflowRoutes();
      const route = routes.find(r => r.id === routeId);
      return mockDelay(route ? route.stages : []);
    } else {
      const response = await apiClient.get(`/workflow/stages?routeId=${routeId}`);
      return response.data;
    }
  },

  getOfficers: async (): Promise<mockDb.OfficerDetail[]> => {
    if (USE_MOCK_API) {
      const users = mockDb.getMockUsers();
      const apps = mockDb.getMockApplications();
      const officers = users.filter(u => u.role === 'Admin' && u.officerRole !== 'Customer' && u.officerRole !== 'SuperAdmin');
      
      const details: mockDb.OfficerDetail[] = officers.map(o => {
        const workload = apps.filter(a => a.assignedOfficer === o.fullName && a.currentStatus !== 'Completed' && a.currentStatus !== 'Rejected').length;
        
        let dept = 'Technical Verification';
        if (o.officerRole === 'Officer2') {
          dept = 'Technical Survey';
        } else if (o.officerRole === 'Officer3') {
          dept = 'Approvals Department';
        }

        return {
          id: o.id,
          name: o.fullName,
          employeeId: 'EMP00' + o.id,
          department: dept,
          workload,
          availabilityStatus: o.isActive ? 'Available' : 'Unavailable'
        };
      });
      return mockDelay(details);
    } else {
      const response = await apiClient.get('/workflow/officers');
      return response.data;
    }
  },

  saveAssignment: async (applicationId: string, payload: { routeId: number; levelGroup: string; assignments: mockDb.OfficerAssignment[] }): Promise<any> => {
    if (USE_MOCK_API) {
      return mockDelay({ message: 'Assignments saved' });
    } else {
      const response = await apiClient.post('/workflow/assign', { applicationId, ...payload });
      return response.data;
    }
  },

  forwardWorkflow: async (applicationId: string, payload: { routeId: number; levelGroup: string; assignments: mockDb.OfficerAssignment[] }): Promise<any> => {
    if (USE_MOCK_API) {
      const apps = mockDb.getMockApplications();
      const appIdx = apps.findIndex(a => a.id === applicationId);
      if (appIdx === -1) throw new Error('Application not found');
      
      const app = apps[appIdx];
      const routes = mockDb.getMockWorkflowRoutes();
      const route = routes.find(r => r.id === payload.routeId);
      if (!route) throw new Error('Route not found');
      
      const stages = route.stages;
      const originalStage = app.currentStage;
      
      let nextStageName = '';
      let nextStageIdx = 0;
      
      if (originalStage === 'Application Verification' || originalStage === 'Draft') {
        nextStageName = stages[0].stageName;
      } else {
        const currObj = stages.find(s => s.stageName.toLowerCase() === originalStage.toLowerCase());
        if (!currObj) {
          nextStageName = stages[0].stageName;
        } else {
          const currIdx = stages.indexOf(currObj);
          nextStageIdx = currIdx + 1;
          if (nextStageIdx < stages.length) {
            nextStageName = stages[nextStageIdx].stageName;
          } else {
            nextStageName = 'Completed';
          }
        }
      }

      app.currentStage = nextStageName;
      app.lastUpdated = new Date().toISOString();
      
      if (nextStageName !== 'Completed') {
        const assignment = payload.assignments.find(a => a.stageName.toLowerCase() === nextStageName.toLowerCase());
        const user = mockDb.getMockUsers().find(u => u.id === assignment?.officerId);
        if (user) {
          app.assignedOfficer = user.fullName;
          const roleLbl = user.officerRole === 'Officer1' ? 'Officer 1' : user.officerRole === 'Officer2' ? 'Officer 2' : user.officerRole === 'Officer3' ? 'Officer 3' : 'Officer';
          app.currentStatus = ('Pending ' + roleLbl) as any;
        } else {
          app.assignedOfficer = 'Unassigned';
          app.currentStatus = 'Under Verification';
        }
      } else {
        app.assignedOfficer = 'Unassigned';
        app.currentStatus = 'Completed';
      }

      if (!app.statusHistory) {
        app.statusHistory = [];
      }

      app.statusHistory.push({
        status: app.currentStatus,
        stage: nextStageName,
        notes: `Workflow forwarded. Next target: ${app.currentStage}`,
        updatedDate: new Date().toISOString(),
        updatedByName: 'System Officer'
      });

      mockDb.writeAuditLog(1, 'System Officer', 'Forward Stage', 'Applications', app.id, `Forwarded to stage ${nextStageName}`);
      mockDb.setMockApplications(apps);

      return mockDelay({
        message: 'Application forwarded successfully.',
        currentStage: app.currentStage,
        assignedOfficer: app.assignedOfficer,
        currentStatus: app.currentStatus
      });
    } else {
      const response = await apiClient.post('/workflow/forward', { applicationId, ...payload });
      return response.data;
    }
  }
};
