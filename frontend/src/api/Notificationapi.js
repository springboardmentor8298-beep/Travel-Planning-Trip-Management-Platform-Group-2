import axiosClient from "./axiosClient";

export const getNotifications    = ()  => axiosClient.get("/notifications");
export const getUnreadNotifications = () => axiosClient.get("/notifications/unread");

/** Returns { count: number } — extract with res.data.count */
export const getUnreadCount      = ()  => axiosClient.get("/notifications/unread/count");

export const markAsRead          = (id) => axiosClient.put(`/notifications/${id}/read`);

/** Mark every notification as read in one call */
export const markAllReadApi      = ()  => axiosClient.put("/notifications/read-all");
