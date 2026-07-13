import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components & Layout
import { Layout } from './components/Layout';

// Auth Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { VerifyOtp } from './pages/VerifyOtp';

// Customer Pages
import { CustomerDashboard } from './pages/CustomerDashboard';
import { NewApplication } from './pages/NewApplication';
import { TrackApplication } from './pages/TrackApplication';
import { CustomerProfile } from './pages/CustomerProfile';
import { MyApplications } from './pages/MyApplications';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminApplications } from './pages/AdminApplications';
import { CustomerManagement } from './pages/CustomerManagement';
import { AdminAuditLogs } from './pages/AdminAuditLogs';
import { AdminSettings } from './pages/AdminSettings';
import { WaterTanker } from './pages/WaterTanker';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Customer Portal Routes (Protected via Layout redirects) */}
        <Route path="/customer" element={<Layout><CustomerDashboard /></Layout>} />
        <Route path="/customer/apply" element={<Layout><NewApplication /></Layout>} />
        <Route path="/customer/track" element={<Layout><TrackApplication /></Layout>} />
        <Route path="/customer/applications" element={<Layout><MyApplications /></Layout>} />
        <Route path="/customer/profile" element={<Layout><CustomerProfile /></Layout>} />

        {/* Admin Portal Routes (Protected via Layout redirects) */}
        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/applications" element={<Layout><AdminApplications /></Layout>} />
        <Route path="/admin/customers" element={<Layout><CustomerManagement /></Layout>} />
        <Route path="/admin/logs" element={<Layout><AdminAuditLogs /></Layout>} />
        <Route path="/admin/settings" element={<Layout><AdminSettings /></Layout>} />

        {/* Shared Services Routes */}
        <Route path="/water-tanker" element={<Layout><WaterTanker /></Layout>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Toast Notification Container */}
      <ToastContainer 
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
}

export default App;
