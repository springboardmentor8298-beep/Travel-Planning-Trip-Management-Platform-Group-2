import api from './axiosClient';

export const tripApi = {
  list: (status) => api.get('/trips', { params: status ? { status } : {} }),
  getById: (tripId) => api.get(`/trips/${tripId}`),
  create: (payload) => api.post('/trips', payload),
  update: (tripId, payload) => api.put(`/trips/${tripId}`, payload),
  updateStatus: (tripId, status) => api.patch(`/trips/${tripId}/status`, { status }),
  remove: (tripId) => api.delete(`/trips/${tripId}`)
};
