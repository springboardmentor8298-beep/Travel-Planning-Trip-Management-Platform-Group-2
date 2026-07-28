import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialProfile, initialTrips, initialSettings } from '../data/seedData';
import { getMyTrips } from "../services/tripService";
import { createExpense as createExpenseApi, deleteExpense as deleteExpenseApi } from "../services/expenseService";
import { getProfile as getProfileApi, updateProfile as updateProfileApi } from "../services/userService";

const AppContext = createContext();

export const AppProvider = ({ children }) => {

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('tripnest_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [trips, setTrips] = useState([]);
  const loadTrips = async () => {
    try {
      const response = await getMyTrips();

      const tripList = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      setTrips(
    tripList.map((trip) => ({
        ...trip,

        title: trip.tripName,

        destination: trip.destination,

        budgetId: trip.budgetId,

        expenses: (trip.expenses || []).map(e => ({
            id: e.id,
            title: e.description,
            category: e.category === "TRANSPORTATION" ? "Transport" :
                      e.category === "HOTEL" ? "Lodging" :
                      e.category === "FOOD" ? "Food" : "Activities",
            amount: e.amount,
            date: e.expenseDate
        })),

        itinerary:
            (trip.itinerary || []).map(day => ({
                day: day.dayNumber,
                dayNumber: day.dayNumber,
                date: day.date,
                activities: (day.activities || []).map(a => ({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    time: a.activityTime,
                    type: a.activityType,
                    cost: 0
                }))
            }))
    }))
);

    } catch (error) {
      console.error("Failed to load trips:", error);
    }
  };
  const loadProfile = async () => {
    try {
      const response = await getProfileApi();
      const user = response?.data?.data;
      if (user) {
        setProfile({
          name: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          country: user.country || "",
          bio: user.bio || "",
          photo: user.photo || "",
          travelStyle: user.travelStyle || "",
          emergencyContact: user.emergencyContact || ""
        });
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadProfile();
      loadTrips();
    }
  }, []);

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
  const addExpense = async (tripId, expenseData) => {
    const t = trips.find(trip => trip.id === tripId);
    if (!t || !t.budgetId) {
      triggerNotification("Budget not found for this trip", "error");
      return;
    }
    try {
      const convertCategory = (cat) => {
          switch (cat) {
              case "Transport": return "TRANSPORTATION";
              case "Lodging": return "HOTEL";
              case "Food": return "FOOD";
              case "Activities": return "ENTERTAINMENT";
              default: return "MISCELLANEOUS";
          }
      };

      await createExpenseApi(t.budgetId, {
          amount: expenseData.amount,
          category: convertCategory(expenseData.category),
          description: expenseData.title,
          expenseDate: expenseData.date
      });

      await loadTrips();
      logActivity('budget', `Added expense "${expenseData.title}" ($${expenseData.amount}) to "${t.title}"`);
      triggerNotification(`Added expense: ${expenseData.title}`, 'success');
    } catch (error) {
      console.error(error);
      triggerNotification("Failed to add expense", "error");
    }
  };

  const deleteExpense = async (tripId, expenseId) => {
    try {
      await deleteExpenseApi(expenseId);
      await loadTrips();
      triggerNotification("Expense deleted.", "info");
    } catch (error) {
      console.error(error);
      triggerNotification("Failed to delete expense", "error");
    }
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
  const loginUser = async (user) => {
    setProfile({
      name: user.fullName,
      email: user.email,
      role: user.role,
      photo: null
    });
    await loadProfile();
  };

  const updateProfile = async (updatedProfile) => {
    try {
      const response = await updateProfileApi({
        fullName: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        country: updatedProfile.country,
        bio: updatedProfile.bio,
        photo: updatedProfile.photo,
        travelStyle: updatedProfile.travelStyle,
        emergencyContact: updatedProfile.emergencyContact
      });
      const data = response?.data?.data;
      if (data) {
        setProfile({
          name: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          country: data.country || "",
          bio: data.bio || "",
          photo: data.photo || "",
          travelStyle: data.travelStyle || "",
          emergencyContact: data.emergencyContact || ""
        });
        logActivity('profile', `Updated travel profile details`);
        triggerNotification("Profile details saved!", "success");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      triggerNotification("Failed to save profile details.", "error");
    }
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
      loadTrips,
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
