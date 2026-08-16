import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const load = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get("/notifications"),
        api.get("/notifications/unread-count"),
      ]);
      setNotifications(listRes.data);
      setUnreadCount(countRes.data.unreadCount);
    } catch {
      // Fail silently - notifications are a nice-to-have, not a blocker
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/70 border border-slate-200 hover:bg-white transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-white/40 bg-white/90 backdrop-blur-xl shadow-xl z-50">
          <div className="p-3 border-b border-slate-100 font-semibold text-sm text-slate-700">
            Notifications
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                className={`p-3 text-sm border-b border-slate-50 cursor-pointer ${n.isRead ? "text-slate-400" : "text-slate-800 bg-emerald-50/50"}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-semibold text-emerald-500 uppercase">{n.type.replace("_", " ")}</span>
                  {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />}
                </div>
                <p className="mt-1">{n.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
