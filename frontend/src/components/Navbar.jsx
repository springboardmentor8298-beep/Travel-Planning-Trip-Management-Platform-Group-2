import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logo from "../assets/tripnest-logo.jpg";
import { FaSearch, FaBell, FaSignOutAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { getUnreadNotificationCount, getNotifications } from "../services/api";
import "../styles/AppLayout.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = localStorage.getItem("email") || "traveler@tripnest.com";
  const initial = email.charAt(0).toUpperCase();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifList, setNotifList] = useState([]);

  useEffect(() => {
    const fetchNotifData = async () => {
      try {
        const countRes = await getUnreadNotificationCount();
        setUnreadCount(countRes.data?.unreadCount || 0);

        const notifRes = await getNotifications();
        setNotifList(Array.isArray(notifRes.data) ? notifRes.data.slice(0, 3) : []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    fetchNotifData();
    const interval = setInterval(fetchNotifData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const handleNavClick = (e, path) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) {
      return;
    }
    e.preventDefault();
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <nav className="app-navbar" aria-label="Main Navigation">
      {/* Brand Logo */}
      <Link
        to="/dashboard"
        onClick={(e) => handleNavClick(e, "/dashboard")}
        className="app-navbar-brand"
      >
        <img src={logo} alt="TripNest Logo" className="app-navbar-logo" />
        <span>TripNest</span>
      </Link>

      {/* Global Search Bar */}
      <div className="app-navbar-search">
        <FaSearch className="app-navbar-search-icon" />
        <input
          type="text"
          placeholder="Search trips, destinations, activities..."
          aria-label="Global Search"
        />
        <span className="app-navbar-search-shortcut">/</span>
      </div>

      {/* Right Controls */}
      <div className="app-navbar-right">
        {/* Notification Bell Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            className="app-navbar-nav-item"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            type="button"
          >
            <FaBell />
            {unreadCount > 0 && <span className="app-navbar-unread-dot"></span>}
          </button>

          {showNotifications && (
            <div
              className="app-glass-card"
              style={{
                position: "absolute",
                top: "54px",
                right: "0",
                width: "320px",
                padding: "16px",
                zIndex: 1100,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-dark font-weight-bold" style={{ fontSize: "14px", fontWeight: "700" }}>
                  Notifications
                </span>
                <span className="badge bg-primary" style={{ fontSize: "11px", borderRadius: "10px" }}>
                  {unreadCount} Unread
                </span>
              </div>

              <div className="d-flex flex-column gap-2 mb-2" style={{ fontSize: "13px" }}>
                {notifList.length > 0 ? (
                  notifList.map((n) => (
                    <div key={n.notificationId || n.id} className="p-2 rounded bg-light border text-dark">
                      {n.notificationType === "BUDGET_ALERT" ? (
                        <FaExclamationCircle className="text-warning me-2" />
                      ) : (
                        <FaCheckCircle className="text-primary me-2" />
                      )}
                      <strong>{n.notificationTitle}:</strong> {n.message}
                    </div>
                  ))
                ) : (
                  <div className="text-muted text-center py-2" style={{ fontSize: "12px" }}>
                    No recent notifications
                  </div>
                )}
              </div>

              <Link
                to="/notifications"
                onClick={(e) => {
                  setShowNotifications(false);
                  handleNavClick(e, "/notifications");
                }}
                className="d-block text-center text-primary font-weight-bold pt-2 border-top"
                style={{ fontSize: "12px", textDecoration: "none" }}
              >
                View All Notifications →
              </Link>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <Link
          to="/profile"
          onClick={(e) => handleNavClick(e, "/profile")}
          className="app-navbar-user"
        >
          <div className="app-navbar-avatar">{initial}</div>
          <span className="app-navbar-username">{email.split("@")[0]}</span>
        </Link>

        {/* Logout Action */}
        <button
          className="app-navbar-nav-item"
          onClick={handleLogout}
          aria-label="Logout"
          title="Sign Out"
          type="button"
        >
          <FaSignOutAlt />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
