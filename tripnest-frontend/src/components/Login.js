import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/**
 * Login page component — premium dark split-screen design.
 */
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPw, setShowPw] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleGoogleCredentialResponse = useCallback(async (response) => {
    try {
      setLoading(true);
      setMessage('');
      // Parse Google JWT credential token payload
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      await loginWithGoogle({
        email: payload.email,
        name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || 'Google User',
        avatarUrl: payload.picture,
        provider: 'google'
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setMessage(err.response?.data?.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  }, [loginWithGoogle, navigate]);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '245352485800-uvquov8ph6rtqp4q7uj75a7ff947i5sf.apps.googleusercontent.com';

    const renderGoogleBtn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const btnContainer = document.getElementById('google-signin-btn-container');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          window.google.accounts.id.renderButton(btnContainer, {
            type: 'standard',
            theme: isDark ? 'filled_black' : 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 320,
            logo_alignment: 'left'
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      renderGoogleBtn();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          renderGoogleBtn();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [isDark, handleGoogleCredentialResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      setMessage(
        (error.response?.data?.message) || error.message || 'Login failed. Please check your credentials.'
      );
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-base)',
      overflow: 'hidden',
    }}>
      {/* Floating theme toggle */}
      <button
        onClick={toggleTheme}
        id="login-theme-toggle"
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

      {/* Left Panel — Branding */}
      <div style={{
        display: 'none',
        flex: 1,
        background: 'linear-gradient(135deg, #051424 0%, #0a2240 40%, #0d3360 100%)',
        padding: '3rem',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }} className="auth-left-panel">
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '340px', height: '340px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '60px', right: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '3rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.7))' }}>
              <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#10b981,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TripNest</span>
          </div>

          <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: '1.25rem', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.02em' }}>
            Plan your<br />
            <span style={{ background: 'linear-gradient(135deg,#10b981,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>perfect journey</span>
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.85)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '340px' }}>
            Track trips, manage budgets, collaborate with fellow travelers — all in one premium platform.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {[['🗺️', 'Smart Itineraries'], ['💰', 'Budget Tracking'], ['👥', 'Collaboration']].map(([icon, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{icon}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.08), transparent), var(--bg-base)',
        position: 'relative',
      }}>
        {/* Grid dot bg */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }} />

        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          animation: 'fadeUp 0.4s ease',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.7))' }}>
                <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
              </svg>
              <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg,#10b981,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TripNest</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Welcome back</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} id="login-form">
            {/* Username */}
            <div style={{ marginBottom: '1.125rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                Username
              </label>
              <input
                id="login-username"
                type="text"
                className="form-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1 }}
                  tabIndex={-1}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            {message && (
              <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
                {message}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginBottom: '1.25rem' }}
            >
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>

            {/* Divider */}
            <div style={{ position: 'relative', textAlign: 'center', margin: '1.25rem 0' }}>
              <div style={{ height: '1px', background: 'var(--border)', width: '100%' }} />
              <span style={{ position: 'relative', top: '-0.55rem', background: 'var(--bg-card)', padding: '0 0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                or continue with
              </span>
            </div>

            {/* Sign in with Google Container */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', minHeight: '44px' }}>
              <div id="google-signin-btn-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
            </div>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;
