import api from './axiosClient';

export const itineraryApi = {
  listDays: (tripId) => api.get(`/trips/${tripId}/itinerary`),
  generate: (tripId) => api.post(`/trips/${tripId}/itinerary/generate`),
  addDay: (tripId, payload) => api.post(`/trips/${tripId}/itinerary`, payload),
  updateDay: (tripId, dayId, payload) => api.put(`/trips/${tripId}/itinerary/${dayId}`, payload),
  removeDay: (tripId, dayId) => api.delete(`/trips/${tripId}/itinerary/${dayId}`)
};
