import axios from 'axios';
import authService from './auth.service';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const getExpenses = (tripId) =>
  axios.get(`/api/trips/${tripId}/expenses`, { headers: getAuthHeader() }).then((r) => r.data);

export const getBudgetSummary = (tripId) =>
  axios.get(`/api/trips/${tripId}/expenses/summary`, { headers: getAuthHeader() }).then((r) => r.data);

export const addExpense = (tripId, data) =>
  axios.post(`/api/trips/${tripId}/expenses`, data, { headers: getAuthHeader() }).then((r) => r.data);

export const updateExpense = (tripId, id, data) =>
  axios.put(`/api/trips/${tripId}/expenses/${id}`, data, { headers: getAuthHeader() }).then((r) => r.data);

export const deleteExpense = (tripId, id) =>
  axios.delete(`/api/trips/${tripId}/expenses/${id}`, { headers: getAuthHeader() });

const expenseService = { getExpenses, getBudgetSummary, addExpense, updateExpense, deleteExpense };
export default expenseService;
