import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../layout/AppLayout";

const STATUS_STYLES = {
  PLANNED: "bg-blue-100 text-blue-700",
  ONGOING: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [totalMembers, setTotalMembers] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");

  const [searchParams] = useSearchParams();

  // Pre-fill and auto-open the form when arriving from Destinations' "Plan Trip Here" button
  useEffect(() => {
    const planFor = searchParams.get("planFor");
    const countryParam = searchParams.get("country");
    if (planFor) {
      setTitle(`Trip to ${planFor}`);
      setCity(planFor);
      if (countryParam) setCountry(countryParam);
      setShowForm(true);
    }
  }, [searchParams]);

  const { user } = useAuth();

  const loadTrips = async () => {
    try {
      const res = await api.get("/trips");
      setTrips(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrips(); }, []);

  const resetForm = () => {
    setTitle(""); setCity(""); setState(""); setCountry("");
    setTotalMembers(""); setStartDate(""); setEndDate(""); setBudget(""); setNotes("");
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/trips", {
        title, city, state, country,
        totalMembers: totalMembers ? Number(totalMembers) : null,
        startDate, endDate,
        budget: budget ? Number(budget) : null,
        notes,
      });
      resetForm();
      setShowForm(false);
      loadTrips();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create trip");
    }
  };

  return (
    <AppLayout>
      <div
        className="relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-teal-800/60" />
        <div className="relative px-8 py-12">
          <h1 className="text-3xl font-bold text-white">Welcome back, {user?.fullName?.split(" ")[0] || "Traveler"} 👋</h1>
          <p className="text-emerald-100 mt-1">Here's everything you're planning right now.</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-5 bg-white text-emerald-800 font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:bg-emerald-50 transition"
          >
            {showForm ? "Cancel" : "+ Plan a New Journey"}
          </button>
        </div>
      </div>

      <div className="px-8 -mt-6 pb-16">
        {showForm && (
          <form onSubmit={handleCreateTrip} className="relative bg-white rounded-2xl shadow-xl border border-emerald-100 p-6 mb-8 max-w-2xl">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Plan a New Journey</h2>
            <p className="text-xs text-slate-400 mb-4">New adventure</p>

            <div className="space-y-3">
              <input
                type="text" placeholder="Trip title (e.g. Goa Weekend)" value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" required
              />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">City</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full mt-1 border border-slate-300 p-2 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">State</label>
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full mt-1 border border-slate-300 p-2 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full mt-1 border border-slate-300 p-2 rounded-xl text-sm" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Total Members</label>
                <input
                  type="number" min="1" value={totalMembers} onChange={(e) => setTotalMembers(e.target.value)}
                  className="w-full mt-1 border border-slate-300 p-2 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full mt-1 border border-slate-300 p-2 rounded-xl text-sm" required />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full mt-1 border border-slate-300 p-2 rounded-xl text-sm" required />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Allocated Budget (₹)</label>
                <input
                  type="number" value={budget} onChange={(e) => setBudget(e.target.value)}
                  className="w-full mt-1 border border-slate-300 p-2 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Important Notes</label>
                <textarea
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key details like lodging check-in rules or visa requirements..."
                  className="w-full mt-1 border border-slate-300 p-2 rounded-xl text-sm" rows={2}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-slate-500">Cancel</button>
              <button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm">
                Create Journey
              </button>
            </div>
          </form>
        )}

        <h2 className="text-lg font-semibold text-slate-800 mb-4 mt-2">My Trips</h2>

        {loading ? (
          <p className="text-slate-500">Loading trips...</p>
        ) : trips.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-emerald-200">
            <p className="text-4xl mb-2">🧳</p>
            <p className="text-slate-500">No trips yet. Plan your first adventure above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                to={`/trips/${trip.id}`}
                className="block bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition p-5"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-slate-800 text-lg">{trip.title}</h3>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[trip.status] || "bg-slate-100 text-slate-600"}`}>
                    {trip.status}
                  </span>
                </div>
                {(trip.city || trip.country) && (
                  <div className="text-sm text-slate-500 mt-1">
                    📍 {[trip.city, trip.state, trip.country].filter(Boolean).join(", ")}
                  </div>
                )}
                <div className="text-sm text-slate-500 mt-1">📅 {trip.startDate} → {trip.endDate}</div>
                {trip.totalMembers ? <div className="text-sm text-slate-500 mt-1">👥 {trip.totalMembers} members</div> : null}
                {trip.budget ? (
                  <div className="text-sm text-emerald-700 font-medium mt-1">💰 Budget: ₹{trip.budget}</div>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
