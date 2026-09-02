import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/userApi";
import { tripApi } from "../api/tripApi";
import axiosClient from "../api/axiosClient";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler,
);

/* ─── helpers ────────────────────────────────────────────────── */
const fmtINR = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
const fmtDate = (v) => v
  ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(v))
  : "—";

/* ─── Stat card ──────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color = "text-brand-700" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <p className="text-2xl mb-1">{icon}</p>
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ─── Chart options ──────────────────────────────────────────── */
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "60%",
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}` } },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    y: {
      beginAtZero: true,
      grid: { color: "#f1f5f9" },
      ticks: { font: { size: 10 }, stepSize: 1 },
    },
  },
};

const budgetBarOptions = {
  ...barOptions,
  scales: {
    ...barOptions.scales,
    y: {
      ...barOptions.scales.y,
      ticks: {
        font: { size: 10 },
        callback: (v) => `₹${Number(v).toLocaleString("en-IN")}`,
      },
    },
  },
};

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    y: {
      beginAtZero: true,
      grid: { color: "#f1f5f9" },
      ticks: { font: { size: 10 }, stepSize: 1 },
    },
  },
  elements: { point: { radius: 4, hoverRadius: 6 } },
};

/* ─── Colour palettes ────────────────────────────────────────── */
const ROLE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899"];
const STATUS_COLORS = { PLANNED: "#6366f1", ONGOING: "#f59e0b", COMPLETED: "#10b981", CANCELLED: "#94a3b8" };
const TYPE_COLORS = ["#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#6366f1", "#ef4444", "#06b6d4"];

/* ─── AdminDashboard ─────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Guard — ADMINISTRATOR only */
  useEffect(() => {
    if (user && user.role !== "ADMINISTRATOR") navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== "ADMINISTRATOR") return;
    Promise.all([
      userApi.getAllUsers().catch(() => ({ data: [] })),
      tripApi.getMyTrips().catch(() => ({ data: [] })),
      tripApi.getSummary().catch(() => ({ data: {} })),
      axiosClient.get("/destinations").catch(() => ({ data: [] })),
    ]).then(([usersRes, tripsRes, summaryRes, destRes]) => {
      setUsers(usersRes.data || []);
      setTrips(tripsRes.data || []);
      setStats(summaryRes.data || {});
      setDestinations(destRes.data || []);
    }).catch(() => setError("Could not load admin data."))
      .finally(() => setLoading(false));
  }, [user]);

  /* ─── Derived analytics ───────────────────────────────────── */

  // Users by role — Bar chart
  const usersByRole = useMemo(() => {
    const m = {};
    users.forEach((u) => { m[u.role] = (m[u.role] || 0) + 1; });
    const entries = Object.entries(m);
    return {
      labels: entries.map(([label]) => label),
      datasets: [{
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map((_, i) => ROLE_COLORS[i % ROLE_COLORS.length]),
        borderRadius: 6,
        borderSkipped: false,
      }],
    };
  }, [users]);

  // Trips by status — Doughnut
  const tripsByStatus = useMemo(() => {
    const m = { PLANNED: 0, ONGOING: 0, COMPLETED: 0, CANCELLED: 0 };
    trips.forEach((t) => { if (m[t.status] !== undefined) m[t.status]++; });
    const entries = Object.entries(m).filter(([, v]) => v > 0);
    return {
      labels: entries.map(([label]) => label),
      datasets: [{
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map(([label]) => STATUS_COLORS[label]),
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 6,
      }],
    };
  }, [trips]);

  const tripsByStatusEntries = useMemo(() => {
    const m = { PLANNED: 0, ONGOING: 0, COMPLETED: 0, CANCELLED: 0 };
    trips.forEach((t) => { if (m[t.status] !== undefined) m[t.status]++; });
    return Object.entries(m).filter(([, v]) => v > 0);
  }, [trips]);

  // Destinations by type — Bar
  const destByType = useMemo(() => {
    const m = {};
    destinations.forEach((d) => { const t = d.type || "Other"; m[t] = (m[t] || 0) + 1; });
    const entries = Object.entries(m);
    return {
      labels: entries.map(([label]) => label),
      datasets: [{
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map((_, i) => TYPE_COLORS[i % TYPE_COLORS.length]),
        borderRadius: 6,
        borderSkipped: false,
      }],
    };
  }, [destinations]);

  // Budget per trip — Line chart (top 8 trips)
  const budgetLine = useMemo(() => {
    const top = [...trips]
      .filter((t) => t.budget > 0)
      .sort((a, b) => Number(b.budget) - Number(a.budget))
      .slice(0, 8);
    return {
      labels: top.map((t) => t.title.length > 12 ? t.title.slice(0, 12) + "…" : t.title),
      datasets: [{
        label: "Budget",
        data: top.map((t) => Number(t.budget)),
        backgroundColor: "rgba(99,102,241,0.15)",
        borderColor: "#6366f1",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }],
    };
  }, [trips]);

  // User registrations by month (last 6 months) — Line chart
  const userGrowth = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ label: d.toLocaleString("en-IN", { month: "short", year: "2-digit" }), month: d.getMonth(), year: d.getFullYear() });
    }
    const counts = months.map(({ month, year }) =>
      users.filter((u) => {
        if (!u.createdAt) return false;
        const d = new Date(u.createdAt);
        return d.getMonth() === month && d.getFullYear() === year;
      }).length,
    );
    return {
      labels: months.map((m) => m.label),
      datasets: [{
        label: "New Users",
        data: counts,
        backgroundColor: "rgba(16,185,129,0.15)",
        borderColor: "#10b981",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }],
    };
  }, [users]);

  const totalBudget = useMemo(() => trips.reduce((s, t) => s + (Number(t.budget) || 0), 0), [trips]);
  const recentUsers = useMemo(() => [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8), [users]);
  const recentTrips = useMemo(() => [...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6), [trips]);

  /* ─── Guards ──────────────────────────────────────────────── */
  if (!user || user.role !== "ADMINISTRATOR") return null;

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <svg className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <p className="text-slate-500">Loading admin dashboard…</p>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <p className="text-red-600 font-medium">{error}</p>
    </div>
  );

  /* ─── Render ──────────────────────────────────────────────── */
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">ADMIN</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Platform analytics, user management and reporting.</p>
        </div>
        <Link to="/" className="text-sm text-brand-600 hover:underline font-medium">← User Dashboard</Link>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard icon="👤" label="Total Users" value={users.length} color="text-brand-700" />
        <StatCard icon="🗺️" label="Total Trips" value={stats?.totalTrips || trips.length} color="text-violet-600" />
        <StatCard icon="✈️" label="Active Plans" value={stats?.activePlans || 0} color="text-amber-600" />
        <StatCard icon="✅" label="Completed" value={stats?.completedTrips || 0} color="text-emerald-600" />
        <StatCard icon="🌍" label="Destinations" value={destinations.length} color="text-sky-600" />
        <StatCard icon="💰" label="Total Budget" value={fmtINR(totalBudget)} color="text-rose-600" sub={`across ${trips.length} trips`} />
      </div>

      {/* Row 1: Users by role (Bar) + Trips by status (Doughnut) */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Users by role — Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4">👤 Users by Role</h2>
          {users.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">No users found</p>
          ) : (
            <>
              <div style={{ height: 140 }}>
                <Bar data={usersByRole} options={barOptions} />
              </div>
              <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
                {usersByRole.labels.map((label, i) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs">
                    <span className="w-3 h-3 rounded-sm" style={{ background: ROLE_COLORS[i % ROLE_COLORS.length] }} />
                    <span className="text-slate-600">{label}</span>
                    <span className="font-bold text-slate-800">{usersByRole.datasets[0].data[i]}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Trips by status — Doughnut */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4">🗺️ Trips by Status</h2>
          {trips.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">No trips found</p>
          ) : (
            <div className="flex items-center gap-6">
              <div style={{ width: 130, height: 130, flexShrink: 0 }}>
                <Doughnut data={tripsByStatus} options={doughnutOptions} />
              </div>
              <div className="space-y-2.5 flex-1">
                {tripsByStatusEntries.map(([label, count]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: STATUS_COLORS[label] }} />
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className="font-bold text-slate-800 ml-auto">{count}</span>
                    <span className="text-xs text-slate-400">
                      ({trips.length > 0 ? ((count / trips.length) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Destinations by type (Bar) + Budget per trip (Line) */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Destinations by type — Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4">🌍 Destinations by Type</h2>
          {destByType.labels.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-400 text-sm">No destinations in database yet.</p>
              <Link to="/destinations/new" className="text-brand-600 text-sm font-medium hover:underline mt-2 block">
                + Add Destination
              </Link>
            </div>
          ) : (
            <>
              <div style={{ height: 140 }}>
                <Bar data={destByType} options={barOptions} />
              </div>
              <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
                {destByType.labels.map((label, i) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs">
                    <span className="w-3 h-3 rounded-sm" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                    <span className="text-slate-600">{label}</span>
                    <span className="font-bold text-slate-800">{destByType.datasets[0].data[i]}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Budget per trip — Line */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-1">💰 Budget per Trip</h2>
          <p className="text-xs text-slate-400 mb-4">Top trips by planned budget</p>
          {budgetLine.labels.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">No trips with budgets set</p>
          ) : (
            <div style={{ height: 150 }}>
              <Line data={budgetLine} options={budgetBarOptions} />
            </div>
          )}
        </div>
      </div>

      {/* Row 3: User growth (Line) + Budget report table */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* User growth — Line chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-1">📈 User Growth</h2>
          <p className="text-xs text-slate-400 mb-4">New registrations — last 6 months</p>
          <div style={{ height: 140 }}>
            <Line data={userGrowth} options={lineOptions} />
          </div>
        </div>

        {/* Budget report table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4">📊 Platform Report</h2>
          <div className="space-y-3">
            {[
              { l: "Total Planned Budget", v: fmtINR(totalBudget), c: "text-brand-700" },
              { l: "Trips with Budget Set", v: `${trips.filter((t) => t.budget > 0).length} trips`, c: "text-slate-800" },
              { l: "Avg Budget / Trip", v: trips.length ? fmtINR(totalBudget / trips.length) : "—", c: "text-emerald-600" },
              { l: "Total Users", v: users.length, c: "text-violet-600" },
              { l: "Active Plans", v: stats?.activePlans || 0, c: "text-amber-600" },
              { l: "Completed Trips", v: stats?.completedTrips || 0, c: "text-emerald-600" },
              { l: "Destinations", v: destinations.length, c: "text-sky-600" },
            ].map((r) => (
              <div key={r.l} className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-sm text-slate-500">{r.l}</span>
                <span className={`font-bold text-sm ${r.c}`}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Recent users + Recent trips */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Recent users */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Recent Users</h2>
            <span className="text-xs text-slate-400">{users.length} total</span>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-slate-400 px-5 py-8 text-center">No users found.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentUsers.map((u, i) => (
                <li key={u.id || i} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {(u.fullName || "U")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{u.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === "ADMINISTRATOR" ? "bg-red-100 text-red-700"
                        : u.role === "GROUP_ADMIN" ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-500"}`}>
                      {u.role}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(u.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent trips */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Recent Trips</h2>
            <span className="text-xs text-slate-400">{trips.length} total</span>
          </div>
          {recentTrips.length === 0 ? (
            <p className="text-sm text-slate-400 px-5 py-8 text-center">No trips found.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentTrips.map((t, i) => (
                <li key={t.id || i} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xl flex-shrink-0">🗺️</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                    <p className="text-xs text-slate-400 truncate">📍 {t.destination}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700"
                        : t.status === "ONGOING" ? "bg-amber-100 text-amber-700"
                          : t.status === "CANCELLED" ? "bg-slate-100 text-slate-500"
                            : "bg-blue-100 text-blue-700"}`}>
                      {t.status}
                    </span>
                    {t.budget > 0 && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{fmtINR(t.budget)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Platform Statistics banner */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="font-bold text-lg mb-4">📊 Platform Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { l: "Users", v: users.length },
            { l: "Trips", v: trips.length },
            { l: "Destinations", v: destinations.length },
            { l: "Budget Tracked", v: fmtINR(totalBudget) },
          ].map((s) => (
            <div key={s.l} className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold">{s.v}</p>
              <p className="text-xs text-brand-100 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
