import axios from 'axios';
import authService from './auth.service';

const API_URL = '/api/user/';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getProfile = () => {
  return axios.get(API_URL + 'profile', { headers: getAuthHeader() });
};

const updateProfile = (data) => {
  return axios.put(API_URL + 'profile', data, { headers: getAuthHeader() });
};

const toggleFavorite = (destinationId) => {
  return axios.post(API_URL + `favorites/${destinationId}`, {}, { headers: getAuthHeader() });
};

const getFavorites = () => {
  return axios.get(API_URL + 'favorites', { headers: getAuthHeader() });
};

const changePassword = (currentPassword, newPassword) => {
  return axios.put(API_URL + 'change-password', { currentPassword, newPassword }, { headers: getAuthHeader() });
};

const forgotPassword = (email) => {
  return axios.post('/api/auth/forgot-password', { email });
};

const resetPassword = (token, newPassword) => {
  return axios.post('/api/auth/reset-password', { token, newPassword });
};

const googleLogin = (payload) => {
  return axios.post('/api/auth/oauth2/google', payload);
};

const userService = {
  getProfile,
  updateProfile,
  toggleFavorite,
  getFavorites,
  changePassword,
  forgotPassword,
  resetPassword,
  googleLogin,
};

export default userService;
