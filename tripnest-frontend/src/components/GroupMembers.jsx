import { useState, useEffect } from "react";
import api from "../api/axios";

const ROLES = ["VIEWER", "EDITOR", "OWNER"];

const ROLE_STYLES = {
  OWNER: "bg-emerald-100 text-emerald-700",
  EDITOR: "bg-teal-100 text-teal-700",
  VIEWER: "bg-slate-100 text-slate-600",
};

export default function GroupMembers({ tripId }) {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/trips/${tripId}/members`);
      setMembers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load members");
    }
  };

  useEffect(() => { load(); }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInvite = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/trips/${tripId}/members`, { email: email.trim(), role });
      setEmail("");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to invite member");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/trips/${tripId}/members/${userId}/role`, { role: newRole });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update role");
    }
  };

  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">👥 Group</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition"
        >
          {showForm ? "Cancel" : "+ Invite"}
        </button>
      </div>

      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      {showForm && (
        <form onSubmit={handleInvite} className="mb-4 p-3 rounded-xl bg-white/70 border border-slate-200">
          <p className="text-[11px] text-slate-500 mb-2">
            The person must already have a TripNest account (same email they registered with).
          </p>
          <div className="flex gap-2">
            <input
              type="email" placeholder="Traveler's email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-slate-300 p-2 rounded-lg text-sm" required
            />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="border border-slate-300 p-2 rounded-lg text-sm">
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 rounded-lg text-sm font-medium">
              Invite
            </button>
          </div>
        </form>
      )}

      {members.length === 0 ? (
        <p className="text-sm text-slate-500">No group members yet - it's just you.</p>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.userId} className="flex justify-between items-center p-3 rounded-xl bg-white/70 border border-slate-100">
              <div>
                <div className="text-sm font-medium text-slate-700">{m.fullName}</div>
                <div className="text-xs text-slate-400">{m.email}</div>
              </div>
              <select
                value={m.role}
                onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${ROLE_STYLES[m.role]}`}
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
