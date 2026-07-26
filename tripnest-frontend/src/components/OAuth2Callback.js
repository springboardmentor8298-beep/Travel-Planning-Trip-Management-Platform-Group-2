import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';

/**
 * OAuth2Callback — rendered at /oauth2/callback.
 *
 * After a successful Google login the backend redirects here with the JWT
 * and user info as query parameters. This component reads those params,
 * stores them in localStorage (via authService), updates the AuthContext,
 * then redirects to /dashboard.
 */
const OAuth2Callback = () => {
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const errorParam = params.get('error');
    if (errorParam) {
      setError('Google sign-in failed. Please try again.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const token     = params.get('token');
    const id        = params.get('id');
    const username  = params.get('username');
    const email     = params.get('email');
    const firstName = params.get('firstName');
    const lastName  = params.get('lastName');
    const avatarUrl = params.get('avatarUrl');
    const rolesRaw  = params.get('roles');

    if (!token || !username) {
      setError('Invalid OAuth2 response. Redirecting to login…');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const roles = rolesRaw ? rolesRaw.split(',').filter(Boolean) : [];

    const userData = {
      token,
      id: id ? Number(id) : null,
      username,
      email,
      firstName,
      lastName,
      avatarUrl,
      roles,
    };

    authService.loginWithOAuth2Token(userData);
    setCurrentUser(userData);
    navigate('/dashboard', { replace: true });
  }, [navigate, setCurrentUser]);

  if (error) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="logo-icon">✈️</span>
            <span className="logo-text">TripNest</span>
          </div>
          <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>
          <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-text-muted)' }}>
            Redirecting to login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">
          <span className="logo-icon">✈️</span>
          <span className="logo-text">TripNest</span>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <span className="spinner" style={{ width: '2rem', height: '2rem', display: 'inline-block' }} />
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
            Signing you in with Google…
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuth2Callback;
