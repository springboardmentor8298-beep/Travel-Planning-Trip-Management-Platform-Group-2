import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialProfile, initialTrips, initialSettings } from '../data/seedData';
import { getMyTrips, updateTrip as updateTripApi, getTripById } from "../services/tripService";
import { createExpense as createExpenseApi, deleteExpense as deleteExpenseApi } from "../services/expenseService";
import { getProfile as getProfileApi, updateProfile as updateProfileApi } from "../services/userService";
import { inviteMember, removeMember, acceptInvitation, declineInvitation, getPendingInvitations } from "../services/collaborationService";
import { uploadDocument as uploadDocumentApi, deleteDocument as deleteDocumentApi, downloadDocument as downloadDocumentApi } from "../services/documentService";
import { getUnreadNotifications as getNotificationsApi, markAsRead as markAsReadApi, markAllAsRead as markAllAsReadApi } from "../services/notificationService";

const AppContext = createContext();

export const AppProvider = ({ children }) => {

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('tripnest_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [trips, setTrips] = useState([]);
  const loadTrips = async (search, status, sort) => {
    try {
      const response = await getMyTrips(search, status, sort);

      const tripList = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      setTrips(prev => {
        return tripList.map((trip) => {
          const existing = prev.find(t => t.id === trip.id);
          return {
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
                        cost: a.cost || 0
                    }))
                })),
            travelers: existing?.travelers || trip.travelers || [],
            documents: existing?.documents || trip.documents || [],
            estimatedCost: existing?.estimatedCost !== undefined ? existing.estimatedCost : trip.estimatedCost || 0,
            utilizationPercentage: existing?.utilizationPercentage !== undefined ? existing.utilizationPercentage : trip.utilizationPercentage || 0
          };
        });
      });

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
          emergencyContact: user.emergencyContact || "",
          role: user.role || ""
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
      loadNotifications();
      loadPendingInvitations();
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

  const loadTripDetails = async (tripId) => {
    try {
      const response = await getTripById(tripId);
      const detailedTrip = response?.data?.data;
      if (detailedTrip) {
        setTrips(prev => prev.map(t => {
          if (t.id === tripId) {
            return {
              ...t,
              travelers: detailedTrip.travelers || [],
              documents: detailedTrip.documents || [],
              estimatedCost: detailedTrip.estimatedCost || 0,
              utilizationPercentage: detailedTrip.utilizationPercentage || 0,
              expenses: (detailedTrip.expenses || []).map(e => ({
                  id: e.id,
                  title: e.description,
                  category: e.category === "TRANSPORTATION" ? "Transport" :
                            e.category === "HOTEL" ? "Lodging" :
                            e.category === "FOOD" ? "Food" : "Activities",
                  amount: e.amount,
                  date: e.expenseDate
              })),
              itinerary:
                  (detailedTrip.itinerary || []).map(day => ({
                      day: day.dayNumber,
                      dayNumber: day.dayNumber,
                      date: day.date,
                      activities: (day.activities || []).map(a => ({
                          id: a.id,
                          title: a.title,
                          description: a.description,
                          time: a.activityTime,
                          type: a.activityType,
                          cost: a.cost || 0
                      }))
                  }))
            };
          }
          return t;
        }));
      }
    } catch (error) {
      console.error("Failed to load trip details:", error);
    }
  };

  const updateTrip = async (tripId, updatedFields) => {
    const t = trips.find(trip => trip.id === tripId);
    if (!t) return;

    if ('travelers' in updatedFields) {
      try {
        const oldTravelers = t.travelers || [];
        const newTravelers = updatedFields.travelers || [];
        if (newTravelers.length > oldTravelers.length) {
          const added = newTravelers.find(nt => !oldTravelers.some(ot => ot.email === nt.email));
          if (added) {
            await inviteMember(tripId, { name: added.name, email: added.email, role: added.role });
            triggerNotification(`Invited traveler ${added.name}`, 'success');
          }
        } else if (newTravelers.length < oldTravelers.length) {
          const removed = oldTravelers.find(ot => !newTravelers.some(nt => nt.email === ot.email));
          if (removed) {
            await removeMember(tripId, removed.id);
            triggerNotification(`Removed traveler ${removed.name}`, 'info');
          }
        }
        await loadTripDetails(tripId);
      } catch (error) {
        console.error("Failed to update travelers:", error);
        triggerNotification("Failed to update group members", "error");
      }
      return;
    }

    const hasBackendFields = 'notes' in updatedFields || 'title' in updatedFields || 'startDate' in updatedFields || 'endDate' in updatedFields || 'totalMembers' in updatedFields || 'description' in updatedFields || 'coverImage' in updatedFields || 'destination' in updatedFields || 'budget' in updatedFields;

    if (hasBackendFields) {
      try {
        const payload = {
          tripName: updatedFields.title || t.title || t.tripName,
          startDate: updatedFields.startDate || t.startDate,
          endDate: updatedFields.endDate || t.endDate,
          totalMembers: Number(updatedFields.totalMembers || t.totalMembers || 1),
          notes: updatedFields.notes !== undefined ? updatedFields.notes : t.notes,
          description: updatedFields.description !== undefined ? updatedFields.description : t.description,
          coverImage: updatedFields.coverImage !== undefined ? updatedFields.coverImage : t.coverImage,
          destinationName: updatedFields.destination || t.destination || t.destinationName || "",
          city: updatedFields.city || t.city || t.destination || "",
          state: updatedFields.state || t.state || "India",
          country: updatedFields.country || t.country || "India",
          budget: Number(updatedFields.budget || t.budget || 0)
        };

        await updateTripApi(tripId, payload);
        await loadTrips();
        await loadTripDetails(tripId);
        triggerNotification("Trip updated successfully!", "success");
      } catch (error) {
        console.error("Failed to update trip on backend:", error);
        triggerNotification("Failed to update trip", "error");
      }
    } else {
      setTrips(prev => prev.map(trip => trip.id === tripId ? { ...trip, ...updatedFields } : trip));
      triggerNotification("Trip updated successfully!", "success");
    }
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

      await loadTripDetails(tripId);
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
      await loadTripDetails(tripId);
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
  const addDocument = async (tripId, file, documentType) => {
    try {
      await uploadDocumentApi(tripId, file, documentType);
      await loadTripDetails(tripId);
      triggerNotification(`Uploaded "${file.name}"`, "success");
    } catch (error) {
      console.error(error);
      triggerNotification("Failed to upload document", "error");
      throw error;
    }
  };

  const deleteDocument = async (tripId, docId) => {
    try {
      await deleteDocumentApi(docId);
      await loadTripDetails(tripId);
      triggerNotification("Document deleted.", "info");
    } catch (error) {
      console.error(error);
      triggerNotification("Failed to delete document", "error");
    }
  };

  // Download travel documents
  const downloadTripDocument = async (docId, fileName) => {
    try {
      const response = await downloadDocumentApi(docId);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      triggerNotification("Downloading document...", "info");
    } catch (error) {
      console.error("Failed to download document:", error);
      triggerNotification("Failed to download document", "error");
    }
  };

  // System notifications actions
  const [systemNotifications, setSystemNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const response = await getNotificationsApi();
      const list = Array.isArray(response?.data?.data) ? response.data.data : [];
      setSystemNotifications(list);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await markAsReadApi(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark notification read:", error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await markAllAsReadApi();
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications read:", error);
    }
  };

  // Pending group invitations
  const [pendingInvitations, setPendingInvitations] = useState([]);

  const loadPendingInvitations = async () => {
    try {
      const response = await getPendingInvitations();
      const list = Array.isArray(response?.data?.data) ? response.data.data : [];
      setPendingInvitations(list);
    } catch (error) {
      console.error("Failed to load pending invitations:", error);
    }
  };

  const acceptTripInvitation = async (memberId) => {
    try {
      await acceptInvitation(memberId);
      triggerNotification("Accepted trip invitation!", "success");
      await loadPendingInvitations();
      await loadTrips();
      await loadNotifications();
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      triggerNotification("Failed to accept invitation", "error");
    }
  };

  const declineTripInvitation = async (memberId) => {
    try {
      await declineInvitation(memberId);
      triggerNotification("Declined trip invitation", "info");
      await loadPendingInvitations();
      await loadNotifications();
    } catch (error) {
      console.error("Failed to decline invitation:", error);
      triggerNotification("Failed to decline invitation", "error");
    }
  };

  const inviteTripMember = async (tripId, memberData) => {
    try {
      await inviteMember(tripId, memberData);
      await loadTripDetails(tripId);
      triggerNotification(`Invitation sent to ${memberData.email}`, "success");
    } catch (error) {
      console.error("Failed to invite member:", error);
      triggerNotification("Failed to invite member", "error");
      throw error;
    }
  };

  const removeTripMember = async (tripId, memberId) => {
    try {
      await removeMember(tripId, memberId);
      await loadTripDetails(tripId);
      triggerNotification("Member removed", "info");
    } catch (error) {
      console.error("Failed to remove member:", error);
      triggerNotification("Failed to remove member", "error");
      throw error;
    }
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
    await loadTrips();
    await loadNotifications();
    await loadPendingInvitations();
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
          emergencyContact: data.emergencyContact || "",
          role: data.role || ""
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
    setSettings(initialSettings);
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
      dismissNotification,
      loadTripDetails,
      systemNotifications,
      loadNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      pendingInvitations,
      loadPendingInvitations,
      acceptTripInvitation,
      declineTripInvitation,
      downloadTripDocument,
      inviteTripMember,
      removeTripMember
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
