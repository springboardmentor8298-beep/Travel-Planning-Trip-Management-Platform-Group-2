import api from './axiosClient';

export const activityApi = {
  list: (tripId, dayId) => api.get(`/trips/${tripId}/itinerary/${dayId}/activities`),
  create: (tripId, dayId, payload) => api.post(`/trips/${tripId}/itinerary/${dayId}/activities`, payload),
  update: (tripId, dayId, activityId, payload) =>
    api.put(`/trips/${tripId}/itinerary/${dayId}/activities/${activityId}`, payload),
  remove: (tripId, dayId, activityId) =>
    api.delete(`/trips/${tripId}/itinerary/${dayId}/activities/${activityId}`)
};
