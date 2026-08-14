import axios from 'axios';
import authService from './auth.service';

/**
 * Trip service — handles all trip, itinerary, activity, and destination API calls.
 * Automatically attaches the Bearer JWT token to every request.
 */

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Trips ───────────────────────────────────────────────────────────────────

export const createTrip = (data) =>
  axios.post('/api/trips', data, { headers: getAuthHeader() }).then((r) => r.data);

export const getTrips = () =>
  axios.get('/api/trips', { headers: getAuthHeader() }).then((r) => r.data);

export const getTripById = (id) =>
  axios.get(`/api/trips/${id}`, { headers: getAuthHeader() }).then((r) => r.data);

export const updateTrip = (id, data) =>
  axios.put(`/api/trips/${id}`, data, { headers: getAuthHeader() }).then((r) => r.data);

export const deleteTrip = (id) =>
  axios.delete(`/api/trips/${id}`, { headers: getAuthHeader() });

export const getTripStats = () =>
  axios.get('/api/trips/stats', { headers: getAuthHeader() }).then((r) => r.data);

// ─── Itineraries ─────────────────────────────────────────────────────────────

export const getItineraries = (tripId) =>
  axios.get(`/api/trips/${tripId}/itineraries`, { headers: getAuthHeader() }).then((r) => r.data);

export const addItinerary = (tripId, data) =>
  axios.post(`/api/trips/${tripId}/itineraries`, data, { headers: getAuthHeader() }).then((r) => r.data);

export const updateItinerary = (tripId, id, data) =>
  axios.put(`/api/trips/${tripId}/itineraries/${id}`, data, { headers: getAuthHeader() }).then((r) => r.data);

export const deleteItinerary = (tripId, id) =>
  axios.delete(`/api/trips/${tripId}/itineraries/${id}`, { headers: getAuthHeader() });

// ─── Activities ───────────────────────────────────────────────────────────────

export const getActivities = (itineraryId) =>
  axios.get(`/api/itineraries/${itineraryId}/activities`, { headers: getAuthHeader() }).then((r) => r.data);

export const addActivity = (itineraryId, data) =>
  axios.post(`/api/itineraries/${itineraryId}/activities`, data, { headers: getAuthHeader() }).then((r) => r.data);

export const updateActivity = (itineraryId, id, data) =>
  axios.put(`/api/itineraries/${itineraryId}/activities/${id}`, data, { headers: getAuthHeader() }).then((r) => r.data);

export const deleteActivity = (itineraryId, id) =>
  axios.delete(`/api/itineraries/${itineraryId}/activities/${id}`, { headers: getAuthHeader() });

// ─── Destinations ─────────────────────────────────────────────────────────────

export const getDestinations = () =>
  axios.get('/api/destinations').then((r) => r.data);

export const searchDestinations = (q) =>
  axios.get('/api/destinations/search', { params: { q } }).then((r) => r.data);

export const getDestinationById = (id) =>
  axios.get(`/api/destinations/${id}`).then((r) => r.data);

// ─── Expense Splits & Sharing ────────────────────────────────────────────────

export const getTripSplits = (tripId) =>
  axios.get(`/api/trips/${tripId}/expenses/splits`, { headers: getAuthHeader() }).then((r) => r.data);

export const generateShareToken = (tripId) =>
  axios.post(`/api/trips/${tripId}/share-token`, {}, { headers: getAuthHeader() }).then((r) => r.data);

export const getPublicSharedTrip = (shareToken) =>
  axios.get(`/api/trips/share/${shareToken}`).then((r) => r.data);

const tripService = {
  createTrip, getTrips, getTripById, updateTrip, deleteTrip, getTripStats,
  getItineraries, addItinerary, updateItinerary, deleteItinerary,
  getActivities, addActivity, updateActivity, deleteActivity,
  getDestinations, searchDestinations, getDestinationById,
  getTripSplits, generateShareToken, getPublicSharedTrip,
};

export default tripService;
