import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Top navigation bar — shown on all authenticated pages.
 */
const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

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
    </nav>
  );
};

export default Navbar;
