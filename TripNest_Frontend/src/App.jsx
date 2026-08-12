import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import TripDetails from './pages/TripDetails';
import Planner from './pages/Planner';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import DestinationsPage from './pages/Destinations/DestinationsPage';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import AuthPage from "./pages/Auth/AuthPage";
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTrips from './pages/admin/AdminTrips';
import AdminAnalytics from './pages/admin/AdminAnalytics';

const AppContent = ({ initialPage = 'dashboard' }) => {
  // Navigation states: 'dashboard' | 'trips' | 'planner' | 'calendar' | 'profile' | 'settings' | 'trip-details' | 'destinations'
  const [activePage, setActivePage] = useState(initialPage);
  const [selectedTripId, setSelectedTripId] = useState('');

  // Shortcut state to trigger create trip modal inside Trips from Header button
  const [isCreateOpenShortcut, setIsCreateOpenShortcut] = useState(false);

  const { settings, profile } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    setActivePage(initialPage);
  }, [initialPage]);

  // Role-based routing and guard rules
  useEffect(() => {
    if (!profile) return;

    // Guard: redirect non-admins trying to access admin pages
    if (activePage.startsWith('admin') && profile.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }

    // Guard: redirect admins trying to access traveler pages
    if (activePage === 'dashboard' && profile.role === 'ADMIN') {
      navigate('/admin/dashboard');
      return;
    }

    // URL synchronization for admin pages
    if (profile.role === 'ADMIN') {
      if (activePage === 'admin') {
        navigate('/admin/dashboard');
      } else if (activePage === 'admin-users') {
        navigate('/admin/users');
      } else if (activePage === 'admin-trips') {
        navigate('/admin/trips');
      } else if (activePage === 'admin-analytics') {
        navigate('/admin/analytics');
      }
    }
  }, [activePage, profile, navigate]);

  // Sync dark mode class on app load/settings update
  useEffect(() => {
    if (settings && settings.appearance === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const handleAddTripClick = () => {
    setIsCreateOpenShortcut(true);
    setActivePage('trips');
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        if (profile?.role === 'ADMIN') {
          return <AdminDashboard setActivePage={setActivePage} />;
        }
        return (
          <Dashboard
            setActivePage={setActivePage}
            setSelectedTripId={setSelectedTripId}
            onAddTripClick={handleAddTripClick}
          />
        );
      case 'trips':
        return (
          <Trips
            setActivePage={setActivePage}
            setSelectedTripId={setSelectedTripId}
            isCreateOpenInitially={isCreateOpenShortcut}
            closeCreateInitially={() => setIsCreateOpenShortcut(false)}
          />
        );
      case 'trip-details':
        return (
          <TripDetails
            activeTripId={selectedTripId}
            setActivePage={setActivePage}
          />
        );
      case 'planner':
        return <Planner />;
      case 'calendar':
        return (
          <Calendar
            setActivePage={setActivePage}
            setSelectedTripId={setSelectedTripId}
          />
        );
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'destinations':
        return <DestinationsPage />;
      case 'analytics':
        return <Analytics />;
      case 'admin':
        return <AdminDashboard setActivePage={setActivePage} />;
      case 'admin-users':
        return <AdminUsers setActivePage={setActivePage} />;
      case 'admin-trips':
        return <AdminTrips setActivePage={setActivePage} />;
      case 'admin-analytics':
        return <AdminAnalytics setActivePage={setActivePage} />;
      default:
        return (
          <Dashboard
            setActivePage={setActivePage}
            setSelectedTripId={setSelectedTripId}
            onAddTripClick={handleAddTripClick}
          />
        );
    }
  };

  return (
    <MainLayout
      activePage={activePage}
      setActivePage={setActivePage}
      onAddTripClick={handleAddTripClick}
    >
      {renderActivePage()}
    </MainLayout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<AppContent />} />
          <Route path="/admin" element={<AppContent initialPage="admin" />} />
          <Route path="/admin/dashboard" element={<AppContent initialPage="admin" />} />
          <Route path="/admin/users" element={<AppContent initialPage="admin-users" />} />
          <Route path="/admin/trips" element={<AppContent initialPage="admin-trips" />} />
          <Route path="/admin/analytics" element={<AppContent initialPage="admin-analytics" />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
