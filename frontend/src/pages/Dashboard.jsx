import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tripApi } from "../api/tripApi";
import { userApi } from "../api/userApi";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import WeatherWidget from "../components/WeatherWidget";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/* ─── constants ─────────────────────────────────────────────── */
const STATUS_STYLE = {
  PLANNED: "bg-blue-50 text-blue-700 border-blue-200",
  ONGOING: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
};

const EXPENSE_CATEGORY_COLORS = {
  TRANSPORTATION: "#6366f1",
  HOTEL: "#f59e0b",
  FOOD: "#10b981",
  SHOPPING: "#ec4899",
  ENTERTAINMENT: "#8b5cf6",
  MISCELLANEOUS: "#94a3b8",
};

const EXPENSE_ICONS = {
  TRANSPORTATION: "🚌",
  HOTEL: "🏨",
  FOOD: "🍜",
  SHOPPING: "🛍️",
  ENTERTAINMENT: "🎭",
  MISCELLANEOUS: "📦",
};

const STATUS_COLORS = {
  PLANNED: "#6366f1",
  ONGOING: "#f59e0b",
  COMPLETED: "#10b981",
  CANCELLED: "#94a3b8",
};

/* ─── helpers ────────────────────────────────────────────────── */
const formatDate = (v) => {
  if (!v) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(v));
};
const formatINR = (v) => {
  if (!v) return "₹0";
  return `₹${Number(v).toLocaleString("en-IN")}`;
};

/* ─── Chart.js options ───────────────────────────────────────── */
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "62%",
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.raw}`,
      },
    },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${formatINR(ctx.raw)}`,
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    y: {
      beginAtZero: true,
      ticks: {
        font: { size: 10 },
        callback: (v) => `₹${Number(v).toLocaleString("en-IN")}`,
      },
      grid: { color: "#f1f5f9" },
    },
  },
};

