import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import userService from '../services/user.service';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    travelPreferences: '',
    favoriteDestinations: '',
    profileBio: '',
    avatarUrl: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getUserProfile();
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        email: data.email || '',
        travelPreferences: data.travelPreferences || '',
        favoriteDestinations: data.favoriteDestinations || '',
        profileBio: data.profileBio || '',
        avatarUrl: data.avatarUrl || ''
      });
    } catch (err) {
      setError('Failed to load profile: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUserProfile(formData);
      setMessage('Profile updated successfully!');
      setEditing(false);
      loadProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage('Password changed successfully!');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="page-root">
        <Navbar />
        <div className="page-content">
          <div className="loading-text">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">My Profile 👤</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {/* Profile Overview Card */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Profile Information</h2>
            <button className="btn btn-outline btn-auto" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {!editing ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div className="info-card">
                <div className="info-label">Username</div>
                <div className="info-value">{profile?.username}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Email</div>
                <div className="info-value">{profile?.email}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Name</div>
                <div className="info-value">{profile?.firstName} {profile?.lastName}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Phone</div>
                <div className="info-value">{profile?.phone || 'Not provided'}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Roles</div>
                <div className="info-value">
                  {profile?.roles?.map(role => (
                    <span key={role} className="badge badge-{role.toLowerCase()}">{role}</span>
                  ))}
                </div>
              </div>
              <div className="info-card">
                <div className="info-label">Total Trips</div>
                <div className="info-value">{profile?.totalTrips || 0}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Completed Trips</div>
                <div className="info-value">{profile?.completedTrips || 0}</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="profile-firstname">First Name</label>
                  <input
                    id="profile-firstname"
                    name="firstName"
                    type="text"
                    className="form-input"
                    value={formData.firstName}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-lastname">Last Name</label>
                  <input
                    id="profile-lastname"
                    name="lastName"
                    type="text"
                    className="form-input"
                    value={formData.lastName}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="profile-email">Email</label>
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-phone">Phone</label>
                  <input
                    id="profile-phone"
                    name="phone"
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="profile-bio">Bio</label>
                <textarea
                  id="profile-bio"
                  name="profileBio"
                  className="form-input form-textarea"
                  rows={3}
                  placeholder="Tell us about yourself..."
                  value={formData.profileBio}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="profile-preferences">Travel Preferences</label>
                <textarea
                  id="profile-preferences"
                  name="travelPreferences"
                  className="form-input form-textarea"
                  rows={2}
                  placeholder="e.g. Adventure travel, beach destinations, cultural experiences..."
                  value={formData.travelPreferences}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="profile-favorites">Favorite Destinations</label>
                <textarea
                  id="profile-favorites"
                  name="favoriteDestinations"
                  className="form-input form-textarea"
                  rows={2}
                  placeholder="e.g. Paris, Tokyo, New York..."
                  value={formData.favoriteDestinations}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="profile-avatar">Avatar URL</label>
                <input
                  id="profile-avatar"
                  name="avatarUrl"
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatarUrl}
                  onChange={handleProfileChange}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary btn-auto">Save Changes</button>
                <button type="button" className="btn btn-outline btn-auto" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Password Change Card */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Security</h2>
            <button className="btn btn-outline btn-auto" onClick={() => setShowPasswordForm(!showPasswordForm)}>
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="current-password">Current Password *</label>
                <input
                  id="current-password"
                  name="currentPassword"
                  type="password"
                  className="form-input"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="new-password">New Password *</label>
                  <input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    className="form-input"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm New Password *</label>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    className="form-input"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary btn-auto">Update Password</button>
                <button type="button" className="btn btn-outline btn-auto" onClick={() => setShowPasswordForm(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Travel Stats Card */}
        <div className="section-card">
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Travel Statistics</h2>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-number">{profile?.totalTrips || 0}</div>
              <div className="stat-label">Total Trips</div>
            </div>
            <div className="stat-card stat-completed">
              <div className="stat-number">{profile?.completedTrips || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card stat-planned">
              <div className="stat-number">{(profile?.totalTrips || 0) - (profile?.completedTrips || 0)}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
