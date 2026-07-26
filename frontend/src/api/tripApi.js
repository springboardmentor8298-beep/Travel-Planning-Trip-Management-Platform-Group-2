import axiosClient from "./axiosClient";

export const tripApi = {
  getMyTrips: () => axiosClient.get("/trips"),
  getSummary: () => axiosClient.get("/trips/summary"),
  getTrip: (id) => axiosClient.get(`/trips/${id}`),
  createTrip: (data) => axiosClient.post("/trips", data),
  updateTrip: (id, data) => axiosClient.put(`/trips/${id}`, data),
  deleteTrip: (id) => axiosClient.delete(`/trips/${id}`),
  addTraveler: (id, email) => axiosClient.post(`/trips/${id}/travelers`, { email }),
  getItinerary: (id) => axiosClient.get(`/trips/${id}/itinerary`),
  addItineraryItem: (id, data) => axiosClient.post(`/trips/${id}/itinerary`, data),
  updateItineraryItem: (id, itemId, data) => axiosClient.put(`/trips/${id}/itinerary/${itemId}`, data),
  deleteItineraryItem: (id, itemId) => axiosClient.delete(`/trips/${id}/itinerary/${itemId}`),
  getExpenses: (id) => axiosClient.get(`/trips/${id}/expenses`),
  getExpenseSummary: (id) => axiosClient.get(`/trips/${id}/expenses/summary`),
  addExpense: (id, data) => axiosClient.post(`/trips/${id}/expenses`, data),
  updateExpense: (id, expenseId, data) => axiosClient.put(`/trips/${id}/expenses/${expenseId}`, data),
  deleteExpense: (id, expenseId) => axiosClient.delete(`/trips/${id}/expenses/${expenseId}`),
};
