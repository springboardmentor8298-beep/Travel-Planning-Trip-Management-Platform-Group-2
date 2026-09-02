import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("tripnest_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [, setToken] = useState(() =>
    localStorage.getItem("tripnest_token"),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const persistSession = (data) => {
    localStorage.setItem("tripnest_token", data.token);
    setToken(data.token);
    const userData = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem("tripnest_user", JSON.stringify(userData));
    setUser(userData);
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem("tripnest_token");
    localStorage.removeItem("tripnest_user");
    setToken(null);
    setUser(null);
  }, []);

  const persistToken = useCallback(
    async (newToken) => {
      localStorage.setItem("tripnest_token", newToken);
      setToken(newToken);
      setLoading(true);
      setError(null);

      try {
        const res = await authApi.getProfile();
        const userData = {
          id: res.data.id,
          fullName: res.data.fullName,
          email: res.data.email,
          role: res.data.role,
        };
        localStorage.setItem("tripnest_user", JSON.stringify(userData));
        setUser(userData);
      } catch (err) {
        clearSession();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    },
    [clearSession],
  );

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("tripnest_token");
    if (!token) {
      setInitialized(true);
      return;
    }

    if (user) {
      setInitialized(true);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.getProfile();
      const userData = {
        id: res.data.id,
        fullName: res.data.fullName,
        email: res.data.email,
        role: res.data.role,
      };
      localStorage.setItem("tripnest_user", JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      clearSession();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [clearSession, user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      persistSession(res.data);
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Check your credentials.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.register(payload);
      persistSession(res.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        persistToken,
        login,
        register,
        logout,
        loading,
        error,
        setError,
        initialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
