import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userService from '../services/user.service';
import { useTheme } from '../context/ThemeContext';
import { Compass, Mail, ArrowLeft, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      setError('');
      const res = await userService.forgotPassword(email);
      setMessage(res.data.message || 'Password reset link generated!');
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to process password reset.');
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
        id="forgot-theme-toggle"
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
        maxWidth: '440px',
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Reset Your Password</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enter your registered email address to receive reset instructions</p>
        </div>

        {message && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{message}</p>
            {resetToken && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your secure password reset link is ready:</p>
                <button
                  onClick={() => navigate(`/reset-password?token=${resetToken}`)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <KeyRound size={14} /> Click to Reset Password Now →
                </button>
              </div>
            )}
          </div>
        )}

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="forgot-email" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Mail size={13} /> Email Address
            </label>
            <input
              id="forgot-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="name@example.com"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1.5rem' }}
          >
            {loading ? 'Sending Request...' : 'Send Reset Instructions'}
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

export default ForgotPassword;
