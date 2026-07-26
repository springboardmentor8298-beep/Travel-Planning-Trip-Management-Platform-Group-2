import axios from 'axios';
import authService from './auth.service';

const API_URL = 'http://localhost:8085/api/users';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getUserProfile = async () => {
  const response = await axios.get(`${API_URL}/profile`, { headers: getAuthHeader() });
  return response.data;
};

const updateUserProfile = async (profileData) => {
  const response = await axios.put(`${API_URL}/profile`, profileData, { headers: getAuthHeader() });
  return response.data;
};

const changePassword = async (currentPassword, newPassword) => {
  const response = await axios.post(`${API_URL}/change-password`, {
    currentPassword,
    newPassword
  }, { headers: getAuthHeader() });
  return response.data;
};

export default {
  getUserProfile,
  updateUserProfile,
  changePassword
};
