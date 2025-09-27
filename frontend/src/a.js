import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientDashboard from './pages/ClientDashboard';
import MerchantDashboard from './pages/MerchantDashboard';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import { Toaster } from 'sonner';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredUserType }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType && user.user_type !== requiredUserType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/welcome" element={!user ? <WelcomePage /> : <Navigate to="/" replace />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
          <Route path="/register/:type" element={!user ? <RegisterPage /> : <Navigate to="/" replace />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          
          {/* Dashboard Routes */}
          <Route path="/" element={
            user ? (
              user.user_type === 'client' ? 
                <Navigate to="/client-dashboard" replace /> :
                <Navigate to="/merchant-dashboard" replace />
            ) : (
              <Navigate to="/welcome" replace />
            )
          } />
          
          <Route path="/client-dashboard" element={
            <ProtectedRoute requiredUserType="client">
              <ClientDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/merchant-dashboard" element={
            <ProtectedRoute requiredUserType="merchant">
              <MerchantDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <AppContent />
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;