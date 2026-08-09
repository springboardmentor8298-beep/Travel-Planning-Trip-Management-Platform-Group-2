import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

/**
 * Top navigation bar — shown on all authenticated pages.
 * Includes a clickable profile dropdown with user details.
 */
const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build display name and initials
  const firstName = currentUser?.firstName || '';
  const lastName  = currentUser?.lastName  || '';
  const fullName  = (firstName + ' ' + lastName).trim() || currentUser?.username || 'User';
  const initials  = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : (currentUser?.username?.[0] || 'U').toUpperCase();

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
          <Link to="/destinations" className={isActive('/destinations')}>Destinations</Link>
          <Link to="/analytics" className={isActive('/analytics')}>Analytics</Link>
        </div>

        {/* User Info + Notifications */}
        <div className="nav-user">
          <NotificationBell />

          {/* Profile Avatar + Dropdown */}
          <div className="profile-menu" ref={dropdownRef}>
            <button
              id="profile-avatar-btn"
              className="profile-avatar-btn"
              onClick={() => setProfileOpen((o) => !o)}
              title="View profile"
              aria-expanded={profileOpen}
            >
              <span className="profile-avatar">{initials}</span>
              <span className="profile-display-name">{fullName}</span>
              <span className="profile-caret">{profileOpen ? '▲' : '▼'}</span>
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                {/* Avatar header */}
                <div className="profile-dropdown__header">
                  <div className="profile-dropdown__avatar">{initials}</div>
                  <div className="profile-dropdown__info">
                    <div className="profile-dropdown__name">{fullName}</div>
                    <div className="profile-dropdown__username">@{currentUser?.username}</div>
                  </div>
                </div>
                <div className="profile-dropdown__divider" />
                {/* Details */}
                <div className="profile-dropdown__detail">
                  <span className="profile-dropdown__label">📧 Email</span>
                  <span className="profile-dropdown__value">{currentUser?.email || '—'}</span>
                </div>
                {currentUser?.phone && (
                  <div className="profile-dropdown__detail">
                    <span className="profile-dropdown__label">📱 Phone</span>
                    <span className="profile-dropdown__value">{currentUser.phone}</span>
                  </div>
                )}
                <div className="profile-dropdown__detail">
                  <span className="profile-dropdown__label">🎭 Role</span>
                  <span className="profile-dropdown__value">
                    {(currentUser?.roles || [])
                      .map(r => r.replace('ROLE_', ''))
                      .join(', ') || '—'}
                  </span>
                </div>
                <div className="profile-dropdown__divider" />
                <button
                  id="profile-logout-btn"
                  className="profile-dropdown__logout"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
