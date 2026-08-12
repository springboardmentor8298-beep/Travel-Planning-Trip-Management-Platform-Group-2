import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, UserPlus, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('TRAVELER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, saveUserSession, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const res = await register(username, email, password, fullName, role);
    if (res.success) {
      const newUser = {
        token: 'jwt_session_' + Date.now(),
        id: 'user_' + Date.now(),
        username: username,
        email: email,
        fullName: fullName || username,
        roles: ['ROLE_TRAVELER']
      };
      saveUserSession(newUser, true);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 600);
    } else {
      let msg = typeof res.message === 'string' ? res.message : 'Registration failed.';
      if (msg.includes('size must be between 6 and 40') || msg.includes('password')) {
        msg = 'Password must be at least 6 characters long.';
      }
      setError(msg);
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: 460, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
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
            <Compass size={28} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Join TripNest and start planning unforgettable journeys
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

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            padding: '12px 16px',
            borderRadius: 10,
            fontSize: '0.85rem',
            marginBottom: 20
          }}>
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Alex Johnson"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
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
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="TRAVELER">Traveler</option>
              <option value="GROUP_ADMIN">Group Admin</option>
              <option value="ADMINISTRATOR">Platform Administrator</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8, padding: 12 }} disabled={loading}>
            {loading ? 'Registering...' : <>Create Account <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-accent)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
