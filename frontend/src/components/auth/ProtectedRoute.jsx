import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryToken = searchParams.get("token");
  const queryEmail = searchParams.get("email");
  const queryRole = searchParams.get("role");

  if (queryToken) {
    localStorage.setItem("token", queryToken);
    if (queryEmail) localStorage.setItem("email", queryEmail);
    if (queryRole) localStorage.setItem("role", queryRole);

    // Clean query parameters from URL bar
    window.history.replaceState({}, document.title, location.pathname);
  }

  const token = localStorage.getItem("token");

  // Ensure token is a valid truthy string and not stale fallback representations
  if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
    return children;
  }

  return <Navigate to="/" replace />;
}

export default ProtectedRoute;
