import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("tripnest_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, email: userEmail, fullName } = res.data;
    localStorage.setItem("tripnest_token", token);
    localStorage.setItem("tripnest_user", JSON.stringify({ email: userEmail, fullName }));
    setUser({ email: userEmail, fullName });
    return res.data;
  };

  const register = async (fullName, email, password) => {
    const res = await api.post("/auth/register", { fullName, email, password });
    const { token, email: userEmail, fullName: name } = res.data;
    localStorage.setItem("tripnest_token", token);
    localStorage.setItem("tripnest_user", JSON.stringify({ email: userEmail, fullName: name }));
    setUser({ email: userEmail, fullName: name });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("tripnest_token");
    localStorage.removeItem("tripnest_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
