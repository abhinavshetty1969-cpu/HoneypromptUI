import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/DashboardLayout';
import { Toaster } from './components/ui/sonner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserChatPage from './pages/UserChatPage';
import DashboardPage from './pages/DashboardPage';
import AttackLogsPage from './pages/AttackLogsPage';
import ChatTestPage from './pages/ChatTestPage';
import UserManagementPage from './pages/UserManagementPage';
import HoneypotSettingsPage from './pages/HoneypotSettingsPage';
import ThreatProfilesPage from './pages/ThreatProfilesPage';
import WebhooksPage from './pages/WebhooksPage';
import ApiKeysPage from './pages/ApiKeysPage';
import DecoyDataPage from './pages/DecoyDataPage';

const UserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}><div className="text-primary font-mono text-sm">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}><div className="text-primary font-mono text-sm">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* User - ChatGPT-like interface */}
          <Route path="/" element={<UserRoute><UserChatPage /></UserRoute>} />

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminRoute><DashboardPage /></AdminRoute>} />
          <Route path="/admin/attacks" element={<AdminRoute><AttackLogsPage /></AdminRoute>} />
          <Route path="/admin/profiles" element={<AdminRoute><ThreatProfilesPage /></AdminRoute>} />
          <Route path="/admin/chat" element={<AdminRoute><ChatTestPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
          <Route path="/admin/honeypots" element={<AdminRoute><HoneypotSettingsPage /></AdminRoute>} />
          <Route path="/admin/decoys" element={<AdminRoute><DecoyDataPage /></AdminRoute>} />
          <Route path="/admin/webhooks" element={<AdminRoute><WebhooksPage /></AdminRoute>} />
          <Route path="/admin/apikeys" element={<AdminRoute><ApiKeysPage /></AdminRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#020617', border: '1px solid #1e293b', color: '#f8fafc' },
        }}
      />
    </AuthProvider>
  );
}

export default App;
