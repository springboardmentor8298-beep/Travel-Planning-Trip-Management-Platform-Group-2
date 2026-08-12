import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, KeyRound, ArrowRight } from 'lucide-react';

export const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { resetPassword } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const res = await resetPassword(email, newPassword);
    if (res.success) {
      setMessage(res.message);
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 440, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'var(--primary-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: 12,
            boxShadow: '0 6px 16px rgba(99,102,241,0.5)'
          }}>
            <KeyRound size={28} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Reset Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Enter your registered email address and new password
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: 10,
            fontSize: '0.85rem',
            marginBottom: 20
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            padding: '12px 16px',
            borderRadius: 10,
            fontSize: '0.85rem',
            marginBottom: 20
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Registered Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8, padding: 12 }}>
            Update Password <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Remembered your password?{' '}
          <Link to="/login" style={{ color: 'var(--primary-accent)', fontWeight: 600, textDecoration: 'none' }}>
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
