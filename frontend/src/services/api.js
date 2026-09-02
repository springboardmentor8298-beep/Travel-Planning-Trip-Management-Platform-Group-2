import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* Helper API Service Methods */

// Members / Collaboration
export const getTripMembers = (tripId) => api.get(`/trips/${tripId}/members`);
export const addTripMember = (tripId, email, role = "MEMBER") => api.post(`/trips/${tripId}/members`, { email, role });
export const removeTripMember = (tripId, userId) => api.delete(`/trips/${tripId}/members/${userId}`);

// Trip Media / Document Upload
export const getTripMedia = (tripId, category) => api.get(`/trips/${tripId}/media`, { params: { category } });
export const uploadTripMedia = (tripId, formData, category) => {
  return api.post(`/trips/${tripId}/media?category=${category || ""}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteTripMedia = (tripId, mediaId) => api.delete(`/trips/${tripId}/media/${mediaId}`);

// Notifications
export const getNotifications = () => api.get("/notifications");
export const getUnreadNotificationCount = () => api.get("/notifications/unread-count");
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put("/notifications/mark-all-read");
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

// Expense Analytics & Budget
export const getExpenseAnalytics = (tripId) => api.get("/expenses/analytics", { params: { tripId } });

// Travel Recommendations
export const getRecommendations = () => api.get("/recommendations");

// Milestone 4: Analytics & Reports
export const getDashboardAnalytics = () => api.get("/analytics/dashboard");
export const getReports = (params) => api.get("/reports", { params });
export const getFilteredReports = (filter) => api.post("/reports/filter", filter);

export default api;