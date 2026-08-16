// Unified API service layer - every component should import FROM HERE,
// not call `api.get(...)` directly and not create a second axios instance.
// This is the single source of truth for every backend call in the app.
import api from "../api/axios";

// ---------------- Auth ----------------
export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (fullName, email, password) => api.post("/auth/register", { fullName, email, password }),
};

// ---------------- User Profile ----------------
export const userService = {
  getMyProfile: () => api.get("/users/me"),
  updateMyProfile: (fullName) => api.put("/users/me", { fullName }),
  changePassword: (currentPassword, newPassword) => api.put("/users/me/password", { currentPassword, newPassword }),
};

// ---------------- Trips ----------------
export const tripService = {
  getAll: () => api.get("/trips"),
  getById: (tripId) => api.get(`/trips/${tripId}`),
  create: (payload) => api.post("/trips", payload),
  update: (tripId, payload) => api.put(`/trips/${tripId}`, payload),
  delete: (tripId) => api.delete(`/trips/${tripId}`),
  getDashboard: (tripId) => api.get(`/trips/${tripId}/dashboard`),
  addTraveler: (tripId, email) => api.post(`/trips/${tripId}/travelers`, { email }),
};

// ---------------- Destinations ----------------
export const destinationService = {
  getAll: () => api.get("/destinations"),
  getById: (id) => api.get(`/destinations/${id}`),
  create: (payload) => api.post("/destinations", payload),
};

// ---------------- Itineraries & Activities ----------------
export const itineraryService = {
  getForTrip: (tripId) => api.get(`/trips/${tripId}/itineraries`),
  create: (tripId, payload) => api.post(`/trips/${tripId}/itineraries`, payload),
  update: (itineraryId, payload) => api.put(`/itineraries/${itineraryId}`, payload),
  delete: (itineraryId) => api.delete(`/itineraries/${itineraryId}`),
};

export const activityService = {
  getForItinerary: (itineraryId) => api.get(`/itineraries/${itineraryId}/activities`),
  create: (itineraryId, payload) => api.post(`/itineraries/${itineraryId}/activities`, payload),
  update: (activityId, payload) => api.put(`/activities/${activityId}`, payload),
  delete: (activityId) => api.delete(`/activities/${activityId}`),
};

// ---------------- Budget & Expenses ----------------
export const budgetService = {
  get: (tripId) => api.get(`/trips/${tripId}/budget`),
  setBudget: (tripId, payload) => api.put(`/trips/${tripId}/budget`, payload),
};

export const expenseService = {
  getForTrip: (tripId) => api.get(`/trips/${tripId}/expenses`),
  create: (tripId, payload) => api.post(`/trips/${tripId}/expenses`, payload),
  update: (expenseId, payload) => api.put(`/expenses/${expenseId}`, payload),
  delete: (expenseId) => api.delete(`/expenses/${expenseId}`),
};

// ---------------- Smart Insights ----------------
export const insightsService = {
  getBudgetInsights: (tripId) => api.get(`/trips/${tripId}/insights/budget`),
  getSettlement: (tripId) => api.get(`/trips/${tripId}/insights/settlement`),
};

// ---------------- Group Collaboration ----------------
export const groupService = {
  getMembers: (tripId) => api.get(`/trips/${tripId}/members`),
  inviteMember: (tripId, email, role) => api.post(`/trips/${tripId}/members`, { email, role }),
  updateMemberRole: (tripId, userId, role) => api.put(`/trips/${tripId}/members/${userId}/role`, { role }),
};

// ---------------- Notifications ----------------
export const notificationService = {
  getAll: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

// ---------------- Documents ----------------
export const documentService = {
  getForTrip: (tripId) => api.get(`/trips/${tripId}/documents`),
  // No manual Content-Type header - axios auto-detects FormData and sets
  // the correct multipart boundary. Overriding it breaks the upload.
  upload: (tripId, formData) => api.post(`/trips/${tripId}/documents`, formData),
  download: (documentId) => api.get(`/documents/${documentId}/download`, { responseType: "blob" }),
};

export const adminService = {
  getAnalytics: () => api.get("/admin/analytics"),
};
