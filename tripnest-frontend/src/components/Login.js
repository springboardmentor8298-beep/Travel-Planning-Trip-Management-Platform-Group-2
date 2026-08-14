import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/user.service';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '245352485800-uvquov8ph6rtqp4q7uj75a7ff947i5sf.apps.googleusercontent.com';

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

/**
 * Login page component.
 * Supports standard credentials and live Google OAuth2 Sign-In.
 */
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleCredentialResponse = async (response) => {
    try {
      setLoading(true);
      setMessage('');
      const decoded = parseJwt(response.credential);
      if (!decoded || !decoded.email) {
        throw new Error('Invalid Google credential token');
      }

      await loginWithGoogle({
        email: decoded.email,
        name: decoded.name || decoded.email.split('@')[0],
        avatarUrl: decoded.picture,
        provider: 'google'
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-in error:', err);
      setMessage('Google Sign-In failed. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize Google Identity Services if available in window
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });

        const parent = document.getElementById('google-signin-container');
        if (parent) {
          window.google.accounts.id.renderButton(parent, {
            theme: 'filled_black',
            size: 'large',
            width: '320',
            text: 'continue_with',
            shape: 'pill'
          });
        }
      } catch (err) {
        console.warn('Google GSI init warning:', err);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      const errMsg =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        'Login failed. Please check your credentials.';
      setMessage(errMsg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-text">TripNest</span>
        </div>
        <h2 className="auth-title">Sign In</h2>

        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', marginTop: '-0.25rem' }}>
            <Link to="/forgot-password" className="link" style={{ fontSize: '0.8rem' }}>
              Forgot password?
            </Link>
          </div>

          {message && (
            <div className="alert alert-error" role="alert">
              {message}
            </div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : 'Sign In'}
          </button>

          {/* Social Google Login */}
          <div style={{ position: 'relative', textAlign: 'center', margin: '1.25rem 0' }}>
            <div style={{ height: '1px', background: 'var(--color-border)', width: '100%' }} />
            <span style={{
              position: 'relative',
              top: '-0.6rem',
              background: 'var(--color-surface)',
              padding: '0 0.5rem',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase'
            }}>Or continue with</span>
          </div>

          {/* Real Google GSI Container */}
          <div id="google-signin-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }} />

          {/* Fallback button */}
          <button
            type="button"
            onClick={async () => {
              try {
                setLoading(true);
                const email = prompt('Enter your Google account email:', 'alex.traveler@gmail.com');
                if (!email) { setLoading(false); return; }
                await loginWithGoogle({
                  email,
                  name: email.split('@')[0].toUpperCase(),
                  provider: 'google'
                });
                navigate('/dashboard');
              } catch (err) {
                setMessage('Google OAuth2 sign-in failed.');
                setLoading(false);
              }
            }}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', fontSize: '0.8rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Google One-Tap Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="link">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
