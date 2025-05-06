import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/AdminPanel';
import UserRequests from './pages/UserRequests';
import CreateRequest from './pages/CreateRequest';
import DonorManagement from './pages/DonorManagement';
import InventoryManagement from './pages/InventoryManagement';
import RequestApproval from './pages/RequestApproval';
import UserProfile from './pages/UserProfile';
import MyDonations from './pages/MyDonations';
import DonateBlood from './pages/DonateBlood';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Protected Route component
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
    <div className="App">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminPanel />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/my-requests"
                element={
                  <ProtectedRoute>
                    <UserRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/request-blood"
                element={
                  <ProtectedRoute>
                    <CreateRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-donations"
                element={
                  <ProtectedRoute>
                    <MyDonations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donate-blood"
                element={
                  <ProtectedRoute>
                    <DonateBlood />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donors"
                element={
                  <AdminProtectedRoute>
                    <DonorManagement />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <AdminProtectedRoute>
                    <InventoryManagement />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/request-approval"
                element={
                  <AdminProtectedRoute>
                    <RequestApproval />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
    </div>
      </Router>
    </AuthProvider>
  );
}

export default App;