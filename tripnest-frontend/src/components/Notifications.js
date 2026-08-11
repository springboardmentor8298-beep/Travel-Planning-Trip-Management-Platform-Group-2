import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import notificationService from '../services/notification.service';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = filter === 'unread' 
        ? await notificationService.getUnreadNotifications()
        : await notificationService.getUserNotifications();
      setNotifications(data);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to load unread count');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      setError('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationService.deleteNotification(notificationId);
        loadNotifications();
        loadUnreadCount();
      } catch (err) {
        setError('Failed to delete notification');
      }
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      TRIP_INVITE: '🎉',
      EXPENSE_ALERT: '💰',
      GROUP_UPDATE: '👥',
      ITINERARY_CHANGE: '📅',
      SYSTEM: '🔔'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (notification) => {
    if (!notification.read) return 'var(--gradient-primary)';
    return 'var(--color-bg-alt)';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Notifications 🔔</h1>
            <p className="page-subtitle">Stay updated with your travel activities</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="badge" style={{ 
              background: unreadCount > 0 ? 'var(--gradient-primary)' : 'var(--color-bg-alt)',
              color: '#fff'
            }}>
              {unreadCount} unread
            </span>
            {unreadCount > 0 && (
              <button className="btn btn-outline btn-auto" onClick={handleMarkAllAsRead}>
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Filter Tabs */}
        <div className="section-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn btn-auto ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setFilter('all'); loadNotifications(); }}
            >
              All
            </button>
            <button 
              className={`btn btn-auto ${filter === 'unread' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setFilter('unread'); loadNotifications(); }}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="section-card">
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
            {filter === 'unread' ? 'Unread Notifications' : 'All Notifications'}
          </h2>
          {loading ? (
            <div className="loading-text">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <p>
                {filter === 'unread' 
                  ? 'No unread notifications. You\'re all caught up!' 
                  : 'No notifications yet. We\'ll notify you when something important happens.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '8px',
                    background: getNotificationColor(notification),
                    border: notification.read ? '1px solid var(--color-border)' : '2px solid var(--gradient-primary)',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>{notification.title}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-muted)' }}>
                      {notification.message}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!notification.read && (
                        <button 
                          className="btn btn-sm btn-primary btn-auto"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as Read
                        </button>
                      )}
                      <button 
                        className="btn btn-sm btn-danger btn-auto"
                        onClick={() => handleDelete(notification.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="section-card">
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Notification Preferences</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
              <div>
                <strong>Trip Invites</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  Get notified when someone invites you to a trip
                </p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
              <div>
                <strong>Expense Alerts</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  Get notified when expenses are added to your trips
                </p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
              <div>
                <strong>Group Updates</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  Get notified about group activity and changes
                </p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
              <div>
                <strong>Itinerary Changes</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  Get notified when trip itineraries are updated
                </p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
