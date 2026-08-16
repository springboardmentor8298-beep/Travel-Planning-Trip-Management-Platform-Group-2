import { useState, useEffect } from "react";
import api from "../api/axios";
import AppLayout from "../layout/AppLayout";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    api.get("/users/me")
      .then((res) => { setProfile(res.data); setFullName(res.data.fullName); })
      .catch((err) => setError(err.response?.data?.error || "Failed to load profile"));
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      const res = await api.put("/users/me", { fullName });
      setProfile(res.data);
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    try {
      await api.put("/users/me/password", { currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword("");
      setPwSuccess("Password changed.");
    } catch (err) {
      setPwError(err.response?.data?.error || "Failed to change password");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Profile</h1>

        {!profile ? (
          <p className="text-slate-500">{error || "Loading..."}</p>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">
                  {profile.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{profile.fullName}</div>
                  <div className="text-sm text-slate-500">{profile.email}</div>
                  <div className="flex gap-1 mt-1">
                    {profile.roles.map((r) => (
                      <span key={r} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{r}</span>
                    ))}
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Full Name</label>
                  <input
                    type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full mt-1 border border-slate-300 p-2 rounded-lg text-sm"
                  />
                </div>
                {error && <p className="text-red-500 text-xs">{error}</p>}
                {success && <p className="text-emerald-600 text-xs">{success}</p>}
                <button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Save Changes
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-3">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <input
                  type="password" placeholder="Current password" value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm" required
                />
                <input
                  type="password" placeholder="New password (min 6 chars)" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm" required
                />
                {pwError && <p className="text-red-500 text-xs">{pwError}</p>}
                {pwSuccess && <p className="text-emerald-600 text-xs">{pwSuccess}</p>}
                <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Change Password
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
