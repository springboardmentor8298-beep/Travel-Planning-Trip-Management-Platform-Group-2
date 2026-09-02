import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api, { markNotificationRead, markAllNotificationsRead, deleteNotification } from "../services/api";
import {
  FaBell,
  FaCheckDouble,
  FaTrashAlt,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPlane
} from "react-icons/fa";
import "../styles/AppLayout.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [alert, setAlert] = useState({ type: "", message: "" });

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to load notifications." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (item) => {
    try {
      await markNotificationRead(item.notificationId);
      setNotifications(notifications.map((n) => (n.notificationId === item.notificationId ? { ...n, isRead: true } : n)));
      setAlert({ type: "success", message: "Notification marked as read." });
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to update notification." });
    } finally {
      setTimeout(() => setAlert({ type: "", message: "" }), 2500);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setAlert({ type: "success", message: "All notifications marked as read." });
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to mark all as read." });
    } finally {
      setTimeout(() => setAlert({ type: "", message: "" }), 2500);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter((n) => n.notificationId !== id));
      setAlert({ type: "success", message: "Notification removed." });
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to delete notification." });
    } finally {
      setTimeout(() => setAlert({ type: "", message: "" }), 2500);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toUpperCase()) {
      case "BUDGET_ALERT":
      case "WARNING":
      case "ALERT":
        return <FaExclamationTriangle className="text-warning" />;
      case "TRIP_CREATED":
      case "SHARED_TRIP_ADDED":
      case "SHARED_TRIP_REMOVED":
        return <FaPlane className="text-primary" />;
      case "ACTIVITY_ADDED":
      case "REMINDER":
        return <FaCalendarAlt className="text-info" />;
      default:
        return <FaInfoCircle className="text-success" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    if (filter === "READ") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="app-dashboard-container">
      <Navbar />

      <div className="app-main-layout">
        <Sidebar />

        <main className="app-content-body">
          {/* Header */}
          <div className="app-page-header">
            <div className="app-page-title-wrap">
              <h1 className="app-page-title">Notifications & Alerts</h1>
              <p className="app-page-subtitle">Track trip reminders, activity notifications, and budget alerts.</p>
            </div>
          </div>

          {alert.message && (
            <div className={`app-alert-banner app-alert-${alert.type}`} role="alert">
              {alert.message}
            </div>
          )}

          {/* Filter Bar */}
          <div className="app-glass-card p-3 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-2">
              <span className="text-dark font-weight-bold" style={{ fontWeight: "700" }}>Filter Status:</span>
              <div className="btn-group" role="group" aria-label="Notification Filter Buttons">
                <button
                  onClick={() => setFilter("ALL")}
                  className={`btn btn-sm ${filter === "ALL" ? "btn-primary" : "btn-outline-secondary"}`}
                  type="button"
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter("UNREAD")}
                  className={`btn btn-sm ${filter === "UNREAD" ? "btn-primary" : "btn-outline-secondary"}`}
                  type="button"
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter("READ")}
                  className={`btn btn-sm ${filter === "READ" ? "btn-primary" : "btn-outline-secondary"}`}
                  type="button"
                >
                  Read ({notifications.length - unreadCount})
                </button>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="btn btn-sm btn-outline-primary"
                type="button"
                style={{ gap: "6px" }}
              >
                <FaCheckDouble /> Mark All as Read
              </button>
            )}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="app-loader-box">
              <div className="spinner-border text-primary" role="status"></div>
              <span>Fetching notifications...</span>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {filteredNotifications.map((item) => (
                <div
                  key={item.notificationId}
                  className={`app-glass-card p-4 d-flex justify-content-between align-items-center border ${
                    item.isRead ? "border-light" : "border-primary"
                  }`}
                  style={{ background: item.isRead ? "#FFFFFF" : "#F0F9FF" }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-3 bg-light rounded-3" style={{ fontSize: "1.25rem" }}>
                      {getNotificationIcon(item.notificationType)}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <strong className="text-dark h6 mb-0" style={{ fontWeight: "700" }}>
                          {item.notificationTitle}
                        </strong>
                        {!item.isRead && <span className="badge bg-primary">New</span>}
                      </div>
                      <p className="text-secondary mb-0" style={{ fontSize: "0.95rem" }}>
                        {item.message}
                      </p>
                      {item.createdAt && (
                        <small className="text-muted d-block mt-1" style={{ fontSize: "0.78rem" }}>
                          {new Date(item.createdAt).toLocaleString()}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item)}
                        className="btn btn-sm btn-outline-success"
                        style={{ borderRadius: "8px" }}
                        title="Mark as Read"
                        type="button"
                      >
                        <FaCheckDouble className="me-1" /> Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(item.notificationId)}
                      className="btn btn-sm btn-outline-danger"
                      style={{ borderRadius: "8px" }}
                      title="Delete Notification"
                      type="button"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="app-glass-card text-center p-5">
              <FaBell className="text-muted mb-3" style={{ fontSize: "3rem" }} />
              <h3 className="text-dark font-weight-bold">No Notifications</h3>
              <p className="text-muted">You have no pending alerts or travel notifications.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Notifications;