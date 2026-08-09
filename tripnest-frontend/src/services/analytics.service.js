import axios from 'axios';
import authService from './auth.service';

const API_URL = '/api/analytics/';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getUserAnalytics = () => {
  return axios.get(API_URL + 'user', { headers: getAuthHeader() });
};

const analyticsService = {
  getUserAnalytics,
};

export default analyticsService;
