import API from "./api";

export const getNotifications = () => {
    return API.get("/notifications");
};

export const getUnreadNotifications = () => {
    return API.get("/notifications/unread");
};

export const markAsRead = (notificationId) => {
    return API.put(`/notifications/${notificationId}/read`);
};

export const markAllAsRead = () => {
    return API.put("/notifications/read-all");
};
