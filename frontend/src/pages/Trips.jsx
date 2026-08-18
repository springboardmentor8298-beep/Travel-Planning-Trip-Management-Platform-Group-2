import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { tripApi } from "../api/tripApi";

const statusStyles = {
  PLANNED: "bg-blue-50 text-blue-700 border-blue-200",
  ONGOING: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const loadTrips = () => {
    setLoading(true);
    tripApi
      .getMyTrips()
      .then((res) => setTrips(res.data))
      .catch(() => setErrorMsg("Could not load your trips."))
      .finally(() => setLoading(false));
  };

  useEffect(loadTrips, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trip? This cannot be undone.")) return;
    try {
      await tripApi.deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete trip.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Trips</h1>
          <p className="text-sm text-slate-500">Plan, edit, and track all your journeys.</p>
        </div>
        <Link
          to="/trips/new"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-md"
        >
          + New Trip
        </Link>
      </div>

      {errorMsg && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 text-sm">Loading trips...</p>
      ) : trips.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <p className="text-slate-500 mb-4">You haven't planned any trips yet.</p>
          <Link to="/trips/new" className="text-brand-600 font-medium hover:underline">
            Create your first trip →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800">{trip.title}</h3>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusStyles[trip.status] || ""}`}
                >
                  {trip.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">📍 {trip.destination}</p>
              <p className="text-sm text-slate-500 mb-3">
                {trip.startDate} → {trip.endDate}
              </p>
              {trip.budget && (
                <p className="text-sm text-slate-500 mb-3">💰 Budget: ₹{Number(trip.budget).toLocaleString()}</p>
              )}
              <div className="flex gap-3 text-sm pt-2 border-t border-slate-100">
                <Link to={`/trips/${trip.id}`} className="text-brand-600 font-medium hover:underline">
                  View
                </Link>
                <Link to={`/trips/${trip.id}/edit`} className="text-slate-600 font-medium hover:underline">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(trip.id)}
                  className="text-red-600 font-medium hover:underline ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
