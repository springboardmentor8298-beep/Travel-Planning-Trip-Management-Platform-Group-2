import axios from 'axios';
import authService from './auth.service';

const API_URL = 'http://localhost:8085/api/expenses';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const createExpense = async (tripId, expenseData) => {
  const response = await axios.post(`${API_URL}/trip/${tripId}`, expenseData, { headers: getAuthHeader() });
  return response.data;
};

const updateExpense = async (expenseId, expenseData) => {
  const response = await axios.put(`${API_URL}/${expenseId}`, expenseData, { headers: getAuthHeader() });
  return response.data;
};

const deleteExpense = async (expenseId) => {
  await axios.delete(`${API_URL}/${expenseId}`, { headers: getAuthHeader() });
};

const getExpensesByTrip = async (tripId) => {
  const response = await axios.get(`${API_URL}/trip/${tripId}`, { headers: getAuthHeader() });
  return response.data;
};

const getExpensesByTripAndCategory = async (tripId, category) => {
  const response = await axios.get(`${API_URL}/trip/${tripId}/category/${category}`, { headers: getAuthHeader() });
  return response.data;
};

const getTotalExpensesByTrip = async (tripId) => {
  const response = await axios.get(`${API_URL}/trip/${tripId}/total`, { headers: getAuthHeader() });
  return response.data;
};

const getExpensesByCategory = async (tripId) => {
  const response = await axios.get(`${API_URL}/trip/${tripId}/by-category`, { headers: getAuthHeader() });
  return response.data;
};

const getExpensesByDateRange = async (tripId, startDate, endDate) => {
  const response = await axios.get(`${API_URL}/trip/${tripId}/date-range`, {
    params: { startDate, endDate },
    headers: getAuthHeader()
  });
  return response.data;
};

export default {
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesByTrip,
  getExpensesByTripAndCategory,
  getTotalExpensesByTrip,
  getExpensesByCategory,
  getExpensesByDateRange
};
