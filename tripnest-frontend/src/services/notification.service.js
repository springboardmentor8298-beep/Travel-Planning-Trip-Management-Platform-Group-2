import axios from 'axios';
import authService from './auth.service';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getNotifications = () =>
  axios.get('/api/notifications', { headers: getAuthHeader() }).then((r) => r.data);

export const getUnreadCount = () =>
  axios.get('/api/notifications/unread-count', { headers: getAuthHeader() }).then((r) => r.data.count);

export const markAsRead = (id) =>
  axios.put(`/api/notifications/${id}/read`, {}, { headers: getAuthHeader() }).then((r) => r.data);

export const markAllRead = () =>
  axios.put('/api/notifications/read-all', {}, { headers: getAuthHeader() });

const notificationService = { getNotifications, getUnreadCount, markAsRead, markAllRead };
export default notificationService;
