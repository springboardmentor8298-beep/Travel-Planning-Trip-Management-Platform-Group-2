import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import NotificationService from "../services/notificationService";

const Notifications = () => {

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async (showLoading = false) => {

    try {

      if (showLoading) {
        setLoading(true);
      }

      const data =
        await NotificationService.getNotifications();

      // Make sure response is always an array
      setNotifications(
        Array.isArray(data) ? data : []
      );

    } catch (error) {

      console.error(
        "Error loading notifications:",
        error
      );

    } finally {

      if (showLoading) {
        setLoading(false);
      }

    }
  };


  // ==========================================
  // INITIAL LOAD + AUTO REFRESH
  // ==========================================

  useEffect(() => {

    // Initial load
    fetchNotifications(true);

    // Check for new notifications every 5 seconds
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 5000);

    // Stop timer when page is closed
    return () => {
      clearInterval(interval);
    };

  }, []);


  // ==========================================
  // MARK ONE AS READ
  // ==========================================

  const handleMarkAsRead = async (id) => {

    try {

      await NotificationService.markAsRead(id);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true
              }
            : notification
        )
      );

    } catch (error) {

      console.error(
        "Error marking notification:",
        error
      );

    }
  };


  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const handleMarkAllAsRead = async () => {

    try {

      await NotificationService.markAllAsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true
        }))
      );

    } catch (error) {

      console.error(
        "Error marking all notifications:",
        error
      );

    }
  };


  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {

    if (
      !window.confirm(
        "Delete this notification?"
      )
    ) {
      return;
    }

    try {

      await NotificationService.deleteNotification(id);

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification.id !== id
        )
      );

    } catch (error) {

      console.error(
        "Error deleting notification:",
        error
      );

    }
  };


  // ==========================================
  // ICON
  // ==========================================

  const getIcon = (type) => {

    switch (type) {

      case "COLLABORATION":
        return "👥";

      case "EXPENSE":
        return "💰";

      case "DOCUMENT":
        return "📄";

      case "ITINERARY":
        return "📅";

      case "TRIP":
        return "✈️";

      default:
        return "🔔";
    }
  };


  // ==========================================
  // DATE
  // ==========================================

  const formatDate = (date) => {

    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  };


  // ==========================================
  // UNREAD COUNT
  // ==========================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;


  return (
    <div style={styles.container}>

      <Sidebar />

      <main style={styles.main}>

        {/* =====================================
            HEADER
        ===================================== */}

        <div style={styles.header}>

          <div>

            <h1 style={styles.title}>
              🔔 Notifications
            </h1>

            <p style={styles.subtitle}>
              Stay updated with your trips
              and activities.
            </p>

          </div>


          {unreadCount > 0 && (

            <button
              className="btn-aurora"
              onClick={handleMarkAllAsRead}
            >
              ✓ Mark All as Read
            </button>

          )}

        </div>


        {/* =====================================
            LOADING
        ===================================== */}

        {loading ? (

          <div
            className="glass-card"
            style={styles.empty}
          >
            Loading notifications...
          </div>

        ) : notifications.length === 0 ? (

          /* ===================================
             EMPTY
          =================================== */

          <div
            className="glass-card"
            style={styles.empty}
          >

            <span style={styles.emptyIcon}>
              🔔
            </span>

            <h3 style={styles.emptyTitle}>
              No notifications
            </h3>

            <p style={styles.emptyText}>
              You're all caught up!
            </p>

          </div>

        ) : (

          /* ===================================
             NOTIFICATION LIST
          =================================== */

          <div style={styles.list}>

            {notifications.map(
              (notification) => (

                <div
                  key={notification.id}
                  className="glass-card"
                  style={{
                    ...styles.notification,
                    ...(notification.read
                      ? styles.read
                      : styles.unread)
                  }}
                >

                  {/* ICON */}

                  <div style={styles.icon}>

                    {getIcon(
                      notification.type
                    )}

                  </div>


                  {/* CONTENT */}

                  <div style={styles.content}>

                    <p
                      style={styles.message}
                    >
                      {notification.message}
                    </p>

                    <p
                      style={styles.date}
                    >
                      {formatDate(
                        notification.createdAt
                      )}
                    </p>

                  </div>


                  {/* ACTIONS */}

                  <div style={styles.actions}>

                    {!notification.read && (

                      <button
                        className="btn-aurora"
                        onClick={() =>
                          handleMarkAsRead(
                            notification.id
                          )
                        }
                        style={{
                          fontSize: "12px",
                          padding: "6px 10px"
                        }}
                        title="Mark as read"
                      >
                        ✓
                      </button>

                    )}


                    <button
                      onClick={() =>
                        handleDelete(
                          notification.id
                        )
                      }
                      style={styles.deleteBtn}
                      title="Delete notification"
                    >
                      🗑️
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </main>

    </div>
  );
};


// ==========================================
// STYLES
// ==========================================

const styles = {

  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#0a0f1e"
  },

  main: {
    marginLeft: "260px",
    flex: 1,
    padding: "32px"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    gap: "20px"
  },

  title: {
    color: "#f1f5f9",
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "6px",
    fontFamily:
      "'Space Grotesk', sans-serif"
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "14px"
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  notification: {
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    transition: "all 0.2s ease"
  },

  unread: {
    border:
      "1px solid rgba(124,58,237,0.35)",
    background:
      "rgba(124,58,237,0.08)"
  },

  read: {
    opacity: 0.75
  },

  icon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background:
      "rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    flexShrink: 0
  },

  content: {
    flex: 1,
    minWidth: 0
  },

  message: {
    color: "#f1f5f9",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "6px"
  },

  date: {
    color: "#64748b",
    fontSize: "12px"
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },

  deleteBtn: {
    background:
      "rgba(239,68,68,0.1)",
    border:
      "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    borderRadius: "6px",
    cursor: "pointer",
    padding: "7px 10px"
  },

  empty: {
    padding: "60px 20px",
    textAlign: "center"
  },

  emptyIcon: {
    fontSize: "48px"
  },

  emptyTitle: {
    color: "#f1f5f9",
    marginTop: "14px",
    marginBottom: "6px"
  },

  emptyText: {
    color: "#64748b",
    fontSize: "14px"
  }

};

export default Notifications;