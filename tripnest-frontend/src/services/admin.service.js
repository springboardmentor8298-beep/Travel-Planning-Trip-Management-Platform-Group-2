import axios from 'axios';
import authService from './auth.service';

const API_URL = '/api/admin/';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getOverview = () => {
  return axios.get(API_URL + 'overview', { headers: getAuthHeader() });
};

const getUsers = () => {
  return axios.get(API_URL + 'users', { headers: getAuthHeader() });
};

const updateUserRole = (userId, role) => {
  return axios.put(API_URL + `users/${userId}/role`, { role }, { headers: getAuthHeader() });
};

const adminService = {
  getOverview,
  getUsers,
  updateUserRole,
};

export default adminService;
