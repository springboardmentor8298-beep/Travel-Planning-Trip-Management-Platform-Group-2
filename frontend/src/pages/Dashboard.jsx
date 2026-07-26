import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tripApi } from "../api/tripApi";
import { userApi } from "../api/userApi";

const statusStyles = {
  PLANNED: "bg-blue-50 text-blue-700 border-blue-200",
  ONGOING: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
};

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatBudget = (value) => {
  if (!value) return "No budget";
  return `INR ${Number(value).toLocaleString("en-IN")}`;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [tripSummary, setTripSummary] = useState({
    totalTrips: 0,
    activePlans: 0,
    completedTrips: 0,
    plannedBudget: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    Promise.all([tripApi.getMyTrips(), tripApi.getSummary(), userApi.getUserCount()])
      .then(([tripsRes, summaryRes, countRes]) => {
        setTrips(tripsRes.data || []);
        setTripSummary({
          totalTrips: Number(summaryRes.data?.totalTrips) || 0,
          activePlans: Number(summaryRes.data?.activePlans) || 0,
          completedTrips: Number(summaryRes.data?.completedTrips) || 0,
          plannedBudget: Number(summaryRes.data?.plannedBudget) || 0,
        });
        setUserCount(Number(countRes.data) || 0);
      })
      .catch(() => setErrorMsg("Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    return [
      { label: "Created accounts", value: userCount },
      { label: "Total trips", value: tripSummary.totalTrips },
      { label: "Active plans", value: tripSummary.activePlans },
      { label: "Completed", value: tripSummary.completedTrips },
      { label: "Planned budget", value: formatBudget(tripSummary.plannedBudget) },
    ];
  }, [tripSummary, userCount]);

  const upcomingTrips = useMemo(
    () =>
      [...trips]
        .filter((trip) => trip.status !== "CANCELLED")
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 3),
    [trips],
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <p className="text-sm font-medium text-brand-700 mb-2">TripNest Dashboard</p>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome{user ? `, ${user.fullName?.split(" ")[0]}` : ""}
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Plan your next trip, track budgets, and keep your travel crew in sync.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/trips/new"
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-md"
          >
            + New Trip
          </Link>
          <Link
            to="/trips"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-medium px-4 py-2.5 rounded-md"
          >
            View Trips
          </Link>
        </div>
      </section>

      {errorMsg && (
        <div className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {errorMsg}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((item) => (
          <div key={item.label} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <section className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-semibold text-slate-900">Your Upcoming Trips</h2>
              <p className="text-sm text-slate-500">Trips owned by you or shared with you.</p>
            </div>
            <Link to="/trips" className="text-sm font-medium text-brand-600 hover:underline">
              See all
            </Link>
          </div>

          {loading ? (
            <p className="px-5 py-8 text-sm text-slate-500">Loading dashboard...</p>
          ) : upcomingTrips.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-slate-600 font-medium">No trips planned yet.</p>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Create your first trip and it will appear here.
              </p>
              <Link to="/trips/new" className="text-brand-600 font-medium hover:underline">
                Plan a trip
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingTrips.map((trip) => (
                <Link
                  key={trip.id}
                  to={`/trips/${trip.id}`}
                  className="block px-5 py-4 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{trip.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{trip.destination}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {formatDate(trip.startDate)} to {formatDate(trip.endDate)}
                      </p>
                    </div>
                    <span
                      className={`w-fit text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        statusStyles[trip.status] || "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid gap-3">
              <Link
                to="/trips/new"
                className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-brand-200 hover:bg-brand-50"
              >
                Create travel plan
                <span aria-hidden="true">+</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-brand-200 hover:bg-brand-50"
              >
                Update profile
                <span aria-hidden="true">&gt;</span>
              </Link>
              <Link
                to="/trips"
                className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-brand-200 hover:bg-brand-50"
              >
                Manage all trips
                <span aria-hidden="true">&gt;</span>
              </Link>
            </div>
          </div>

          <div className="bg-brand-600 rounded-lg p-5 text-white shadow-sm">
            <h2 className="font-semibold mb-2">Ready for the next route?</h2>
            <p className="text-sm text-brand-100 mb-4">
              Add dates, budget, notes, and invite fellow travelers from each trip detail page.
            </p>
            <Link
              to="/trips/new"
              className="inline-flex bg-white text-brand-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-brand-50"
            >
              Start planning
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
