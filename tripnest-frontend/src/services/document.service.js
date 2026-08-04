import axios from 'axios';
import authService from './auth.service';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getDocuments = (tripId) =>
  axios.get(`/api/trips/${tripId}/documents`, { headers: getAuthHeader() }).then((r) => r.data);

export const uploadDocument = (tripId, file, docType = 'OTHER') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('docType', docType);
  return axios.post(`/api/trips/${tripId}/documents/upload`, formData, {
    headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

export const deleteDocument = (tripId, docId) =>
  axios.delete(`/api/trips/${tripId}/documents/${docId}`, { headers: getAuthHeader() });

export const getDownloadUrl = (tripId, docId) => `/api/trips/${tripId}/documents/${docId}/download`;

const documentService = { getDocuments, uploadDocument, deleteDocument, getDownloadUrl };
export default documentService;
