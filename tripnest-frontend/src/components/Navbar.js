import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notification.service';

/**
 * Top navigation bar — shown on all authenticated pages.
 * Polls for unread notifications every 30 seconds and shows a badge.
 */
const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  // Poll for unread notification count
  useEffect(() => {
    if (!currentUser) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count || 0);
      } catch (err) {
        // Silently fail — don't break the UI if this fails
      }
    };

    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentUser]);

  return (
    <nav className="top-navbar">
      <div className="nav-container">
        {/* Brand */}
        <Link to="/dashboard" className="nav-brand">
          <span className="nav-brand-icon">✈️</span>
          <span className="nav-brand-text">TripNest</span>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
          <Link to="/trips" className={isActive('/trips')}>My Trips</Link>
          <Link to="/groups" className={isActive('/groups')}>Groups</Link>
          <Link to="/chat" className={isActive('/chat')}>Chat</Link>
          {/* Notifications link with unread badge */}
          <Link to="/notifications" className={isActive('/notifications')} style={{ position: 'relative' }}>
            Notifications
            {unreadCount > 0 && (
              <span
                id="navbar-notification-badge"
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-10px',
                  background: 'linear-gradient(135deg, #ff4d6d, #c9184a)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(201, 24, 74, 0.5)',
                  animation: 'pulse-badge 2s ease-in-out infinite',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link to="/destinations" className={isActive('/destinations')}>Destinations</Link>
          <Link to="/profile" className={isActive('/profile')}>Profile</Link>
        </div>

        {/* User Info + Logout */}
        <div className="nav-user">
          <span className="nav-username">
            👤 {currentUser?.firstName || currentUser?.username}
          </span>
          <button id="navbar-logout-btn" className="btn btn-sm btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Pulse animation for badge */}
      <style>{`
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(201, 24, 74, 0.5); }
          50% { transform: scale(1.15); box-shadow: 0 2px 14px rgba(201, 24, 74, 0.8); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
