import axios from 'axios';
import authService from './auth.service';

const API_URL = 'http://localhost:8085/api';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Send a trip invitation by inviteeUsername (preferred) or inviteeId (legacy).
 */
const sendInvitation = async (tripId, inviteeUsername, message) => {
  const response = await axios.post(
    `${API_URL}/trips/${tripId}/invitations`,
    { inviteeUsername, message },
    { headers: getAuthHeader() }
  );
  return response.data;
};

const getTripInvitations = async (tripId) => {
  const response = await axios.get(`${API_URL}/trips/${tripId}/invitations`, { headers: getAuthHeader() });
  return response.data;
};

const respondToInvitation = async (invitationId, accepted) => {
  const response = await axios.post(
    `${API_URL}/trips/0/invitations/${invitationId}/respond`,
    null,
    {
      params: { accepted },
      headers: getAuthHeader()
    }
  );
  return response.data;
};

const cancelInvitation = async (tripId, invitationId) => {
  await axios.delete(`${API_URL}/trips/${tripId}/invitations/${invitationId}`, { headers: getAuthHeader() });
};

const getPendingInvitations = async () => {
  const response = await axios.get(`${API_URL}/invitations/pending`, { headers: getAuthHeader() });
  return response.data;
};

const getSentInvitations = async () => {
  const response = await axios.get(`${API_URL}/invitations/sent`, { headers: getAuthHeader() });
  return response.data;
};

export default {
  sendInvitation,
  getTripInvitations,
  respondToInvitation,
  cancelInvitation,
  getPendingInvitations,
  getSentInvitations
};
