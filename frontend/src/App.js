import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/DashboardLayout';
import { Toaster } from './components/ui/sonner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AttackLogsPage from './pages/AttackLogsPage';
import ChatTestPage from './pages/ChatTestPage';
import UserManagementPage from './pages/UserManagementPage';
import HoneypotSettingsPage from './pages/HoneypotSettingsPage';
import ThreatProfilesPage from './pages/ThreatProfilesPage';
import WebhooksPage from './pages/WebhooksPage';
import ApiKeysPage from './pages/ApiKeysPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}><div className="text-primary font-mono text-sm">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/attacks" element={<ProtectedRoute><AttackLogsPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatTestPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
          <Route path="/honeypots" element={<ProtectedRoute><HoneypotSettingsPage /></ProtectedRoute>} />
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
