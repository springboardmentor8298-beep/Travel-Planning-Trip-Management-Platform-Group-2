import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../api/authApi';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateFromToken = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        clearTokens();
        setIsLoading(false);
        return;
      }
      const { data } = await authApi.me();
      setUser(data.data);
    } catch (err) {
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateFromToken();
  }, [hydrateFromToken]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    const { accessToken, refreshToken, user: userSummary } = data.data;
    setTokens(accessToken, refreshToken);
    setUser(userSummary);
    return userSummary;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    const { accessToken, refreshToken, user: userSummary } = data.data;
    setTokens(accessToken, refreshToken);
    setUser(userSummary);
    return userSummary;
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
