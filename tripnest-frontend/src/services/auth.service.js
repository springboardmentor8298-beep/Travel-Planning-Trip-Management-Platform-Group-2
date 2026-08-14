import axios from 'axios';

const API_URL = '/api/auth/';

/**
 * Authentication service — handles login, registration, and token storage.
 * JWT is stored in localStorage under the key 'tripnest_user'.
 */
const register = (username, email, password, firstName, lastName, phone, roles) => {
  return axios.post(API_URL + 'signup', {
    username,
    email,
    password,
    firstName,
    lastName,
    phone,
    role: roles,
  });
};

const login = (username, password) => {
  return axios
    .post(API_URL + 'signin', { username, password })
    .then((response) => {
      if (response.data.token) {
        localStorage.setItem('tripnest_user', JSON.stringify(response.data));
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem('tripnest_user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('tripnest_user'));
};

const googleLogin = (payload) => {
  return axios.post(API_URL + 'oauth2/google', payload).then((response) => {
    if (response.data.token) {
      localStorage.setItem('tripnest_user', JSON.stringify(response.data));
    }
    return response.data;
  });
};

const getToken = () => {
  const user = getCurrentUser();
  return user ? user.token : null;
};

const authService = {
  register,
  login,
  googleLogin,
  logout,
  getCurrentUser,
  getToken,
};

export default authService;
