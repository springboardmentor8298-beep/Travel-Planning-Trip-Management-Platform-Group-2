import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import userService from '../services/user.service';
import { Link } from 'react-router-dom';

const TRAVEL_STYLES = [
  '🏔️ Adventure',
  '🏖️ Beach & Coastal',
  '🏛️ Cultural & Historical',
  '🎒 Budget Backpacker',
  '✨ Luxury & Resort',
  '🌲 Nature & Wildlife',
  '🍜 Food & Culinary',
  '🚶 Solo Traveler',
  '👨‍👩‍👧‍👦 Family & Kids',
  '🚗 Road Trips'
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
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-3xl font-black text-emerald-400 overflow-hidden shadow-xl shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (profile?.firstName?.[0] || profile?.username?.[0] || 'U').toUpperCase()
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile?.username}
              </h1>
              {profile?.roles?.map((r, i) => (
                <span key={i} className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                  {r.replace('ROLE_', '')}
                </span>
              ))}
            </div>
            <p className="text-slate-400 text-sm font-medium">@{profile?.username} • {profile?.email}</p>
            {profile?.bio && <p className="text-slate-300 text-sm mt-3 leading-relaxed max-w-2xl">{profile.bio}</p>}
          </div>

          <div className="flex gap-4 sm:flex-col shrink-0 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-700/60 pt-4 sm:pt-0 sm:pl-6">
            <div>
              <span className="text-2xl font-black text-emerald-400 block">{profile?.totalTrips || 0}</span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Trips</span>
            </div>
            <div>
              <span className="text-2xl font-black text-cyan-400 block">{profile?.completedTrips || 0}</span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Completed</span>
            </div>
          </div>
        </div>

        {/* Favorite Destinations Gallery */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>❤️</span> Favorite Destinations ({profile?.favoriteDestinations?.size || profile?.favoriteDestinations?.length || 0})
            </h3>
            <Link to="/destinations" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
              Explore More Destinations →
            </Link>
          </div>

          {(!profile?.favoriteDestinations || profile.favoriteDestinations.length === 0) ? (
            <div className="text-center py-8 text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800/80">
              <span className="text-3xl block mb-2">🌍</span>
              <p className="font-semibold text-white">No Favorite Destinations Saved Yet</p>
              <p className="text-xs text-slate-400 mt-1">Browse the destinations catalog and click the heart icon to save your favorites!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from(profile.favoriteDestinations).map((dest) => (
                <div key={dest.id} className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 hover:border-emerald-500/40 transition-all shadow-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-base">{dest.name}</h4>
                    <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {dest.country}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">{dest.description}</p>
                  {dest.bestTimeToVisit && (
                    <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
                      <span>☀️ Best time:</span> {dest.bestTimeToVisit}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Edit & Settings Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>⚙️</span> Edit Profile Details
            </h3>

            {message && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm font-medium">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Avatar URL</label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm leading-relaxed"
                  placeholder="Tell other travelers about yourself, your favorite travel spots..."
                />
              </div>

              {/* Travel Preferences Tag Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Travel Style Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {TRAVEL_STYLES.map((style) => {
                    const isSelected = selectedStyles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => handleToggleStyle(style)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 self-start">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🔐</span> Change Password
            </h3>

            {passMsg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-medium">
                {passMsg}
              </div>
            )}
            {passErr && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium">
                {passErr}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currPass}
                  onChange={(e) => setCurrPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 font-semibold text-white text-xs rounded-xl transition-all"
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
