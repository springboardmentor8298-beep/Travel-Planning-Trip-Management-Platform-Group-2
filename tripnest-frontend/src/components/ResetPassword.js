import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import userService from '../services/user.service';
import { useTheme } from '../context/ThemeContext';
import { Compass, Lock, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [tokenFromUrl]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setError('');
      const res = await userService.resetPassword(token, newPassword);
      setMessage(res.data.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Password reset failed:', err);
      setError(err.response?.data?.message || 'Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
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
        id="reset-theme-toggle"
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

      <div style={{
        width: '100%',
        maxWidth: '460px',
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
            <Compass size={28} color="var(--accent)" />
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg,#10b981,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TripNest</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Set New Password</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enter your reset token and new password</p>
        </div>

        {message && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} />
            <span>{message} Redirecting to login...</span>
          </div>
        )}

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleReset}>
          <div style={{ marginBottom: '1.125rem' }}>
            <label className="form-label" htmlFor="reset-token" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <KeyRound size={13} /> Reset Token
            </label>
            <input
              id="reset-token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="form-input"
              placeholder="Enter reset token"
              style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.125rem' }}>
            <label className="form-label" htmlFor="reset-new-pass" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Lock size={13} /> New Password
            </label>
            <input
              id="reset-new-pass"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              placeholder="At least 6 characters"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="reset-confirm-pass" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Lock size={13} /> Confirm New Password
            </label>
            <input
              id="reset-confirm-pass"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              placeholder="Repeat your new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1.5rem' }}
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" className="link" style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
