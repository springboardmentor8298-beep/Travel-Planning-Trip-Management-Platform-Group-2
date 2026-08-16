import { createContext, useContext, useState, useEffect } from "react";
import { authService, userService } from "../services/api";
import { setUnauthorizedHandler } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("tripnest_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  // Login/Register responses only return {token, email, fullName} - roles
  // aren't in the JWT payload, so a follow-up call to /users/me fetches
  // them. This is what lets the Sidebar conditionally show "Admin Panel"
  // only for users with the ADMINISTRATOR role.
  const fetchAndStoreFullProfile = async (baseUser) => {
    try {
      const profileRes = await userService.getMyProfile();
      const fullUser = { ...baseUser, roles: profileRes.data.roles };
      localStorage.setItem("tripnest_user", JSON.stringify(fullUser));
      setUser(fullUser);
      return fullUser;
    } catch {
      // If this fails for any reason, still let the user in with what we
      // have - they just won't see role-gated UI until next login.
      localStorage.setItem("tripnest_user", JSON.stringify(baseUser));
      setUser(baseUser);
      return baseUser;
    }
  };

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { token, email: userEmail, fullName } = res.data;
    localStorage.setItem("tripnest_token", token);
    await fetchAndStoreFullProfile({ email: userEmail, fullName });
    return res.data;
  };

  const register = async (fullName, email, password) => {
    const res = await authService.register(fullName, email, password);
    const { token, email: userEmail, fullName: name } = res.data;
    localStorage.setItem("tripnest_token", token);
    await fetchAndStoreFullProfile({ email: userEmail, fullName: name });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("tripnest_token");
    localStorage.removeItem("tripnest_user");
    setUser(null);
  };

  const isAdmin = user?.roles?.includes("ADMINISTRATOR") || false;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
