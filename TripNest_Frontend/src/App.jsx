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
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/Auth/AuthPage";

const AppContent = () => {
  // Navigation states: 'dashboard' | 'trips' | 'planner' | 'calendar' | 'profile' | 'settings' | 'trip-details'
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedTripId, setSelectedTripId] = useState('');

  // Shortcut state to trigger create trip modal inside Trips from Header button
  const [isCreateOpenShortcut, setIsCreateOpenShortcut] = useState(false);

  const { settings } = useAppContext();

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
          <Route path="/dashboard" element={<AppContent />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
