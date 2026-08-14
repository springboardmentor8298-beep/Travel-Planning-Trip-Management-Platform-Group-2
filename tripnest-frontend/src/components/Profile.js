import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import userService from '../services/user.service';
import { Link } from 'react-router-dom';
import {
  Heart,
  Settings,
  Compass,
  Globe,
  Sun,
  Shield,
  Key,
  Check
} from 'lucide-react';

const TRAVEL_STYLES = [
  'Adventure',
  'Beach & Coastal',
  'Cultural & Historical',
  'Budget Backpacker',
  'Luxury & Resort',
  'Nature & Wildlife',
  'Food & Culinary',
  'Solo Traveler',
  'Family & Kids',
  'Road Trips'
];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedStyles, setSelectedStyles] = useState([]);

  // Change password states
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userService.getProfile();
      const p = res.data;
      setProfile(p);
      setFirstName(p.firstName || '');
      setLastName(p.lastName || '');
      setPhone(p.phone || '');
      setBio(p.bio || '');
      setAvatarUrl(p.avatarUrl || '');
      if (p.travelPreferences) {
        setSelectedStyles(p.travelPreferences.split(',').map(s => s.trim()).filter(Boolean));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Could not load user profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStyle = (style) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      setError('');
      const payload = {
        firstName,
        lastName,
        phone,
        bio,
        avatarUrl,
        travelPreferences: selectedStyles.join(', ')
      };
      const res = await userService.updateProfile(payload);
      setProfile(res.data);
      setMessage('Profile updated successfully! ✨');
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setPassMsg('');
      setPassErr('');
      await userService.changePassword(currPass, newPass);
      setPassMsg('Password changed successfully! 🔐');
      setCurrPass('');
      setNewPass('');
    } catch (err) {
      setPassErr(err.response?.data?.message || 'Failed to change password.');
    }
  };

  if (loading) {
    return (
      <div className="page-root">
        <Navbar />
        <div className="page-content" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{
            display: 'inline-block',
            width: '40px', height: '40px',
            border: '3px solid rgba(16,185,129,0.2)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '1rem',
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  const initial = (profile?.firstName?.[0] || profile?.username?.[0] || 'U').toUpperCase();

  return (
    <div className="page-root">
      <Navbar />

      <div className="page-content">
        {/* Profile Header Card */}
        <div className="section-card" style={{
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(56,189,248,0.04) 50%, var(--bg-card) 100%)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              fontSize: '2rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initial
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                <h1 style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em'
                }}>
                  {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile?.username}
                </h1>
                {profile?.roles?.map((r, i) => (
                  <span key={i} className="badge badge-ongoing" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Shield size={12} />
                    {r.replace('ROLE_', '')}
                  </span>
                ))}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                @{profile?.username} • {profile?.email}
              </p>
              {profile?.bio && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', maxWidth: '600px', lineHeight: 1.5 }}>
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>
                {profile?.totalTrips || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Trips
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-info)' }}>
                {profile?.completedTrips || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Completed
              </div>
            </div>
          </div>
        </div>

        {/* Favorite Destinations Gallery */}
        <div className="section-card" style={{ marginBottom: '2rem' }}>
          <div className="section-header">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={18} color="#e11d48" fill="#e11d48" />
              Favorite Destinations ({profile?.favoriteDestinations?.size || profile?.favoriteDestinations?.length || 0})
            </h3>
            <Link to="/destinations" className="link" style={{ fontSize: '0.85rem' }}>
              Explore Destinations →
            </Link>
          </div>

          {(!profile?.favoriteDestinations || profile.favoriteDestinations.length === 0) ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Compass size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No Favorite Destinations Saved Yet</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Browse the destinations catalog and click the heart icon to save favorites!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {Array.from(profile.favoriteDestinations).map((dest) => (
                <div key={dest.id} style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  transition: 'border-color 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{dest.name}</h4>
                    <span className="badge badge-planned" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Globe size={11} /> {dest.country}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                    {dest.description}
                  </p>
                  {dest.bestTimeToVisit && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-2)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                      <Sun size={13} /> Best time: {dest.bestTimeToVisit}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2-Column Grid: Edit Profile + Change Password */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
          {/* Edit Profile Form */}
          <div className="section-card">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={18} style={{ color: 'var(--accent)' }} /> Edit Profile Details
            </h3>

            {message && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>{message}</div>}
            {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

            <form onSubmit={handleUpdateProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.125rem' }}>
                <div>
                  <label className="form-label" htmlFor="prof-fn">First Name</label>
                  <input
                    id="prof-fn"
                    type="text"
                    className="form-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="prof-ln">Last Name</label>
                  <input
                    id="prof-ln"
                    type="text"
                    className="form-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.125rem' }}>
                <label className="form-label" htmlFor="prof-phone">Phone Number</label>
                <input
                  id="prof-phone"
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>

              <div style={{ marginBottom: '1.125rem' }}>
                <label className="form-label" htmlFor="prof-avatar">Avatar Image URL</label>
                <input
                  id="prof-avatar"
                  type="url"
                  className="form-input"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="prof-bio">Bio & Travel Preferences</label>
                <textarea
                  id="prof-bio"
                  rows={3}
                  className="form-input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell other travelers about yourself..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Travel Style Preferences</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.375rem' }}>
                  {TRAVEL_STYLES.map((style) => {
                    const active = selectedStyles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => handleToggleStyle(style)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          borderRadius: '99px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: active ? '1px solid var(--accent)' : '1px solid var(--border-strong)',
                          background: active ? 'var(--accent-dim)' : 'var(--bg-glass)',
                          color: active ? 'var(--accent)' : 'var(--text-secondary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        {active && <Check size={12} />}
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="section-card">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Key size={18} style={{ color: 'var(--accent-2)' }} /> Change Password
            </h3>

            {passMsg && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>{passMsg}</div>}
            {passErr && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{passErr}</div>}

            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '1.125rem' }}>
                <label className="form-label" htmlFor="curr-pass">Current Password</label>
                <input
                  id="curr-pass"
                  type="password"
                  className="form-input"
                  value={currPass}
                  onChange={(e) => setCurrPass(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="new-pass">New Password</label>
                <input
                  id="new-pass"
                  type="password"
                  className="form-input"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
