import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getNotifications,
  markAsRead,
  markAllReadApi,
  getUnreadCount,
} from "../api/Notificationapi";

/* ── Type metadata — covers ALL backend Notification.Type values ── */
const TYPE_META = {
  GROUP_INVITATION: {
    icon: "📨",
    label: "Group Invite",
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    accentBar: "border-l-emerald-500",
  },
  INVITATION_ACCEPTED: {
    icon: "✅",
    label: "Invite Accepted",
    color: "bg-green-50 border-green-200 text-green-700",
    accentBar: "border-l-green-500",
  },
  INVITATION_REJECTED: {
    icon: "❌",
    label: "Invite Declined",
    color: "bg-red-50 border-red-200 text-red-600",
    accentBar: "border-l-red-400",
  },
  GROUP_MEMBER_JOINED: {
    icon: "🎉",
    label: "New Member",
    color: "bg-violet-50 border-violet-200 text-violet-700",
    accentBar: "border-l-violet-500",
  },
  TRIP_REMINDER: {
    icon: "🧳",
    label: "Trip Reminder",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    accentBar: "border-l-blue-500",
  },
  ACTIVITY_REMINDER: {
    icon: "⏰",
    label: "Activity",
    color: "bg-indigo-50 border-indigo-200 text-indigo-700",
    accentBar: "border-l-indigo-500",
  },
  BUDGET_ALERT: {
    icon: "💰",
    label: "Budget Alert",
    color: "bg-amber-50 border-amber-200 text-amber-700",
    accentBar: "border-l-amber-500",
  },
  TRAVEL_UPDATE: {
    icon: "✈️",
    label: "Travel Update",
    color: "bg-sky-50 border-sky-200 text-sky-700",
    accentBar: "border-l-sky-500",
  },
  SYSTEM: {
    icon: "🔔",
    label: "System",
    color: "bg-slate-50 border-slate-200 text-slate-600",
    accentBar: "border-l-slate-400",
  },
};

const FILTER_TABS = [
  { key: "All", label: "All" },
  { key: "Unread", label: "🔵 Unread" },
  { key: "GROUP_INVITATION", label: "📨 Invites" },
  { key: "INVITATION_ACCEPTED", label: "✅ Accepted" },
  { key: "INVITATION_REJECTED", label: "❌ Declined" },
  { key: "GROUP_MEMBER_JOINED", label: "🎉 Joined" },
  { key: "TRIP_REMINDER", label: "🧳 Trips" },
  { key: "BUDGET_ALERT", label: "💰 Budget" },
  { key: "SYSTEM", label: "🔔 System" },
];

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(ts));
}

