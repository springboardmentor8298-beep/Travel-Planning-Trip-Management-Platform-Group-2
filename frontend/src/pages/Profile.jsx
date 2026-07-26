import React, { useEffect, useState } from "react";
import { userApi } from "../api/userApi";
import FormField from "../components/FormField";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let mounted = true;
    userApi
      .getMyProfile()
      .then((res) => {
        if (!mounted) return;
        setProfile(res.data);
        setForm(res.data);
      })
      .catch(() => setErrorMsg("Could not load your profile."))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setErrorMsg(null);
    try {
      const res = await userApi.updateMyProfile(form);
      setProfile(res.data);
      setForm(res.data);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-10 text-slate-500">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="max-w-2xl mx-auto px-4 py-10 text-red-600">{errorMsg}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500">
          {profile.email} · <span className="uppercase text-xs font-semibold text-brand-600">{profile.role}</span>
        </p>
      </div>

      {message && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          {message}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="grid sm:grid-cols-2 gap-x-4">
          <FormField label="Full Name">
            <input
              name="fullName"
              value={form.fullName || ""}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </FormField>

          <FormField label="Phone">
            <input
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="+91 98765 43210"
            />
          </FormField>
        </div>

        <FormField label="Bio">
          <textarea
            name="bio"
            rows={3}
            value={form.bio || ""}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Tell other travelers a bit about yourself"
          />
        </FormField>

        <FormField label="Travel Preferences">
          <input
            name="travelPreferences"
            value={form.travelPreferences || ""}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g. Adventure, Beach, Budget travel"
          />
        </FormField>

        <FormField label="Favorite Destinations">
          <input
            name="favoriteDestinations"
            value={form.favoriteDestinations || ""}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g. Goa, Manali, Bali"
          />
        </FormField>

        <button
          type="submit"
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 rounded-md text-sm disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
