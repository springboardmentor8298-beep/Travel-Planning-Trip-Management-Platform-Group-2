import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import {
  Compass,
  MapPin,
  BarChart3,
  Shield,
  User,
  LogOut,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  LayoutDashboard
} from 'lucide-react';

/**
 * Top navigation bar — shown on all authenticated pages.
 * Features sleek vector icons and user dropdown.
 */
const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

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
          <span className="nav-brand-icon">
            <Compass size={22} />
          </span>
          <span className="nav-brand-text">TripNest</span>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link to="/dashboard" className={isActive('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>
          <Link to="/trips" className={isActive('/trips')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={16} />
            <span>My Trips</span>
          </Link>
          <Link to="/destinations" className={isActive('/destinations')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Compass size={16} />
            <span>Destinations</span>
          </Link>
          <Link to="/analytics" className={isActive('/analytics')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BarChart3 size={16} />
            <span>Analytics</span>
          </Link>
          {currentUser?.roles?.includes('ROLE_ADMIN') && (
            <Link to="/admin" className={isActive('/admin')} style={{ color: '#fb7185', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={16} />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* User Info + Notifications */}
        <div className="nav-user">
          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="theme-toggle"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

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
              <span className="profile-caret" style={{ display: 'inline-flex', alignItems: 'center' }}>
                {profileOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
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
                <div className="profile-dropdown__detail" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={14} className="text-muted" />
                  <span className="profile-dropdown__value">{currentUser?.email || '—'}</span>
                </div>
                {currentUser?.phone && (
                  <div className="profile-dropdown__detail" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={14} className="text-muted" />
                    <span className="profile-dropdown__value">{currentUser.phone}</span>
                  </div>
                )}
                <div className="profile-dropdown__detail" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Shield size={14} className="text-muted" />
                  <span className="profile-dropdown__value">
                    {(currentUser?.roles || [])
                      .map(r => r.replace('ROLE_', ''))
                      .join(', ') || '—'}
                  </span>
                </div>
                <div className="profile-dropdown__divider" />
                <Link
                  to="/profile"
                  className="profile-dropdown__logout"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', textDecoration: 'none', color: '#10b981', marginBottom: '0.25rem' }}
                  onClick={() => setProfileOpen(false)}
                >
                  <User size={15} />
                  <span>My Profile & Settings</span>
                </Link>
                {currentUser?.roles?.includes('ROLE_ADMIN') && (
                  <Link
                    to="/admin"
                    className="profile-dropdown__logout"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', textDecoration: 'none', color: '#f43f5e', marginBottom: '0.25rem' }}
                    onClick={() => setProfileOpen(false)}
                  >
                    <Shield size={15} />
                    <span>Admin Portal</span>
                  </Link>
                )}
                <button
                  id="profile-logout-btn"
                  className="profile-dropdown__logout"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
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
