import axios from 'axios';
import authService from './auth.service';

const API_URL = 'http://localhost:8085/api/groups';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const createGroup = async (groupData) => {
  const response = await axios.post(API_URL, groupData, { headers: getAuthHeader() });
  return response.data;
};

const updateGroup = async (groupId, groupData) => {
  const response = await axios.put(`${API_URL}/${groupId}`, groupData, { headers: getAuthHeader() });
  return response.data;
};

const deleteGroup = async (groupId) => {
  await axios.delete(`${API_URL}/${groupId}`, { headers: getAuthHeader() });
};

const getGroup = async (groupId) => {
  const response = await axios.get(`${API_URL}/${groupId}`, { headers: getAuthHeader() });
  return response.data;
};

const getUserGroups = async () => {
  const response = await axios.get(API_URL, { headers: getAuthHeader() });
  return response.data;
};

/** Add member by numeric user ID (legacy). */
const addMemberToGroup = async (groupId, userId) => {
  await axios.post(`${API_URL}/${groupId}/members/${userId}`, {}, { headers: getAuthHeader() });
};

/** Add member by username (preferred). */
const addMemberByUsername = async (groupId, username) => {
  const response = await axios.post(
    `${API_URL}/${groupId}/members/by-username`,
    null,
    {
      params: { username },
      headers: getAuthHeader()
    }
  );
  return response.data;
};

const removeMemberFromGroup = async (groupId, userId) => {
  await axios.delete(`${API_URL}/${groupId}/members/${userId}`, { headers: getAuthHeader() });
};

const updateMemberRole = async (groupId, userId, role) => {
  await axios.put(`${API_URL}/${groupId}/members/${userId}/role`, null, {
    params: { role },
    headers: getAuthHeader()
  });
};

export default {
  createGroup,
  updateGroup,
  deleteGroup,
  getGroup,
  getUserGroups,
  addMemberToGroup,
  addMemberByUsername,
  removeMemberFromGroup,
  updateMemberRole
};
