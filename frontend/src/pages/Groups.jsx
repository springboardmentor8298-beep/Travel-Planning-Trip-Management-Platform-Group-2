import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getMyGroups,
  createGroup,
  getMyPendingInvitations,
  respondToInvitation,
} from "../api/Groupapi";
import { useAuth } from "../context/AuthContext";

/* ── Helpers ─────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-pink-100 text-pink-700",
];

function avatarColor(name = "") {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function initials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function fmtDate(ts) {
  if (!ts) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(ts));
}

/* ── Component ───────────────────────────────────────────────── */
export default function Groups() {
  useAuth(); // loaded for future auth-based features

  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");
  const [respondId, setRespondId] = useState(null); // id being accepted/rejected

  /* ── Load ── */
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, iRes] = await Promise.all([
        getMyGroups(),
        getMyPendingInvitations(),
      ]);
      setGroups(gRes.data ?? []);
      setInvitations(iRes.data ?? []);
    } catch (err) {
      /* Backend might be down — fail silently, show empty state */
      console.error("Groups load failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── Create group ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateErr("");
    setCreating(true);
    try {
      await createGroup(newGroup);
      setNewGroup({ name: "", description: "" });
      setShowForm(false);
      loadAll();
    } catch (err) {
      setCreateErr(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to create group. Make sure the backend is running."
      );
    } finally {
      setCreating(false);
    }
  };

  /* ── Respond to invitation ── */
  const handleRespond = async (invId, accept) => {
    setRespondId(invId);
    try {
      await respondToInvitation(invId, accept);
      loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || "Could not respond to invitation.");
    } finally {
      setRespondId(null);
    }
  };

  /* ── Render ── */
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8 animate-fadeInDown">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-1">
            Collaboration
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900">Travel Groups</h1>
          <p className="text-slate-500 text-sm mt-1">
            Create a group, invite companions and plan trips together.
          </p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setCreateErr(""); }}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
        >
          {showForm ? "✕ Cancel" : "+ New Group"}
        </button>
      </div>

      {/* ── Create-group form ── */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 animate-scaleIn">
          <h2 className="font-bold text-slate-900 mb-1">Create a Travel Group</h2>
          <p className="text-sm text-slate-500 mb-4">
            Give your group a name and invite people from the group detail page.
          </p>

          {createErr && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2 animate-fadeIn">
              <span className="mt-0.5">⚠️</span>
              <span>{createErr}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Group Name <span className="text-red-400">*</span>
              </label>
              <input
                required
                placeholder="e.g. Goa Crew 2025"
                value={newGroup.name}
                onChange={(e) => setNewGroup((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="What's this trip about?"
                value={newGroup.description}
                onChange={(e) => setNewGroup((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={creating}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95"
              >
                {creating ? "Creating…" : "Create Group"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setCreateErr(""); }}
                className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium px-5 py-2.5 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Pending invitations ── */}
      {invitations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 animate-fadeInUp">
          <h2 className="font-bold text-amber-800 flex items-center gap-2 mb-4">
            <span className="text-xl">📬</span>
            Pending Invitations
            <span className="ml-1 bg-amber-200 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {invitations.length}
            </span>
          </h2>
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-white border border-amber-100 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">{inv.groupName}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Invited by{" "}
                    <span className="text-slate-700 font-medium">{inv.invitedByName}</span>
                    <span className="ml-2 text-slate-400 text-xs">{fmtDate(inv.createdAt)}</span>
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    disabled={respondId === inv.id}
                    onClick={() => handleRespond(inv.id, true)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
                  >
                    ✓ Accept
                  </button>
                  <button
                    disabled={respondId === inv.id}
                    onClick={() => handleRespond(inv.id, false)}
                    className="flex items-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 disabled:opacity-60 text-red-600 text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
                  >
                    ✕ Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── My groups ── */}
      <div>
        <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          My Groups
          {!loading && (
            <span className="text-sm text-slate-400 font-normal">({groups.length})</span>
          )}
        </h2>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl h-28 skeleton" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-16 text-center animate-fadeIn">
            <p className="text-5xl mb-3">👥</p>
            <p className="font-semibold text-slate-700">No groups yet</p>
            <p className="text-sm text-slate-500 mt-1 mb-5">
              Create a group to start planning with your travel crew.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="text-brand-600 font-bold hover:underline text-sm"
            >
              + Create your first group
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 stagger-children">
            {groups.map((g) => (
              <Link
                key={g.id}
                to={`/groups/${g.id}`}
                className="animate-fadeInUp bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-brand-200 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg flex-shrink-0 ${avatarColor(g.name)}`}
                  >
                    {initials(g.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 group-hover:text-brand-700 truncate">
                      {g.name}
                    </p>
                    {g.description && (
                      <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{g.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {/* Member avatars */}
                      <div className="flex -space-x-2">
                        {(g.members ?? []).slice(0, 5).map((m, i) => (
                          <div
                            key={m.id ?? i}
                            title={m.fullName}
                            className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold ${avatarColor(m.fullName ?? "")}`}
                          >
                            {(m.fullName ?? "?")[0]?.toUpperCase()}
                          </div>
                        ))}
                        {(g.memberCount ?? 0) > 5 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] text-slate-500 font-bold">
                            +{g.memberCount - 5}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {g.memberCount ?? 0} member{(g.memberCount ?? 0) !== 1 ? "s" : ""}
                      </span>
                      <span className="ml-auto text-xs text-brand-600 font-semibold group-hover:underline">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
