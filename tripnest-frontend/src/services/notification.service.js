import axios from 'axios';
import authService from './auth.service';

const API_URL = 'http://localhost:8085/api/notifications';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getUserNotifications = async () => {
  const response = await axios.get(API_URL, { headers: getAuthHeader() });
  return response.data;
};

const getUnreadNotifications = async () => {
  const response = await axios.get(`${API_URL}/unread`, { headers: getAuthHeader() });
  return response.data;
};

const getUnreadCount = async () => {
  const response = await axios.get(`${API_URL}/unread/count`, { headers: getAuthHeader() });
  return response.data;
};

const markAsRead = async (notificationId) => {
  await axios.put(`${API_URL}/${notificationId}/read`, {}, { headers: getAuthHeader() });
};

const markAllAsRead = async () => {
  await axios.put(`${API_URL}/read-all`, {}, { headers: getAuthHeader() });
};

const deleteNotification = async (notificationId) => {
  await axios.delete(`${API_URL}/${notificationId}`, { headers: getAuthHeader() });
};

export default {
  getUserNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
