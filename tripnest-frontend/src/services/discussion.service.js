import axios from 'axios';
import authService from './auth.service';

const API_URL = 'http://localhost:8085/api/groups';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const createDiscussion = async (groupId, title) => {
  const response = await axios.post(
    `${API_URL}/${groupId}/discussions`, 
    { title }, 
    { headers: getAuthHeader() }
  );
  return response.data;
};

const getGroupDiscussions = async (groupId) => {
  const response = await axios.get(
    `${API_URL}/${groupId}/discussions`, 
    { headers: getAuthHeader() }
  );
  return response.data;
};

const getDiscussion = async (discussionId) => {
  const response = await axios.get(
    `${API_URL}/0/discussions/${discussionId}`, 
    { headers: getAuthHeader() }
  );
  return response.data;
};

const deleteDiscussion = async (discussionId) => {
  await axios.delete(
    `${API_URL}/0/discussions/${discussionId}`, 
    { headers: getAuthHeader() }
  );
};

const addMessage = async (discussionId, content) => {
  const response = await axios.post(
    `${API_URL}/0/discussions/${discussionId}/messages`, 
    { content }, 
    { headers: getAuthHeader() }
  );
  return response.data;
};

const getDiscussionMessages = async (discussionId) => {
  const response = await axios.get(
    `${API_URL}/0/discussions/${discussionId}/messages`, 
    { headers: getAuthHeader() }
  );
  return response.data;
};

const deleteMessage = async (messageId) => {
  await axios.delete(
    `${API_URL}/0/discussions/0/messages/${messageId}`, 
    { headers: getAuthHeader() }
  );
};

export default {
  createDiscussion,
  getGroupDiscussions,
  getDiscussion,
  deleteDiscussion,
  addMessage,
  getDiscussionMessages,
  deleteMessage
};
