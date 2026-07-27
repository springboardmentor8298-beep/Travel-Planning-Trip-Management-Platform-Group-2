import api from './axiosClient';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  me: () => api.get('/users/me')
};
