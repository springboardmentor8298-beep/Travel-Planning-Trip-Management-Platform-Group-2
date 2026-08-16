import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import api from "../api/axios";
import AppLayout from "../layout/AppLayout";
import { useAuth } from "../context/AuthContext";

const ROLE_COLORS = { TRAVELER: "#10b981", GROUP_ADMIN: "#f59e0b", ADMINISTRATOR: "#6366f1" };
const STATUS_COLORS = { PLANNED: "#3b82f6", ONGOING: "#10b981", COMPLETED: "#94a3b8", CANCELLED: "#ef4444" };

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const { isAdmin } = useAuth();

  useEffect(() => {
    api.get("/admin/analytics")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load admin analytics"));
  }, []);

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-8 py-16 text-center">
          <p className="text-4xl mb-3">🔒</p>
          <h1 className="text-xl font-bold text-slate-800">Administrator access required</h1>
          <p className="text-slate-500 mt-2">
            This page is restricted to the ADMINISTRATOR role. If you believe you should have
            access, ask an existing administrator to update your account role.
          </p>
        </div>
      </AppLayout>
    );
  }

  const roleData = data
    ? Object.entries(data.usersByRole).filter(([, c]) => c > 0).map(([name, value]) => ({ name, value }))
    : [];
  const statusData = data
    ? Object.entries(data.tripsByStatus).filter(([, c]) => c > 0).map(([name, value]) => ({ name, value }))
    : [];
  const destData = data ? data.topDestinations.map((d) => ({ name: d.name, trips: d.tripCount })) : [];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Admin Dashboard</h1>
        <p className="text-slate-500 mb-6">Platform-wide statistics across every user and trip.</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {!data ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Users" value={data.totalUsers} />
              <StatCard label="Total Trips" value={data.totalTrips} />
              <StatCard label="Destinations in Catalog" value={data.totalDestinationsInCatalog} />
              <StatCard label="Documents Uploaded" value={data.totalDocumentsUploaded} />
              <StatCard label="Platform Budget" value={`₹${data.totalBudgetAllocatedPlatformWide.toLocaleString()}`} />
              <StatCard label="Platform Expenses" value={`₹${data.totalExpensesPlatformWide.toLocaleString()}`} />
              <StatCard label="Notifications Sent" value={data.totalNotificationsSent} />
              <StatCard label="Group Memberships" value={data.totalGroupMemberships} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">Users by Role</h2>
                {roleData.length === 0 ? <p className="text-sm text-slate-400">No users yet.</p> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={roleData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {roleData.map((e) => <Cell key={e.name} fill={ROLE_COLORS[e.name] || "#94a3b8"} />)}
                      </Pie>
                      <Legend verticalAlign="bottom" height={30} iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">Trips by Status</h2>
                {statusData.length === 0 ? <p className="text-sm text-slate-400">No trips yet.</p> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {statusData.map((e) => <Cell key={e.name} fill={STATUS_COLORS[e.name] || "#94a3b8"} />)}
                      </Pie>
                      <Legend verticalAlign="bottom" height={30} iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Top 5 Destinations (Platform-wide)</h2>
              {destData.length === 0 ? <p className="text-sm text-slate-400">No trips planned yet.</p> : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={destData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="trips" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
