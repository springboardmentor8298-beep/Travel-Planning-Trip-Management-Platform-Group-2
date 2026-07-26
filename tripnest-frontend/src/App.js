import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import TripList from './components/TripList';
import TripForm from './components/TripForm';
import TripDetail from './components/TripDetail';
import TripTimeline from './components/TripTimeline';
import Destinations from './components/Destinations';
import ExpenseTracker from './components/ExpenseTracker';
import UserProfile from './components/UserProfile';
import OAuth2Callback from './components/OAuth2Callback';
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
          {/* OAuth2 callback — must be public, processed before auth check */}
          <Route path="/oauth2/callback" element={<OAuth2Callback />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
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
          <Route
            path="/trips/:id/expenses"
            element={
              <PrivateRoute>
                <ExpenseTracker />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips/:id/timeline"
            element={
              <PrivateRoute>
                <TripTimeline />
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

          {/* User Profile */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
