import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.service';
import { useTheme } from '../context/ThemeContext';

/**
 * Registration page — premium dark design matching Login.
 */
const TRAVEL_ROLES = [
  { value: '', label: 'Traveler (default)' },
  { value: 'traveler', label: '🌍 Traveler' },
  { value: 'agent', label: '💼 Travel Agent' },
  { value: 'admin', label: '🛡️ Administrator' },
];

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    const roles = formData.role ? [formData.role] : [];
    try {
      await authService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.phone,
        roles
      );
      setSuccess(true);
      setMessage('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(
        (error.response?.data?.message) || error.message || 'Registration failed.'
      );
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.9rem',
    background: 'var(--bg-glass)',
    border: '1px solid var(--border-strong)',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '0.5rem',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16,185,129,0.09), transparent), var(--bg-base)',
      position: 'relative',
    }}>
      {/* Floating theme toggle */}
      <button
        onClick={toggleTheme}
        id="register-theme-toggle"
        style={{
          position: 'fixed', top: '1rem', right: '1rem',
          width: '40px', height: '40px', borderRadius: '50%',
          border: '1px solid var(--border-strong)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(8px)',
          fontSize: '1.1rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, transition: 'all 0.25s',
          color: 'var(--text-secondary)',
        }}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle theme"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Grid dot bg */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-strong)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        animation: 'fadeUp 0.4s ease',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.7))' }}>
              <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg,#10b981,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TripNest</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Create your account</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Join thousands of travelers planning smarter</p>
        </div>

        <form onSubmit={handleSubmit} id="register-form">
          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.125rem' }}>
            <div>
              <label style={labelStyle} htmlFor="reg-firstname">First Name</label>
              <input id="reg-firstname" name="firstName" type="text" style={inputStyle}
                className="form-input" placeholder="First Name"
                value={formData.firstName} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="reg-lastname">Last Name</label>
              <input id="reg-lastname" name="lastName" type="text" style={inputStyle}
                className="form-input" placeholder="Last Name"
                value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          {/* Username */}
          <div style={{ marginBottom: '1.125rem' }}>
            <label style={labelStyle} htmlFor="reg-username">Username</label>
            <input id="reg-username" name="username" type="text" className="form-input"
              placeholder="Choose a username (3–20 chars)"
              value={formData.username} onChange={handleChange}
              required minLength={3} maxLength={20} />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1.125rem' }}>
            <label style={labelStyle} htmlFor="reg-email">Email Address</label>
            <input id="reg-email" name="email" type="email" className="form-input"
              placeholder="you@example.com"
              value={formData.email} onChange={handleChange} required />
          </div>

          {/* Phone + Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.125rem' }}>
            <div>
              <label style={labelStyle} htmlFor="reg-phone">Phone</label>
              <input id="reg-phone" name="phone" type="tel" className="form-input"
                placeholder="+91 98765 43210"
                value={formData.phone} onChange={handleChange} maxLength={15} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="reg-role">Role</label>
              <select id="reg-role" name="role" className="form-input form-select"
                value={formData.role} onChange={handleChange}>
                {TRAVEL_ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle} htmlFor="reg-password">Password</label>
            <input id="reg-password" name="password" type="password" className="form-input"
              placeholder="Min 6 characters"
              value={formData.password} onChange={handleChange} required minLength={6} />
          </div>

          {message && (
            <div className={`alert ${success ? 'alert-success' : 'alert-error'}`} role="alert" style={{ marginBottom: '1.25rem' }}>
              {message}
            </div>
          )}

          <button
            id="register-submit-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading || success}
          >
            {loading ? <span className="spinner" /> : success ? '✓ Account Created!' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
