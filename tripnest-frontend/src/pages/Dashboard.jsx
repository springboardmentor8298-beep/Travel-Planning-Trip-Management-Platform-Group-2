import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../api/axios";
import AppLayout from "../layout/AppLayout";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  PLANNED: "#3b82f6",
  ONGOING: "#10b981",
  COMPLETED: "#94a3b8",
  CANCELLED: "#ef4444",
};

const CATEGORY_COLORS = {
  TRANSPORTATION: "#6366f1",
  HOTEL: "#a855f7",
  FOOD: "#f97316",
  SHOPPING: "#ec4899",
  ENTERTAINMENT: "#14b8a6",
  MISCELLANEOUS: "#64748b",
};

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4">
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load dashboard"));
  }, []);

  const statusData = stats
    ? Object.entries(stats.statusBreakdown)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({ name: status, value: count }))
    : [];

  const categoryData = stats
    ? Object.entries(stats.expenseCategoryBreakdown).map(([cat, amt]) => ({ name: cat, value: amt }))
    : [];

  const trendData = stats
    ? stats.recentExpenseTrend.map((p) => ({ date: p.date.slice(5), amount: p.amount }))
    : [];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Good to see you, {user?.fullName?.split(" ")[0] || "Traveler"} 👋
        </h1>
        <p className="text-slate-500 mb-6">Here's how your travel plans are shaping up.</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {!stats ? (
          <p className="text-slate-500">Loading dashboard...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              <StatCard label="Total Trips" value={stats.totalTrips} />
              <StatCard label="Total Budget" value={`₹${stats.totalBudget.toLocaleString()}`} />
              <StatCard label="Total Expenses" value={`₹${stats.totalExpenses.toLocaleString()}`} />
              <StatCard label="Average Trip Cost" value={`₹${stats.averageTripCost.toLocaleString()}`} />
              <StatCard label="Most Visited" value={stats.mostVisited} />
              <StatCard label="Top Category" value={stats.topExpenseCategory} />
              <StatCard label="Budget Used" value={`${stats.budgetUtilizationPercent.toFixed(0)}%`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">Trip Status</h2>
                {statusData.length === 0 ? (
                  <p className="text-sm text-slate-400">No trips yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={30} iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">Expense Categories</h2>
                {categoryData.length === 0 ? (
                  <p className="text-sm text-slate-400">No expenses logged yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {categoryData.map((entry) => (
                          <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={30} iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 mb-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent Expense Trend (Last 7 Days)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-slate-800">Recent Trips</h2>
              <Link to="/trips" className="text-sm text-emerald-600 font-medium">View All →</Link>
            </div>
            {stats.recentTrips.length === 0 ? (
              <p className="text-slate-500">No trips yet - plan your first one!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.recentTrips.map((trip) => (
                  <Link
                    key={trip.id}
                    to={`/trips/${trip.id}`}
                    className="bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-lg transition p-4"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-slate-800">{trip.title}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      📍 {trip.city ? `${trip.city}, ${trip.state || ""}` : trip.destination?.name || "TBD"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">📅 {trip.startDate}</p>
                    {trip.budget ? <p className="text-xs text-emerald-600 font-medium mt-1">💰 ₹{trip.budget}</p> : null}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
