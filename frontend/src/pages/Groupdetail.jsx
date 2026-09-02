import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getGroup,
  inviteMembers,
  getMessages,
  postMessage,
  removeMember,
  getGroupInvitations,
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
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function fmtDateTime(ts) {
  if (!ts) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(ts));
}

const STATUS_META = {
  PENDING: { label: "Pending", bg: "bg-amber-50 text-amber-700 border-amber-200", icon: "⏳" },
  ACCEPTED: { label: "Accepted", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "✅" },
  REJECTED: { label: "Declined", bg: "bg-red-50 text-red-600 border-red-200", icon: "❌" },
};

/* ── Invite form — supports multiple comma/newline-separated emails ── */
function InvitePanel({ groupId, onSuccess }) {
  const [raw, setRaw] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]); // list of InvitationResponse

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emails = raw
      .split(/[\n,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => /\S+@\S+\.\S+/.test(s));

    if (emails.length === 0) {
      alert("Enter at least one valid email address.");
      return;
    }
    setSending(true);
    try {
      const res = await inviteMembers(groupId, emails);
      setResults(res.data ?? []);
      setRaw("");
      onSuccess();
    } catch (err) {
      alert(err?.response?.data?.message || "Could not send invitations.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold text-slate-900 mb-1">Invite travel companions</p>
        <p className="text-sm text-slate-500 mb-4">
          Enter one or more email addresses — separated by commas or newlines. They'll see the invitation in their Groups page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={3}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"alice@example.com\nbob@example.com, carol@example.com"}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none font-mono"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95"
        >
          {sending ? "Sending…" : "📨 Send Invitations"}
        </button>
      </form>

      {/* Results from last send */}
      {results.length > 0 && (
        <div className="space-y-2 animate-fadeIn">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Last send results
          </p>
          {results.map((inv) => {
            const s = STATUS_META[inv.status] ?? STATUS_META.PENDING;
            return (
              <div key={inv.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${s.bg}`}>
                <span className="font-medium">{inv.inviteeEmail}</span>
                <span className="flex items-center gap-1 text-xs font-semibold">
                  {s.icon} {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* How it works */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <p className="text-xs font-semibold text-slate-600 mb-2">How invitations work</p>
        <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
          <li>Invited users see a pending invitation on their Groups page.</li>
          <li>They can Accept ✓ or Decline ✕ — status updates here instantly.</li>
          <li>Accepted members join the group and can chat and plan trips together.</li>
          <li>You can invite multiple people at once by separating emails with commas.</li>
        </ul>
      </div>
    </div>
  );
}

/* ── Invitation history panel ────────────────────────────────── */
function InvitationHistory({ groupId }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGroupInvitations(groupId)
      .then((r) => setInvitations(r.data ?? []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [groupId]);

  if (loading) return <p className="text-sm text-slate-400 py-4">Loading…</p>;

  if (invitations.length === 0)
    return (
      <p className="text-sm text-slate-400 text-center py-8">
        No invitations sent yet.
      </p>
    );

  const pending = invitations.filter((i) => i.status === "PENDING");
  const accepted = invitations.filter((i) => i.status === "ACCEPTED");
  const rejected = invitations.filter((i) => i.status === "REJECTED");

  const Section = ({ title, list, color }) =>
    list.length === 0 ? null : (
      <div className="mb-5">
        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${color}`}>{title} ({list.length})</p>
        <div className="space-y-2">
          {list.map((inv) => {
            const s = STATUS_META[inv.status] ?? STATUS_META.PENDING;
            return (
              <div key={inv.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-xl border px-3 py-2.5 text-sm ${s.bg}`}>
                <div>
                  <p className="font-semibold">{inv.inviteeEmail}</p>
                  <p className="text-xs opacity-70 mt-0.5">
                    Invited by {inv.invitedByName} · {fmtDateTime(inv.createdAt)}
                  </p>
                  {inv.respondedAt && (
                    <p className="text-xs opacity-60">
                      Responded: {fmtDateTime(inv.respondedAt)}
                    </p>
                  )}
                </div>
                <span className="flex items-center gap-1 text-xs font-bold flex-shrink-0">
                  {s.icon} {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );

  return (
    <div>
      <Section title="Pending" list={pending} color="text-amber-600" />
      <Section title="Accepted" list={accepted} color="text-emerald-600" />
      <Section title="Declined" list={rejected} color="text-red-500" />
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function GroupDetail() {
  const { groupId } = useParams();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [removing, setRemoving] = useState(null);

  const bottomRef = useRef(null);

  const loadAll = useCallback(async () => {
    try {
      const [gRes, mRes] = await Promise.all([
        getGroup(groupId),
        getMessages(groupId),
      ]);
      setGroup(gRes.data);
      setMessages(mRes.data ?? []);
    } catch (err) {
      console.error("Group load failed:", err);
    }
  }, [groupId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSending(true);
    try {
      const res = await postMessage(groupId, messageText);
      setMessages((prev) => [...prev, res.data]);
      setMessageText("");
    } catch (err) {
      alert(err?.response?.data?.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm("Remove this member from the group?")) return;
    setRemoving(memberId);
    try {
      await removeMember(groupId, memberId);
      loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || "Could not remove member.");
    } finally {
      setRemoving(null);
    }
  };

  if (!group)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <svg className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-slate-500">Loading group…</p>
      </div>
    );

  const isOwner = group.ownerEmail === user?.email;
  const members = group.members ?? [];

  const TABS = [
    { id: "chat", label: "💬 Chat", badge: messages.length },
    { id: "members", label: "👥 Members", badge: members.length },
    { id: "invite", label: "📨 Invite", badge: null },
    { id: "history", label: "📋 Invite History", badge: null },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">

      {/* Back */}
      <Link to="/groups" className="text-sm text-brand-600 hover:underline flex items-center gap-1 mb-5">
        ← All Groups
      </Link>

      {/* ── Group header ── */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-2xl p-6 text-white mb-6 shadow-lg animate-fadeInDown">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold">{group.name}</h1>
            {group.description && (
              <p className="text-brand-100 mt-1 text-sm">{group.description}</p>
            )}
            <p className="text-brand-200 text-xs mt-2">Admin: {group.ownerName}</p>
          </div>
          <div className="bg-white/20 rounded-xl px-5 py-3 text-center flex-shrink-0">
            <p className="text-2xl font-extrabold">{group.memberCount}</p>
            <p className="text-xs text-brand-100">Members</p>
          </div>
        </div>

        {/* Member avatars row */}
        <div className="flex items-center gap-2 mt-5 flex-wrap">
          <div className="flex -space-x-2">
            {members.slice(0, 8).map((m, i) => (
              <div
                key={m.id ?? i}
                title={m.fullName}
                className="w-8 h-8 rounded-full border-2 border-white bg-white/80 flex items-center justify-center text-xs font-bold text-brand-700"
              >
                {(m.fullName ?? "?")[0]?.toUpperCase()}
              </div>
            ))}
            {members.length > 8 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-white/30 flex items-center justify-center text-xs font-bold text-white">
                +{members.length - 8}
              </div>
            )}
          </div>
          <Link
            to={`/trips/new?title=${encodeURIComponent(group.name + " Trip")}`}
            className="ml-auto bg-white text-brand-700 hover:bg-brand-50 text-xs font-bold px-4 py-2 rounded-xl shadow transition-all active:scale-95"
          >
            ✈️ Plan Trip
          </Link>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-slate-200 mb-6 gap-0.5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === t.id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            {t.label}
            {t.badge !== null && t.badge > 0 && (
              <span className={`text-[11px] rounded-full px-1.5 py-0.5 font-bold ${activeTab === t.id ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ TAB: CHAT ═══ */}
      {activeTab === "chat" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
          <div className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <span className="text-4xl">💬</span>
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderEmail === user?.email;
                return (
                  <div key={m.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isMe ? "bg-brand-600 text-white" : avatarColor(m.senderName ?? "")
                        }`}
                    >
                      {(m.senderName ?? "?")[0]?.toUpperCase()}
                    </div>
                    <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                      <p className={`text-[11px] text-slate-400 mb-0.5 ${isMe ? "text-right" : ""}`}>
                        {isMe ? "You" : m.senderName} · {fmtDateTime(m.createdAt)}
                      </p>
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm ${isMe
                            ? "bg-brand-600 text-white rounded-tr-sm"
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                          }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-slate-200">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
            >
              {sending ? "…" : "Send"}
            </button>
          </form>
        </div>
      )}

      {/* ═══ TAB: MEMBERS ═══ */}
      {activeTab === "members" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm animate-fadeIn">
          {members.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-3xl mb-2">👤</p>
              <p className="text-sm">No members yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {members.map((m, i) => (
                <li key={m.id ?? i} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${avatarColor(m.fullName ?? "")}`}
                    >
                      {(m.fullName ?? "?")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        {m.fullName}
                        {m.email === group.ownerEmail && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                            Admin
                          </span>
                        )}
                        {m.email === user?.email && (
                          <span className="text-[10px] bg-brand-50 text-brand-600 border border-brand-100 px-1.5 py-0.5 rounded-full font-bold">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                  </div>
                  {isOwner && m.email !== group.ownerEmail && m.email !== user?.email && (
                    <button
                      disabled={removing === m.id}
                      onClick={() => handleRemove(m.id)}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {removing === m.id ? "…" : "Remove"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ═══ TAB: INVITE ═══ */}
      {activeTab === "invite" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 animate-fadeIn">
          <InvitePanel groupId={groupId} onSuccess={loadAll} />
        </div>
      )}

      {/* ═══ TAB: INVITATION HISTORY ═══ */}
      {activeTab === "history" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 animate-fadeIn">
          <h2 className="font-bold text-slate-900 mb-4">Invitation History</h2>
          <InvitationHistory groupId={groupId} />
        </div>
      )}
    </div>
  );
}
