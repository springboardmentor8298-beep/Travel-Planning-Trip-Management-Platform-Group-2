import axios from 'axios';
import authService from './auth.service';

const API_URL = 'http://localhost:8085/api/documents';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const createDocument = async (tripId, documentData) => {
  const response = await axios.post(`${API_URL}?tripId=${tripId}`, documentData, { headers: getAuthHeader() });
  return response.data;
};

const updateDocument = async (documentId, documentData) => {
  const response = await axios.put(`${API_URL}/${documentId}`, documentData, { headers: getAuthHeader() });
  return response.data;
};

const deleteDocument = async (documentId) => {
  await axios.delete(`${API_URL}/${documentId}`, { headers: getAuthHeader() });
};

const getDocument = async (documentId) => {
  const response = await axios.get(`${API_URL}/${documentId}`, { headers: getAuthHeader() });
  return response.data;
};

const getTripDocuments = async (tripId) => {
  const response = await axios.get(`${API_URL}/trip/${tripId}`, { headers: getAuthHeader() });
  return response.data;
};

const getTripDocumentsByType = async (tripId, documentType) => {
  const response = await axios.get(`${API_URL}/trip/${tripId}/type/${documentType}`, { headers: getAuthHeader() });
  return response.data;
};

const getUserDocuments = async () => {
  const response = await axios.get(`${API_URL}/user`, { headers: getAuthHeader() });
  return response.data;
};

export default {
  createDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  getTripDocuments,
  getTripDocumentsByType,
  getUserDocuments
};
