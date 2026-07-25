import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialProfile, initialTrips, initialSettings } from '../data/seedData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('tripnest_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('tripnest_trips');
    return saved ? JSON.parse(saved) : initialTrips;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('tripnest_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [recentActivity, setRecentActivity] = useState(() => {
    const saved = localStorage.getItem('tripnest_activity');
    if (saved) return JSON.parse(saved);
    return [
      { id: "act-init", type: "system", message: "Welcome to TripNest! Your trip planner dashboard is ready.", timestamp: new Date(Date.now() - 3600000).toISOString() }
    ];
  });

  const [notifications, setNotifications] = useState([]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('tripnest_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('tripnest_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('tripnest_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('tripnest_activity', JSON.stringify(recentActivity));
  }, [recentActivity]);

  // Log Activity Helper
  const logActivity = (type, message) => {
    const newAct = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setRecentActivity(prev => [newAct, ...prev.slice(0, 49)]); // Keep last 50 activities
  };

  // Toast Notification Helpers
  const triggerNotification = (message, type = 'success') => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotif = { id, message, type };
    setNotifications(prev => [...prev, newNotif]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      dismissNotification(id);
    }, 4000);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Trips CRUD Actions
  const addTrip = (tripData) => {
    const newTrip = {
      id: `trip-${Date.now()}`,
      expenses: [],
      travelers: [{ id: `trav-${Date.now()}`, name: profile.name, email: profile.email, role: "Organizer" }],
      itinerary: [],
      documents: [],
      notes: "",
      ...tripData
    };
    setTrips(prev => [newTrip, ...prev]);
    logActivity('create', `Created a new trip: "${newTrip.title}"`);
    triggerNotification(`Trip "${newTrip.title}" created successfully!`, 'success');
    return newTrip.id;
  };

  const updateTrip = (tripId, updatedFields) => {
    const t = trips.find(trip => trip.id === tripId);
    if (t) {
      const titleChanged = updatedFields.title && t.title !== updatedFields.title;
      if (titleChanged) {
        logActivity('edit', `Renamed trip "${t.title}" to "${updatedFields.title}"`);
      } else {
        logActivity('edit', `Updated details for trip "${t.title}"`);
      }
    }
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, ...updatedFields } : t));
    triggerNotification("Trip updated successfully!", "success");
  };

  const deleteTrip = (tripId) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    setTrips(prev => prev.filter(t => t.id !== tripId));
    logActivity('delete', `Deleted trip "${target.title}"`);
    triggerNotification(`Trip "${target.title}" was deleted.`, 'info');
  };

  // Expenses actions
  const addExpense = (tripId, expenseData) => {
    const newExpense = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...expenseData
    };
    const t = trips.find(trip => trip.id === tripId);
    if (t) {
      logActivity('budget', `Added expense "${newExpense.title}" ($${newExpense.amount}) to "${t.title}"`);
    }
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, expenses: [...(t.expenses || []), newExpense] } : t));
    triggerNotification(`Added expense: ${newExpense.title}`, 'success');
  };

  const deleteExpense = (tripId, expenseId) => {
    const t = trips.find(trip => trip.id === tripId);
    if (t) {
      const targetExp = t.expenses.find(e => e.id === expenseId);
      const expLabel = targetExp ? `"${targetExp.title}"` : 'expense';
      logActivity('budget', `Deleted expense ${expLabel} from "${t.title}"`);
    }
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, expenses: t.expenses.filter(e => e.id !== expenseId) } : t));
    triggerNotification("Expense deleted.", "info");
  };

  // Itinerary Planner actions
  const updateItinerary = (tripId, updatedItinerary) => {
    const t = trips.find(trip => trip.id === tripId);
    if (t) {
      logActivity('activity', `Reorganized itinerary for "${t.title}"`);
    }
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, itinerary: updatedItinerary } : t));
    triggerNotification("Itinerary updated successfully!", "success");
  };

  // Travel Documents actions
  const addDocument = (tripId, docData) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
      ...docData
    };
    const t = trips.find(trip => trip.id === tripId);
    if (t) {
      logActivity('document', `Uploaded document "${newDoc.name}" to "${t.title}"`);
    }
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, documents: [...(t.documents || []), newDoc] } : t));
    triggerNotification(`Uploaded "${newDoc.name}"`, "success");
  };

  const deleteDocument = (tripId, docId) => {
    const t = trips.find(trip => trip.id === tripId);
    if (t) {
      const targetDoc = t.documents.find(d => d.id === docId);
      const docLabel = targetDoc ? `"${targetDoc.name}"` : 'document';
      logActivity('document', `Removed document ${docLabel} from "${t.title}"`);
    }
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, documents: t.documents.filter(d => d.id !== docId) } : t));
    triggerNotification("Document deleted.", "info");
  };

  // Profile actions
  const loginUser = (user) => {

    setProfile({
      name: user.fullName,
      email: user.email,
      role: user.role,
      photo: null
    });

  };
  const updateProfile = (updatedProfile) => {
    logActivity('profile', `Updated travel profile details`);
    setProfile(prev => ({ ...prev, ...updatedProfile }));
    triggerNotification("Profile details saved!", "success");
  };

  // Settings actions
  const updateSettings = (updatedSettings) => {
    logActivity('system', `Updated application settings`);
    setSettings(prev => ({ ...prev, ...updatedSettings }));
    triggerNotification("Settings saved!", "success");
  };

  // Simulated Logout
  const logoutUser = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("tripnest_profile");
    localStorage.removeItem("tripnest_trips");
    localStorage.removeItem("tripnest_settings");
    localStorage.removeItem("tripnest_activity");

    setProfile({
      name: "",
      email: "",
      role: "",
      photo: null
    });

    setTrips([]);
    setSettings({});
    setRecentActivity([]);
  };

  return (
    <AppContext.Provider value={{
      profile,
      trips,
      settings,
      recentActivity,
      notifications,
      addTrip,
      updateTrip,
      deleteTrip,
      addExpense,
      deleteExpense,
      updateItinerary,
      addDocument,
      deleteDocument,
      loginUser,
      updateProfile,
      updateSettings,
      logoutUser,
      triggerNotification,
      dismissNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
