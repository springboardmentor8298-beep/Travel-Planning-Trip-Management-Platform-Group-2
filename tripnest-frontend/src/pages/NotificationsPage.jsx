import { useState, useEffect } from "react";
import api from "../api/axios";
import AppLayout from "../layout/AppLayout";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/notifications")
      .then((res) => setNotifications(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load notifications"));
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Notifications</h1>
        <p className="text-slate-500 mb-6">Budget alerts, group invites, and trip updates.</p>

        {error && <p className="text-red-500">{error}</p>}

        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-emerald-200">
            <p className="text-4xl mb-2">🔔</p>
            <p className="text-slate-500">You're all caught up.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  n.isRead ? "bg-white border-slate-100 text-slate-400" : "bg-emerald-50 border-emerald-200 text-slate-800"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase">{n.type.replace("_", " ")}</span>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />}
                </div>
                <p className="mt-1 text-sm">{n.message}</p>
                <p className="text-[11px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
