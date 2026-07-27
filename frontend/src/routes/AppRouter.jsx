import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import OAuthCallbackPage from '../pages/OAuthCallbackPage';
import DashboardPage from '../pages/DashboardPage';
import TripsPage from '../pages/TripsPage';
import TripDetailPage from '../pages/TripDetailPage';
import DestinationsPage from '../pages/DestinationsPage';
import ComingSoonPage from '../pages/ComingSoonPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/trips"
          element={
            <ProtectedRoute>
              <TripsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/trips/:tripId"
          element={
            <ProtectedRoute>
              <TripDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/destinations"
          element={
            <ProtectedRoute>
              <DestinationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/budgets"
          element={
            <ProtectedRoute>
              <ComingSoonPage
                title="Budgets & expenses"
                milestone="Milestone 3"
                description="Track spending against a planned budget and split costs with your group."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/notifications"
          element={
            <ProtectedRoute>
              <ComingSoonPage
                title="Notifications"
                milestone="Milestone 3"
                description="Reminders for upcoming activities and budget alerts land here."
              />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
