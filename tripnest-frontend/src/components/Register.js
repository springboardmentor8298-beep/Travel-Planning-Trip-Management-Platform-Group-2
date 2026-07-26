import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.service';

/**
 * Registration page component.
 * Collects user details and submits to /api/auth/signup.
 * Default role is TRAVELER; admin can set other roles.
 */
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
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errMsg =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        'Registration failed.';
      setMessage(errMsg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <span className="logo-icon">✈️</span>
          <span className="logo-text">TripNest</span>
        </div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Start your travel journey with us today</p>

        <form onSubmit={handleSubmit} id="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-firstname">First Name</label>
              <input
                id="reg-firstname"
                name="firstName"
                type="text"
                className="form-input"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-lastname">Last Name</label>
              <input
                id="reg-lastname"
                name="lastName"
                type="text"
                className="form-input"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              name="username"
              type="text"
              className="form-input"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="Phone number (optional)"
                value={formData.phone}
                onChange={handleChange}
                maxLength={15}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-role">Role</label>
              <select
                id="reg-role"
                name="role"
                className="form-input form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select Role (default: Traveler)</option>
                <option value="traveler">Traveler</option>
                <option value="agent">Travel Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Create a password (min 6 chars)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {message && (
            <div className={`alert ${success ? 'alert-success' : 'alert-error'}`} role="alert">
              {message}
            </div>
          )}

          <button
            id="register-submit-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="link">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
