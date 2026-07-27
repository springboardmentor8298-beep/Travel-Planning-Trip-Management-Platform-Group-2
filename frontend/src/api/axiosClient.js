import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/tokenStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

// Attach the access token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

// On a 401, try exactly once to refresh the access token, replay the
// original request, and only log the user out if that also fails.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || originalRequest._retry || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      window.location.assign('/login');
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/auth/refresh`,
        { refreshToken }
      );
      const { accessToken, refreshToken: newRefreshToken } = data.data;
      setTokens(accessToken, newRefreshToken);
      resolveQueue(null, accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError, null);
      clearTokens();
      window.location.assign('/login');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
