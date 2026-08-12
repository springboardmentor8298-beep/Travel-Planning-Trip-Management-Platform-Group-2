import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CurrencyContext } from '../context/CurrencyContext';
import api from '../services/api';
import { User, Mail, Shield, Save, CheckCircle2, Globe, Heart, Compass, History, Settings, Lock } from 'lucide-react';

export const Profile = () => {
  const { user } = useContext(AuthContext);
  const { currency, changeCurrency, formatAmount } = useContext(CurrencyContext);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('ROLE_TRAVELER');
  const [passportNumber, setPassportNumber] = useState('');
  const [currencyPreference, setCurrencyPreference] = useState('INR');
  const [preferences, setPreferences] = useState('');
  const [favoriteDestinations, setFavoriteDestinations] = useState('');
  const [travelHistory, setTravelHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Active Tab: 'profile' | 'preferences' | 'history' | 'settings'
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user?.email) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/profile?email=${encodeURIComponent(user?.email || '')}`);
      setFullName(res.data.fullName || res.data.name || (user?.email ? user.email.split('@')[0] : ''));
      setBio(res.data.bio || '');
      setRole(res.data.role || user?.roles?.[0] || 'ROLE_TRAVELER');
      setPassportNumber(res.data.passportNumber || '');
      setCurrencyPreference(res.data.currencyPreference || 'INR');
      setPreferences(res.data.preferences || 'Beach Treks, Tea Estates, Heritage Architecture, Street Food');
      setFavoriteDestinations(res.data.favoriteDestinations || 'Gokarna, Ooty, Kodaikanal, Goa, Kerala, Paris, Tokyo');

      const tripsRes = await api.get('/trips');
      if (tripsRes.data) {
        setTravelHistory(tripsRes.data);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', {
        email: user?.email,
        fullName,
        bio,
        role,
        passportNumber,
        currencyPreference,
        preferences,
        favoriteDestinations,
      });
      setMessage('Profile & preferences updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      alert('Failed to update profile');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading profile...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>
          User <span className="gradient-text">Profile Management</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
          Manage your travel history, preferences, bucket list destinations, and account customization.
        </p>
      </div>

      {message && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          padding: '12px 16px',
          borderRadius: 12,
          fontSize: '0.9rem',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      {/* Main Glass Panel */}
      <div className="glass-panel" style={{ borderRadius: 24, overflow: 'hidden' }}>
        {/* User Profile Card Top Header */}
        <div style={{ padding: 28, background: 'rgba(99,102,241,0.06)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: 900,
              color: 'white',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
            }}>
              {(fullName || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{fullName || user?.username}</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                <span><Mail size={14} /> {user?.email}</span>
                <span><Shield size={14} color="var(--primary-accent)" /> Role: <strong style={{ color: 'var(--text-main)' }}>{role.replace('ROLE_', '')}</strong></span>
              </div>
            </div>
          </div>
          <span style={{ padding: '6px 16px', borderRadius: 99, background: 'var(--glass-bg)', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
            Member Since {new Date().getFullYear()}
          </span>
        </div>

        {/* Section Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--input-bg)', padding: '4px 8px' }}>
          {[
            { id: 'profile', label: 'Profile Customization', icon: <User size={16} /> },
            { id: 'preferences', label: 'Travel Preferences & Favorites', icon: <Heart size={16} /> },
            { id: 'history', label: 'Travel History Feed', icon: <History size={16} /> },
            { id: 'settings', label: 'Account Settings & Security', icon: <Settings size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--card-bg)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary-accent)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary-accent)' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <form onSubmit={handleSubmit} style={{ padding: 32 }}>
          {/* Tab 1: Profile Customization */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>👤 Profile Customization</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Platform Role</label>
                  <select
                    className="form-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ borderRadius: 12, height: 46 }}
                  >
                    <option value="ROLE_TRAVELER">Traveler (Default Explorer)</option>
                    <option value="ROLE_GROUP_ADMIN">Group Admin (Trip Leader & Organizer)</option>
                    <option value="ROLE_ADMINISTRATOR">Administrator (System Admin)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio / Travel Philosophy</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Share your travel experiences and wanderlust bio..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                ></textarea>
              </div>
            </div>
          )}

          {/* Tab 2: Travel Preferences & Favorites */}
          {activeTab === 'preferences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>💖 Travel Preferences & Favorite Destinations</h3>
              
              <div className="form-group">
                <label className="form-label">Preferred Travel Styles & Activities</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Beach Treks, Tea Estates, Heritage Architecture, Street Food"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                />
              </div>

              {/* Preference Tags Preview */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: -8 }}>
                {preferences.split(',').map((tag, idx) => tag.trim() && (
                  <span key={idx} style={{
                    padding: '6px 14px',
                    borderRadius: 99,
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid var(--primary-accent)',
                    color: 'var(--primary-accent)',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    ✨ {tag.trim()}
                  </span>
                ))}
              </div>

              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Favorite Bucket List Destinations</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gokarna, Ooty, Kodaikanal, Goa, Kerala, Paris, Tokyo"
                  value={favoriteDestinations}
                  onChange={(e) => setFavoriteDestinations(e.target.value)}
                />
              </div>

              {/* Favorites Badges Preview */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: -8 }}>
                {favoriteDestinations.split(',').map((dest, idx) => dest.trim() && (
                  <span key={idx} style={{
                    padding: '6px 14px',
                    borderRadius: 99,
                    background: 'rgba(236,72,153,0.12)',
                    border: '1px solid #ec4899',
                    color: '#ec4899',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    ❤️ {dest.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Travel History Feed */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>📜 Completed Travel History Feed</h3>
              
              {travelHistory.length === 0 ? (
                <div style={{ textAlignment: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <Compass size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600 }}>No completed trips recorded yet.</p>
                  <span style={{ fontSize: '0.82rem' }}>Trips created in your dashboard will appear in your travel history.</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  {travelHistory.map((trip) => (
                    <div key={trip.id} style={{
                      padding: 16,
                      borderRadius: 14,
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{trip.title || trip.destination}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          📍 {trip.destination} • 📅 {trip.startDate || '2026-08-10'} to {trip.endDate || '2026-08-14'}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                          Spent {formatAmount(trip.spentBudget || 0)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>
                          Budget {formatAmount(trip.totalBudget || 15000)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Account Settings */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>⚙️ Account Settings & Document Info</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Passport / ID Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Z1234567"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Currency Preference</label>
                  <select
                    className="form-input"
                    value={currency}
                    onChange={(e) => {
                      setCurrencyPreference(e.target.value);
                      changeCurrency(e.target.value);
                    }}
                    style={{ borderRadius: 12, height: 46 }}
                  >
                    <option value="INR">₹ INR (Indian Rupee)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                    <option value="EUR">€ EUR (Euro)</option>
                    <option value="GBP">£ GBP (British Pound)</option>
                  </select>
                </div>
              </div>

              <div style={{ padding: 18, borderRadius: 14, background: 'rgba(99,102,241,0.06)', border: '1px solid var(--border-color)', marginTop: 8 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={16} /> Security & Account Credentials
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Your account is secured via JWT bearer token authentication and Google OAuth2 integration.
                </p>
              </div>
            </div>
          )}

          {/* Save Action Button */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', gap: 10, borderRadius: 99 }}>
              <Save size={18} /> Save All Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
