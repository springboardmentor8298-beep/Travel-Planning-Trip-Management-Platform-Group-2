import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import TripList from './components/TripList';
import TripForm from './components/TripForm';
import TripDetail from './components/TripDetail';
import Destinations from './components/Destinations';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import PublicTripView from './components/PublicTripView';
import AiAssistant from './components/AiAssistant';
import './App.css';

/**
 * PrivateRoute — redirects to /login if not authenticated.
 */
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

/**
 * PublicRoute — redirects to /dashboard if already authenticated.
 */
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/dashboard" replace /> : children;
};

/**
 * Root App component — wraps everything in AuthProvider and Router.
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/trips/share/:token"
            element={<PublicTripView />}
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* User Profile */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Trip routes */}
          <Route
            path="/trips"
            element={
              <PrivateRoute>
                <TripList />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips/new"
            element={
              <PrivateRoute>
                <TripForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <PrivateRoute>
                <TripDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips/:id/edit"
            element={
              <PrivateRoute>
                <TripForm />
              </PrivateRoute>
            }
          />

          {/* Destinations */}
          <Route
            path="/destinations"
            element={
              <PrivateRoute>
                <Destinations />
              </PrivateRoute>
            }
          />

          {/* Analytics */}
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <AnalyticsDashboard />
              </PrivateRoute>
            }
          />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <AiAssistant />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
