import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import "../styles/Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
    };

    const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/notifications/all");
            if (res.data) {
                setNotifications(res.data);
            }
        } catch (error) {
            console.error("Fetch notifications error:", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await API.put(`/notifications/mark-read/${id}`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, status: "READ" } : n));
        } catch (error) {
            console.error("Mark read error:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.put("/notifications/mark-all-read");
            setNotifications(notifications.map(n => ({ ...n, status: "READ" })));
        } catch (error) {
            console.error("Mark all read error:", error);
        }
    };

    const unreadCount = notifications.filter(n => n.status === "UNREAD").length;

    return (
        <nav className="navbar navbar-expand-lg custom-navbar">
            <div className="container">
                <Link className="navbar-brand brand-title" to="/dashboard">
                    ✈️ <span className="brand-highlight">Trip</span>Nest
                </Link>

                <div className="navbar-nav-container">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className={isActive("/dashboard")} to="/dashboard">
                                🏠 Dashboard
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={isActive("/plan-trip")} to="/plan-trip">
                                ➕ Plan a Trip
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={isActive("/my-trips")} to="/my-trips">
                                🧳 My Trips
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={isActive("/destinations")} to="/destinations">
                                🏖️ Destinations
                            </Link>
                        </li>
                    </ul>

                    <div className="nav-user-actions d-flex align-items-center gap-3">
                        {/* Notification Bell Dropdown */}
                        <div className="notification-wrapper position-relative" ref={dropdownRef}>
                            <button
                                className="btn-bell"
                                onClick={() => setShowDropdown(!showDropdown)}
                                title="System Notifications"
                                aria-label="Notifications"
                            >
                                🔔
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>

                            {showDropdown && (
                                <div className="notification-dropdown shadow-lg rounded-4 p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                        <h6 className="fw-bold mb-0 text-dark">📢 System Notifications</h6>
                                        {unreadCount > 0 && (
                                            <button
                                                className="btn btn-sm btn-link text-decoration-none p-0 text-primary small fw-bold"
                                                onClick={markAllAsRead}
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>

                                    <div className="notification-list">
                                        {notifications.length === 0 ? (
                                            <p className="text-muted text-center py-3 mb-0 small">
                                                No notifications yet.
                                            </p>
                                        ) : (
                                            notifications.slice().reverse().map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={`notification-item p-2.5 mb-2 rounded-3 cursor-pointer ${
                                                        item.status === "UNREAD" ? "unread-bg" : "read-bg"
                                                    }`}
                                                    onClick={() => item.status === "UNREAD" && markAsRead(item.id)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-start gap-2">
                                                        <p className="mb-0 small text-dark">{item.message}</p>
                                                        {item.status === "UNREAD" && (
                                                            <span className="badge-unread-dot" title="Unread"></span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="btn btn-logout" onClick={logout}>
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;