/* ─── Main Dashboard ─────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [tripSummary, setTripSummary] = useState({
    totalTrips: 0, activePlans: 0, completedTrips: 0, plannedBudget: 0,
  });
  const [expenseSummaries, setExpenseSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    Promise.all([
      tripApi.getMyTrips(),
      tripApi.getSummary(),
      userApi.getUserCount(),
    ])
      .then(async ([tripsRes, summaryRes, countRes]) => {
        const tripList = tripsRes.data || [];
        setTrips(tripList);
        setTripSummary({
          totalTrips: Number(summaryRes.data?.totalTrips) || 0,
          activePlans: Number(summaryRes.data?.activePlans) || 0,
          completedTrips: Number(summaryRes.data?.completedTrips) || 0,
          plannedBudget: Number(summaryRes.data?.plannedBudget) || 0,
        });
        setUserCount(Number(countRes.data) || 0);

        // Load expense summaries for up to 3 trips
        const summaries = await Promise.all(
          tripList.slice(0, 3).map((t) =>
            tripApi.getExpenseSummary(t.id)
              .then((r) => ({ tripId: t.id, tripTitle: t.title, data: r.data }))
              .catch(() => null),
          ),
        );
        setExpenseSummaries(summaries.filter(Boolean));
      })
      .catch(() => setErrorMsg("Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  /* ─── Derived data ────────────────────────────────────────── */
  const upcomingTrips = useMemo(
    () => [...trips]
      .filter((t) => t.status !== "CANCELLED")
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 4),
    [trips],
  );

  const stats = [
    { label: "Total Trips", value: tripSummary.totalTrips, icon: "🗺️", color: "text-brand-700" },
    { label: "Active Plans", value: tripSummary.activePlans, icon: "✈️", color: "text-amber-600" },
    { label: "Completed", value: tripSummary.completedTrips, icon: "✅", color: "text-emerald-600" },
    { label: "Platform Users", value: userCount, icon: "👤", color: "text-violet-600" },
    { label: "Planned Budget", value: formatINR(tripSummary.plannedBudget), icon: "💰", color: "text-rose-600" },
  ];

  // Aggregate expense categories across all loaded summaries
  const aggregatedCategories = useMemo(() => {
    const totals = {};
    expenseSummaries.forEach(({ data }) => {
      if (!data?.categoryTotals) return;
      Object.entries(data.categoryTotals).forEach(([cat, amt]) => {
        totals[cat] = (totals[cat] || 0) + Number(amt);
      });
    });
    return Object.entries(totals)
      .map(([cat, value]) => ({
        label: cat.charAt(0) + cat.slice(1).toLowerCase(),
        value,
        color: EXPENSE_CATEGORY_COLORS[cat] || "#94a3b8",
        icon: EXPENSE_ICONS[cat] || "📦",
        category: cat,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenseSummaries]);

  const totalSpent = aggregatedCategories.reduce((s, c) => s + c.value, 0);

  // Trip status donut data
  const statusCounts = useMemo(() => {
    const m = { PLANNED: 0, ONGOING: 0, COMPLETED: 0, CANCELLED: 0 };
    trips.forEach((t) => { if (m[t.status] !== undefined) m[t.status]++; });
    return m;
  }, [trips]);

  const statusSegments = useMemo(() =>
    Object.entries(statusCounts).filter(([, v]) => v > 0),
    [statusCounts]);

  /* ─── Chart.js datasets ───────────────────────────────────── */
  const doughnutData = {
    labels: statusSegments.map(([label]) => label),
    datasets: [{
      data: statusSegments.map(([, v]) => v),
      backgroundColor: statusSegments.map(([label]) => STATUS_COLORS[label]),
      borderWidth: 2,
      borderColor: "#fff",
      hoverOffset: 6,
    }],
  };

  const expenseBarData = {
    labels: aggregatedCategories.map((c) => c.label),
    datasets: [{
      label: "Expenses",
      data: aggregatedCategories.map((c) => c.value),
      backgroundColor: aggregatedCategories.map((c) => c.color),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  /* ─── Budget vs Spent per trip ────────────────────────────── */
  const budgetVsSpent = useMemo(() =>
    expenseSummaries.map((es) => {
      const trip = trips.find((t) => t.id === es.tripId);
      const budget = Number(trip?.budget) || 0;
      const spent = Number(es.data?.totalSpent) || 0;
      const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
      return { title: es.tripTitle, budget, spent, pct };
    }),
    [expenseSummaries, trips]);

  /* ─── Render ──────────────────────────────────────────────── */
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-1">
            TripNest Dashboard
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome{user ? `, ${user.fullName?.split(" ")[0]}` : ""}! 👋
          </h1>
        </div>
      </section>

      {errorMsg && (
        <div className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {errorMsg}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid row 1 */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 mb-6">

        {/* Upcoming trips */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-semibold text-slate-900">Upcoming Trips</h2>
              <p className="text-xs text-slate-500">Your active and planned journeys.</p>
            </div>
            <Link to="/trips" className="text-sm font-medium text-brand-600 hover:underline">
              See all →
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-lg h-14 animate-pulse" />
              ))}
            </div>
          ) : upcomingTrips.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-3xl mb-2">✈️</p>
              <p className="text-slate-600 font-medium">No trips yet</p>
              <p className="text-sm text-slate-500 mt-1 mb-4">Create your first trip to get started.</p>
              <Link to="/trips/new" className="text-brand-600 font-medium hover:underline text-sm">
                Plan a trip →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingTrips.map((trip) => (
                <Link
                  key={trip.id}
                  to={`/trips/${trip.id}`}
                  className="block px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center text-lg flex-shrink-0">
                        🗺️
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{trip.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{trip.destination}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_STYLE[trip.status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      {trip.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Right column */}
        <aside className="space-y-5">

          {/* Trip Status Doughnut — Chart.js */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">Trip Status Overview</h2>
            {loading ? (
              <div className="h-28 bg-slate-100 rounded animate-pulse" />
            ) : trips.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No trips yet</p>
            ) : (
              <div className="flex items-center gap-5">
                <div className="relative" style={{ width: 96, height: 96, flexShrink: 0 }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
                <div className="space-y-2">
                  {statusSegments.map(([label, count]) => (
                    <div key={label} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STATUS_COLORS[label] }}
                      />
                      <span className="text-xs text-slate-600">{label}</span>
                      <span className="text-xs font-semibold text-slate-800 ml-auto">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: "/trips/new", label: "Create travel plan", icon: "+" },
                { to: "/destinations", label: "Explore destinations", icon: "🌍" },
                { to: "/groups", label: "Manage groups", icon: "👥" },
                { to: "/notifications", label: "View notifications", icon: "🔔" },
                { to: "/profile", label: "Update profile", icon: "👤" },
              ].map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:border-brand-200 hover:bg-brand-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>{a.icon}</span>
                    {a.label}
                  </span>
                  <span className="text-slate-400">›</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Analytics row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Expense Bar Chart — Chart.js */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900">Expense Breakdown</h2>
              <p className="text-xs text-slate-500 mt-0.5">Across your recent trips</p>
            </div>
            {totalSpent > 0 && (
              <span className="text-sm font-bold text-emerald-600">{formatINR(totalSpent)}</span>
            )}
          </div>

          {loading ? (
            <div className="h-40 bg-slate-100 rounded-lg animate-pulse" />
          ) : aggregatedCategories.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-3xl mb-2">💸</p>
              <p className="text-slate-600 font-medium">No expenses recorded</p>
              <p className="text-sm text-slate-500 mt-1">
                Add expenses to your trips to see the breakdown here.
              </p>
            </div>
          ) : (
            <>
              <div style={{ height: 160 }}>
                <Bar data={expenseBarData} options={barOptions} />
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-100">
                {aggregatedCategories.map((c) => (
                  <div key={c.category} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-500">{c.icon} {c.label}</span>
                    <span className="font-semibold text-slate-700">{formatINR(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Budget vs Spent per trip */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Budget vs Spent</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)}
            </div>
          ) : budgetVsSpent.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-slate-600 font-medium">No budget data yet</p>
              <p className="text-sm text-slate-500 mt-1">Set a budget on your trips to track spending.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {budgetVsSpent.map((b) => (
                <div key={b.title}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-slate-800 truncate max-w-[60%]">{b.title}</p>
                    <p className="text-xs text-slate-500">
                      <span className={b.pct >= 90 ? "text-red-600 font-semibold" : "text-emerald-600 font-semibold"}>
                        {formatINR(b.spent)}
                      </span>
                      {b.budget > 0 && <span className="text-slate-400"> / {formatINR(b.budget)}</span>}
                    </p>
                  </div>
                  {b.budget > 0 && (
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${b.pct >= 90 ? "bg-red-500" : b.pct >= 70 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                        style={{ width: `${b.pct}%` }}
                      />
                    </div>
                  )}
                  {b.budget > 0 && (
                    <p className="text-[10px] text-slate-400 mt-0.5 text-right">{b.pct.toFixed(0)}% used</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Weather for next trip */}
      {!loading && upcomingTrips.length > 0 && upcomingTrips[0].destination && (
        <div className="mb-6">
          <h2 className="font-semibold text-slate-900 mb-3">
            🌤️ Weather at Your Next Destination
          </h2>
          <WeatherWidget city={upcomingTrips[0].destination} />
        </div>
      )}

      {/* Bottom CTA */}
      {!loading && trips.length > 0 && (
        <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="text-white text-center sm:text-left">
            <p className="font-bold text-lg">Ready for your next adventure?</p>
            <p className="text-brand-100 text-sm mt-1">
              Explore destinations, plan a new trip, or invite friends to join yours.
            </p>
          </div>
          <Link
            to="/trips/new"
            className="flex-shrink-0 bg-white text-brand-700 hover:bg-brand-50 font-bold text-sm px-6 py-3 rounded-xl shadow transition-all active:scale-95"
          >
            ✈️ Plan New Trip
          </Link>
        </div>
      )}
    </div>
  );
}
