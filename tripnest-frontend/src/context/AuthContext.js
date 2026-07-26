import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

/**
 * AuthContext — provides the current user and auth actions to the entire app.
 * Wrap the app with <AuthProvider> and consume via useAuth() hook.
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setCurrentUser(data);
    return data;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const hasRole = (role) => {
    if (!currentUser || !currentUser.roles) return false;
    return currentUser.roles.includes(role);
  };

  const value = {
    currentUser,
    setCurrentUser,
    login,
    logout,
    hasRole,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
