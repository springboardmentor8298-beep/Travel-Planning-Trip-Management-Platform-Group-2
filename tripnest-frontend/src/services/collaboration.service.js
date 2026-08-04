import axios from 'axios';
import authService from './auth.service';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Members ──────────────────────────────────────────────────────────────────

export const getMembers = (tripId) =>
  axios.get(`/api/trips/${tripId}/members`, { headers: getAuthHeader() }).then((r) => r.data);

export const inviteMember = (tripId, usernameOrEmail) =>
  axios.post(`/api/trips/${tripId}/members/invite`, { usernameOrEmail }, { headers: getAuthHeader() }).then((r) => r.data);

export const acceptInvite = (tripId, memberId) =>
  axios.put(`/api/trips/${tripId}/members/${memberId}/accept`, {}, { headers: getAuthHeader() }).then((r) => r.data);

export const declineInvite = (tripId, memberId) =>
  axios.put(`/api/trips/${tripId}/members/${memberId}/decline`, {}, { headers: getAuthHeader() }).then((r) => r.data);

export const removeMember = (tripId, memberId) =>
  axios.delete(`/api/trips/${tripId}/members/${memberId}`, { headers: getAuthHeader() });

// ─── Group Chat ───────────────────────────────────────────────────────────────

export const getMessages = (tripId) =>
  axios.get(`/api/trips/${tripId}/messages`, { headers: getAuthHeader() }).then((r) => r.data);

export const sendMessage = (tripId, message) =>
  axios.post(`/api/trips/${tripId}/messages`, { message }, { headers: getAuthHeader() }).then((r) => r.data);

const collaborationService = { getMembers, inviteMember, acceptInvite, declineInvite, removeMember, getMessages, sendMessage };
export default collaborationService;
