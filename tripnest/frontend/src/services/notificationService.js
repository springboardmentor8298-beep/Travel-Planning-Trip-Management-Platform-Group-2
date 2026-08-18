import api from "./api";

const NotificationService = {

  // Get all notifications
  getNotifications: async () => {
    const response = await api.get("/notifications");
    return response.data;
  },

  // Get unread notifications
  getUnreadNotifications: async () => {
    const response = await api.get(
      "/notifications/unread"
    );
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get(
      "/notifications/count"
    );
    return response.data;
  },

  // Mark one notification as read
  markAsRead: async (id) => {
    const response = await api.put(
      `/notifications/${id}/read`
    );
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.put(
      "/notifications/read-all"
    );
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await api.delete(
      `/notifications/${id}`
    );
    return response.data;
  }
};

export default NotificationService;