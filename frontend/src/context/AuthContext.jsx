import React, { createContext, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const session = sessionStorage.getItem('tripnest_user');
    if (session) return JSON.parse(session);

    const local = localStorage.getItem('tripnest_user');
    if (local) return JSON.parse(local);

    return null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (username, password, rememberMe = false) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const userData = response.data;
      setUser(userData);

      if (rememberMe) {
        localStorage.setItem('tripnest_user', JSON.stringify(userData));
        sessionStorage.setItem('tripnest_user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('tripnest_user');
        sessionStorage.setItem('tripnest_user', JSON.stringify(userData));
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, fullName, role) => {
    setLoading(true);
    try {
      await api.post('/auth/register', { username, email, password, fullName, role });
      return { success: true };
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg && typeof err.response?.data === 'string') {
        msg = err.response.data;
      }
      if (!msg) {
        msg = 'Registration failed. Please check your credentials and try again.';
      }
      return {
        success: false,
        message: msg,
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { email, newPassword });
      return { success: true, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Password reset failed.',
      };
    }
  };

  const googleLogin = async (email, name, rememberMe = false) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google', { email, name });
      const userData = response.data;
      setUser(userData);

      if (rememberMe) {
        localStorage.setItem('tripnest_user', JSON.stringify(userData));
        sessionStorage.setItem('tripnest_user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('tripnest_user');
        sessionStorage.setItem('tripnest_user', JSON.stringify(userData));
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Google authentication failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  const saveUserSession = (userData, rememberMe = false) => {
    setUser(userData);
    if (rememberMe) {
      localStorage.setItem('tripnest_user', JSON.stringify(userData));
      sessionStorage.setItem('tripnest_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('tripnest_user');
      sessionStorage.setItem('tripnest_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tripnest_user');
    sessionStorage.removeItem('tripnest_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, resetPassword, googleLogin, saveUserSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
