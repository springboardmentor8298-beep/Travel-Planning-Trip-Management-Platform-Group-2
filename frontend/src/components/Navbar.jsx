import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { CurrencyContext } from '../context/CurrencyContext';
import { Compass, MapPin, Bell, User, LogOut, Home, ShieldAlert, Sun, Moon, CheckCheck } from 'lucide-react';
import api from '../services/api';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currency, changeCurrency } = useContext(CurrencyContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, location.pathname]);

  const fetchNotifications = async () => {
    if (!user) return;
    const uid = user.email || user.username || user.id || 'default_user';
    try {
      const res = await api.get(`/notifications?userId=${encodeURIComponent(uid)}`);
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.read).length);
    } catch (e) {
      // Handle silently
    }
  };

  const markRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    const uid = user.email || user.username || user.id || 'default_user';
    try {
      await api.post(`/notifications/read-all?userId=${encodeURIComponent(uid)}`);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState && unreadCount > 0) {
      handleMarkAllRead();
    }
  };

  const handleAcceptInvite = async (notifId, e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/trips/invitations/${notifId}/accept`);
      alert(res.data?.message || 'Invitation accepted successfully!');
      fetchNotifications();
      window.dispatchEvent(new Event('trip_updated'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleDeclineInvite = async (notifId, e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/trips/invitations/${notifId}/decline`);
      alert(res.data?.message || 'Invitation declined.');
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline invitation');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 24px',
      transition: 'background 0.3s ease, border-color 0.3s ease'
    }}>
      <div style={{
        maxWidth: 1240,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo -> Connects to Main Page */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
          }}>
            <Compass size={22} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            Trip<span className="gradient-text">Nest</span>
          </span>
        </Link>

        {/* All Interconnected Page Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/" style={{
            color: location.pathname === '/' ? 'var(--primary-accent)' : 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Home size={18} /> Home
          </Link>

          {user && (
            <Link to="/dashboard" style={{
              color: location.pathname === '/dashboard' ? 'var(--primary-accent)' : 'var(--text-muted)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              Dashboard
            </Link>
          )}

          <Link to="/destinations" style={{
            color: location.pathname === '/destinations' ? 'var(--primary-accent)' : 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <MapPin size={18} /> Discover
          </Link>

          {user && (
            <>
              <Link to="/profile" style={{
                color: location.pathname === '/profile' ? 'var(--primary-accent)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <User size={18} /> Profile
              </Link>
              <Link to="/admin" style={{
                color: location.pathname === '/admin' ? 'var(--primary-accent)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <ShieldAlert size={18} /> Admin
              </Link>
            </>
          )}
        </div>

        {/* Right Actions, Currency Selector, Theme Toggle, Auth / User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Global Currency Selector Dropdown */}
          <select
            value={currency}
            onChange={(e) => changeCurrency(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 99,
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
          </select>

          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', borderRadius: 99, gap: 6, fontSize: '0.85rem' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
            <span style={{ fontWeight: 700 }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          {user ? (
            <>
              {/* Notification Badge */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={handleToggleNotifications}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', borderRadius: '50%', position: 'relative' }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      background: 'var(--danger)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    right: 0,
                    top: 48,
                    width: 340,
                    maxHeight: 420,
                    overflowY: 'auto',
                    padding: 16,
                    zIndex: 200
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Notifications</h4>
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-accent)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <CheckCheck size={14} /> Mark all as read
                      </button>
                    </div>

                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} onClick={() => markRead(n.id)} style={{
                          padding: '10px 12px',
                          borderRadius: 10,
                          marginBottom: 8,
                          background: n.read ? 'rgba(0,0,0,0.03)' : 'rgba(99,102,241,0.12)',
                          borderLeft: n.read ? '3px solid transparent' : '3px solid var(--primary-accent)',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <div>
                              <span style={{
                                display: 'inline-block',
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: n.type === 'BUDGET_ALERT' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)',
                                color: n.type === 'BUDGET_ALERT' ? '#f87171' : 'var(--primary-accent)',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                marginBottom: 4
                              }}>
                                {(n.type || 'SYSTEM').replace(/_/g, ' ')}
                              </span>
                              <p style={{ color: n.read ? 'var(--text-muted)' : 'var(--text-main)', lineHeight: 1.35, fontSize: '0.85rem' }}>{n.message}</p>
                              
                              {/* Invitation Accept/Reject Actions */}
                              {n.type === 'GROUP_INVITATION' && (
                                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                                  {(!n.status || n.status === 'PENDING') ? (
                                    <>
                                      <button
                                        onClick={(e) => handleAcceptInvite(n.id, e)}
                                        className="btn btn-primary"
                                        style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#10b981', borderColor: '#10b981' }}
                                      >
                                        Accept Trip
                                      </button>
                                      <button
                                        onClick={(e) => handleDeclineInvite(n.id, e)}
                                        className="btn btn-secondary"
                                        style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#ef4444' }}
                                      >
                                        Decline
                                      </button>
                                    </>
                                  ) : (
                                    <span style={{
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      color: n.status === 'ACCEPTED' ? '#10b981' : '#ef4444'
                                    }}>
                                      {n.status === 'ACCEPTED' ? '✓ ACCEPTED' : '✕ DECLINED'}
                                    </span>
                                  )}
                                </div>
                              )}

                              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: 4, display: 'block' }}>
                                {new Date(n.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User Badge & Logout */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, borderLeft: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{user.fullName || user.username}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.roles?.[0]?.replace('ROLE_', '') || 'Traveler'}</div>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 12px', color: 'var(--text-muted)' }} title="Sign Out">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ borderRadius: 99, padding: '8px 18px', fontSize: '0.9rem' }}>
                Sign In
              </button>
              <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ borderRadius: 99, padding: '8px 18px', fontSize: '0.9rem' }}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
