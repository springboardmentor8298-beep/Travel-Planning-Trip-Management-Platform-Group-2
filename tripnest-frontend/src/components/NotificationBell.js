import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getNotifications, markAsRead, markAllRead } from '../services/notification.service';

const TYPE_ICONS = {
  TRIP_REMINDER: '🗓️',
  BUDGET_ALERT: '💸',
  GROUP_INVITE: '👥',
  ACTIVITY_REMINDER: '⏰',
  GENERAL: '🔔',
};

const POLL_INTERVAL = 30000; // 30 seconds

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const intervalRef = useRef(null);

  const load = useCallback(() => {
    getNotifications().then(setNotifications).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-IN');
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="notification-bell__btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        id="notification-bell-btn"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown" id="notification-dropdown">
          <div className="notification-dropdown__header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={handleMarkAllRead}>Mark all read</button>
            )}
          </div>
          <div className="notification-dropdown__list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No notifications yet</div>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <div
                  key={n.id}
                  className={`notification-item ${!n.read ? 'notification-item--unread' : ''}`}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                >
                  <span className="notification-item__icon">{TYPE_ICONS[n.type] || '🔔'}</span>
                  <div className="notification-item__body">
                    <div className="notification-item__title">{n.title}</div>
                    <div className="notification-item__msg">{n.message}</div>
                    <div className="notification-item__time">{formatTime(n.createdAt)}</div>
                  </div>
                  {!n.read && <span className="notification-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
