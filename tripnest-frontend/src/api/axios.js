import axios from "axios";

// Reads from .env (REACT_APP_API_BASE_URL) so a port change never requires
// touching source code again. Falls back to 8081 to match your current
// backend setup (server.port=8081 in application.properties).
const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081/api";

const api = axios.create({ baseURL });

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tripnest_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is genuinely invalid, clear it so the next page load
// correctly shows the login screen - but do NOT force-navigate immediately.
// A hard redirect here was firing on ANY 401 (including transient ones,
// or one tab's failed background poll wiping localStorage for every other
// open tab since localStorage is shared per-origin) and silently bounced
// the user mid-action with no explanation.
let unauthorizedHandler = null;
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("tripnest_token");
      localStorage.removeItem("tripnest_user");
      // Tell AuthContext to clear its `user` state too, so React and
      // localStorage agree and ProtectedRoute redirects via normal routing
      // (a soft <Navigate>) instead of a jarring full-page reload.
      if (unauthorizedHandler) unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);

export default api;