/* ── Single notification card ──────────────────────────────── */
function NotifCard({ n, onMarkRead }) {
  const meta = TYPE_META[n.type] ?? TYPE_META.SYSTEM;

  return (
    <div
      className={`relative bg-white rounded-xl border transition-all duration-200 ${!n.isRead
          ? `border-l-4 ${meta.accentBar} border-t-slate-200 border-r-slate-200 border-b-slate-200 shadow-sm`
          : "border-slate-200"
        }`}
    >
      <div className="px-4 py-3.5 flex gap-3 items-start">
        {/* Icon */}
        <span className="text-2xl flex-shrink-0 mt-0.5">{meta.icon}</span>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 justify-between">
            <div className="flex-1 min-w-0">
              {/* Title — clickable if actionUrl */}
              {n.actionUrl ? (
                <Link
                  to={n.actionUrl}
                  className="font-semibold text-sm text-slate-900 hover:text-brand-700 hover:underline"
                  onClick={() => !n.isRead && onMarkRead(n.id)}
                >
                  {n.title}
                </Link>
              ) : (
                <p className={`font-semibold text-sm ${n.isRead ? "text-slate-700" : "text-slate-900"}`}>
                  {n.title}
                </p>
              )}

              {/* Message */}
              {n.message && (
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
              )}

              {/* Footer row */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.color}`}>
                  {meta.label}
                </span>
                <span className="text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                {n.actionUrl && (
                  <Link
                    to={n.actionUrl}
                    className="text-[11px] text-brand-600 font-medium hover:underline"
                    onClick={() => !n.isRead && onMarkRead(n.id)}
                  >
                    View →
                  </Link>
                )}
              </div>
            </div>

            {/* Unread indicator */}
            {!n.isRead && (
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="w-2.5 h-2.5 bg-brand-500 rounded-full" title="Unread" />
                <button
                  onClick={() => onMarkRead(n.id)}
                  className="text-[11px] text-brand-600 hover:text-brand-800 font-medium whitespace-nowrap"
                >
                  Mark read
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("All");
  const [markingAll, setMarkingAll] = useState(false);

  /* ── Load ── */
  const load = () => {
    Promise.all([getNotifications(), getUnreadCount()])
      .then(([nRes, cRes]) => {
        setNotifications(nRes.data ?? []);
        setUnreadCount(Number(cRes.data?.count ?? cRes.data) || 0);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  /* ── Actions ── */
  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* Fallback: mark each individually */
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.allSettled(unread.map((n) => markAsRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } finally {
      setMarkingAll(false);
    }
  };

  /* ── Derived ── */
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "All") return true;
      if (filter === "Unread") return !n.isRead;
      return n.type === filter;
    });
  }, [notifications, filter]);

  const countFor = (key) => {
    if (key === "All") return notifications.length;
    if (key === "Unread") return notifications.filter((n) => !n.isRead).length;
    return notifications.filter((n) => n.type === key).length;
  };

  /* group counts for summary strip */
  const inviteCount = notifications.filter((n) => n.type === "GROUP_INVITATION" && !n.isRead).length;
  const acceptedCount = notifications.filter((n) => n.type === "INVITATION_ACCEPTED").length;
  const rejectedCount = notifications.filter((n) => n.type === "INVITATION_REJECTED").length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 gap-4 animate-fadeInDown">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm font-bold bg-brand-600 text-white rounded-full px-2.5 py-0.5 animate-scaleIn">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Your invitations, trip updates, and group activity.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex-shrink-0 text-sm font-semibold text-brand-600 hover:underline disabled:opacity-60"
          >
            {markingAll ? "Marking…" : "Mark all read ✓"}
          </button>
        )}
      </div>

      {/* ── Invitation status summary strip ── */}
      {(inviteCount > 0 || acceptedCount > 0 || rejectedCount > 0) && (
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fadeInUp">
          {[
            { label: "Pending invites", count: inviteCount, color: "bg-emerald-50 border-emerald-200", textColor: "text-emerald-700", icon: "📨", filterKey: "GROUP_INVITATION" },
            { label: "Accepted", count: acceptedCount, color: "bg-green-50 border-green-200", textColor: "text-green-700", icon: "✅", filterKey: "INVITATION_ACCEPTED" },
            { label: "Declined", count: rejectedCount, color: "bg-red-50 border-red-200", textColor: "text-red-600", icon: "❌", filterKey: "INVITATION_REJECTED" },
          ].map((s) => (
            <button
              key={s.filterKey}
              onClick={() => setFilter(s.filterKey)}
              className={`rounded-xl border p-3 text-left transition-all hover:shadow-sm ${s.color} ${filter === s.filterKey ? "ring-2 ring-offset-1 ring-brand-400" : ""
                }`}
            >
              <p className={`text-2xl font-extrabold ${s.textColor}`}>
                {s.icon} {s.count}
              </p>
              <p className={`text-xs font-medium mt-0.5 ${s.textColor}`}>{s.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* ── Filter chips ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTER_TABS.map(({ key, label }) => {
          const cnt = countFor(key);
          if (cnt === 0 && key !== "All" && key !== "Unread") return null;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === key
                  ? "bg-brand-600 text-white border-brand-600 scale-105 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-700"
                }`}
            >
              {label}
              {cnt > 0 && (
                <span className={`ml-1.5 text-[10px] font-bold ${filter === key ? "text-white/80" : "text-slate-400"}`}>
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl h-20 skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center animate-scaleIn">
          <p className="text-5xl mb-4">
            {filter === "Unread" ? "🎉" : filter === "GROUP_INVITATION" ? "📨" : "🔔"}
          </p>
          <p className="font-semibold text-slate-700">
            {filter === "Unread" ? "All caught up!" : "Nothing here yet."}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {filter === "Unread"
              ? "You have no unread notifications."
              : filter === "GROUP_INVITATION"
                ? "You have no pending group invitations."
                : "Notifications will appear here as you use TripNest."}
          </p>
          {filter !== "All" && (
            <button
              onClick={() => setFilter("All")}
              className="mt-4 text-sm text-brand-600 hover:underline font-medium"
            >
              View all notifications
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5 stagger-children">
          {filtered.map((n) => (
            <NotifCard key={n.id} n={n} onMarkRead={handleMarkRead} />
          ))}
        </div>
      )}
    </div>
  );
}
