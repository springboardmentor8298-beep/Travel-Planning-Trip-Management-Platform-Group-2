import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api/budget-shares';

export const budgetShareService = {
  // Create a budget share
  createBudgetShare: async (shareData) => {
    const response = await axios.post(API_BASE_URL, shareData);
    return response.data;
  },

  // Update a budget share
  updateBudgetShare: async (shareId, shareData) => {
    const response = await axios.put(`${API_BASE_URL}/${shareId}`, shareData);
    return response.data;
  },

  // Delete a budget share
  deleteBudgetShare: async (shareId) => {
    const response = await axios.delete(`${API_BASE_URL}/${shareId}`);
    return response.data;
  },

  // Get a specific budget share
  getBudgetShare: async (shareId) => {
    const response = await axios.get(`${API_BASE_URL}/${shareId}`);
    return response.data;
  },

  // Get budget shares for a trip
  getBudgetSharesByTrip: async (tripId) => {
    const response = await axios.get(`${API_BASE_URL}/trip/${tripId}`);
    return response.data;
  },

  // Get budget shares for current user
  getBudgetSharesByUser: async () => {
    const response = await axios.get(`${API_BASE_URL}/user`);
    return response.data;
  },

  // Get budget shares for a group
  getBudgetSharesByGroup: async (groupId) => {
    const response = await axios.get(`${API_BASE_URL}/group/${groupId}`);
    return response.data;
  },

  // Create equal shares for a group
  createEqualSharesForGroup: async (tripId, groupId) => {
    const response = await axios.post(`${API_BASE_URL}/equal-shares/${tripId}/${groupId}`);
    return response.data;
  },

  // Confirm a budget share
  confirmShare: async (shareId) => {
    const response = await axios.put(`${API_BASE_URL}/${shareId}/confirm`);
    return response.data;
  },

  // Mark a share as paid
  markAsPaid: async (shareId) => {
    const response = await axios.put(`${API_BASE_URL}/${shareId}/paid`);
    return response.data;
  },

  // Get total paid amount for a trip
  getTotalPaidAmount: async (tripId) => {
    const response = await axios.get(`${API_BASE_URL}/trip/${tripId}/paid-total`);
    return response.data;
  },

  // Get total budget amount for a trip
  getTotalBudgetAmount: async (tripId) => {
    const response = await axios.get(`${API_BASE_URL}/trip/${tripId}/total-budget`);
    return response.data;
  }
};
