import axios from 'axios';
import authService from './auth.service';

const API_BASE_URL = 'http://localhost:8085';

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
  axios.post(`${API_BASE_URL}/api/trips`, data, { headers: getAuthHeader() }).then((r) => r.data);

export const getTrips = () =>
  axios.get(`${API_BASE_URL}/api/trips`, { headers: getAuthHeader() }).then((r) => r.data);

export const getTripById = (id) =>
  axios.get(`${API_BASE_URL}/api/trips/${id}`, { headers: getAuthHeader() }).then((r) => r.data);

export const updateTrip = (id, data) =>
  axios.put(`${API_BASE_URL}/api/trips/${id}`, data, { headers: getAuthHeader() }).then((r) => r.data);

export const deleteTrip = (id) =>
  axios.delete(`${API_BASE_URL}/api/trips/${id}`, { headers: getAuthHeader() });

export const getTripStats = () =>
  axios.get(`${API_BASE_URL}/api/trips/stats`, { headers: getAuthHeader() }).then((r) => r.data);

// ─── Itineraries ─────────────────────────────────────────────────────────────

export const getItineraries = (tripId) =>
  axios.get(`${API_BASE_URL}/api/trips/${tripId}/itineraries`, { headers: getAuthHeader() }).then((r) => r.data);

export const addItinerary = (tripId, data) =>
  axios.post(`${API_BASE_URL}/api/trips/${tripId}/itineraries`, data, { headers: getAuthHeader() }).then((r) => r.data);

export const updateItinerary = (tripId, id, data) =>
  axios.put(`${API_BASE_URL}/api/trips/${tripId}/itineraries/${id}`, data, { headers: getAuthHeader() }).then((r) => r.data);

export const deleteItinerary = (tripId, id) =>
  axios.delete(`${API_BASE_URL}/api/trips/${tripId}/itineraries/${id}`, { headers: getAuthHeader() });

// ─── Activities ───────────────────────────────────────────────────────────────

export const getActivities = (itineraryId) =>
  axios.get(`${API_BASE_URL}/api/itineraries/${itineraryId}/activities`, { headers: getAuthHeader() }).then((r) => r.data);

export const addActivity = (itineraryId, data) =>
  axios.post(`${API_BASE_URL}/api/itineraries/${itineraryId}/activities`, data, { headers: getAuthHeader() }).then((r) => r.data);

export const updateActivity = (itineraryId, id, data) =>
  axios.put(`${API_BASE_URL}/api/itineraries/${itineraryId}/activities/${id}`, data, { headers: getAuthHeader() }).then((r) => r.data);

export const deleteActivity = (itineraryId, id) =>
  axios.delete(`${API_BASE_URL}/api/itineraries/${itineraryId}/activities/${id}`, { headers: getAuthHeader() });

// ─── Destinations ─────────────────────────────────────────────────────────────

export const getDestinations = () =>
  axios.get(`${API_BASE_URL}/api/destinations`).then((r) => r.data);

export const searchDestinations = (q) =>
  axios.get(`${API_BASE_URL}/api/destinations/search`, { params: { q } }).then((r) => r.data);

export const getDestinationById = (id) =>
  axios.get(`${API_BASE_URL}/api/destinations/${id}`).then((r) => r.data);

const tripService = {
  createTrip, getTrips, getTripById, updateTrip, deleteTrip, getTripStats,
  getItineraries, addItinerary, updateItinerary, deleteItinerary,
  getActivities, addActivity, updateActivity, deleteActivity,
  getDestinations, searchDestinations, getDestinationById,
};

export default tripService;
