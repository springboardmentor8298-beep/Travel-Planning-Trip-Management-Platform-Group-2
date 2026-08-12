import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(sessionStorage.getItem('tripnest_user') || localStorage.getItem('tripnest_user') || 'null');
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('tripnest_user');
      sessionStorage.removeItem('tripnest_user');
    }
    return Promise.reject(error);
  }
);

export default api;
