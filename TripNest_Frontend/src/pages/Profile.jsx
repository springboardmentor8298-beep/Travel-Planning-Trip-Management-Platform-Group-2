import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Mail, Phone, Globe, BookOpen, Heart, ShieldAlert, Award, Save, Camera, LogOut } from 'lucide-react';

const Profile = () => {

  const { profile, updateProfile, logoutUser } = useAppContext();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Local Form State
  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    bio: "",
    photo: "",
    travelStyle: "",
    emergencyContact: ""
  });

  // Sync whenever profile changes
  useEffect(() => {
    setFormFields({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      country: profile.country || "",
      bio: profile.bio || "",
      photo: profile.photo || "",
      travelStyle: profile.travelStyle || "",
      emergencyContact: profile.emergencyContact || ""
    });
  }, [profile]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile(formFields);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* 1. Live Preview Card */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 text-center relative overflow-hidden">
          {/* Header background accent */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-tr from-sky-400/20 to-indigo-500/20" />

          {/* Profile Photo Preview */}
          <div className="relative inline-block mt-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white font-extrabold text-2xl border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center mx-auto overflow-hidden">
              {formFields.photo ? (
                <img
                  src={formFields.photo}
                  alt={formFields.name}
                  className="w-full h-full object-cover"
                  onError={() => setFormFields({ ...formFields, photo: '' })}
                />
              ) : (
                getInitials(formFields.name)
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="mt-4 space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{formFields.name || 'Your Name'}</h3>
            <p className="text-xs text-slate-400 font-semibold">{formFields.email || 'email@company.com'}</p>

            {formFields.country && (
              <span className="inline-block mt-2 text-[10px] font-bold text-indigo-650 bg-indigo-50 dark:bg-indigo-950/40 dark:text-sky-400 px-2 py-0.5 rounded-full">
                {formFields.country}
              </span>
            )}
          </div>

          {/* Travel Badges */}
          <div className="mt-6 border-t border-slate-50 pt-5 text-left space-y-3 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preferred Style</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-350 mt-1">
                <Award className="w-4 h-4 text-indigo-500" />
                <span>{formFields.travelStyle || 'Not Specified'}</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bio Preview</p>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed mt-1 italic">
                "{formFields.bio || 'Provide a short biography detailing your traveler style...'}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Profile Editor Form */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Edit Profile Details</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formFields.name}
                  onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formFields.email}
                  onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formFields.phone}
                  onChange={(e) => setFormFields({ ...formFields, phone: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Country */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Country / Region</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formFields.country}
                  onChange={(e) => setFormFields({ ...formFields, country: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Travel Style dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preferred Travel Style</label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={formFields.travelStyle}
                  onChange={(e) => setFormFields({ ...formFields, travelStyle: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350"
                >
                  <option value="Cultural Immersion">Cultural Immersion</option>
                  <option value="Adventure Seeking">Adventure Seeking</option>
                  <option value="Luxury Traveler">Luxury Traveler</option>
                  <option value="Budget Backpacker">Budget Backpacker</option>
                  <option value="Relaxation & Leisure">Relaxation & Leisure</option>
                </select>
              </div>
            </div>

            {/* Photo URL */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Photo URL (Optional)</label>
              <div className="relative">
                <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formFields.photo}
                  onChange={(e) => setFormFields({ ...formFields, photo: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Contact Details</label>
            <div className="relative">
              <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. John Doe (+1 555-019-1111)"
                value={formFields.emergencyContact}
                onChange={(e) => setFormFields({ ...formFields, emergencyContact: e.target.value })}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Biography / Description</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <textarea
                value={formFields.bio}
                onChange={(e) => setFormFields({ ...formFields, bio: e.target.value })}
                rows="4"
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40 text-xs font-semibold rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-755 text-white text-sm font-semibold rounded-xl shadow disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Simulated Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800 animate-fade-in text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto dark:bg-rose-950/30">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sign Out?</h3>
              <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
                This will reset all custom trip itineraries, profile changes, and budget expenses back to seed defaults.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm font-semibold dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logoutUser();
                  setShowLogoutModal(false);
                  setFormFields({
                    name: 'Raju Prasad',
                    email: 'raju@tripnest.com',
                    phone: '+1 (555) 019-2834',
                    country: 'United States',
                    bio: 'Passionate globetrotter, slow traveler, and frontend developer. Always looking for the next hidden gem and local culinary experience. Believer that travel is about the journey, not just the destination.',
                    photo: '',
                    travelStyle: 'Cultural Immersion',
                    emergencyContact: 'Anjali Prasad (+1 (555) 019-5678)'
                  });
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
