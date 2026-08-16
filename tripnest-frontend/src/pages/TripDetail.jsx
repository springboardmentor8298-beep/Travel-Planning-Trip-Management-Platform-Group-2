import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import BudgetWidget from "../components/BudgetWidget";
import ExpenseTracker from "../components/ExpenseTracker";
import SmartInsightsWidget from "../components/SmartInsightsWidget";
import SettlementWidget from "../components/SettlementWidget";
import DocumentUpload from "../components/DocumentUpload";
import GroupMembers from "../components/GroupMembers";
import AppLayout from "../layout/AppLayout";

const TABS = ["Itinerary", "Budget & Expenses", "Insights", "Documents", "Group"];

export default function TripDetail() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Itinerary");
  const [refreshKey, setRefreshKey] = useState(0);

  const [dayNumber, setDayNumber] = useState("");
  const [date, setDate] = useState("");
  const [showDayForm, setShowDayForm] = useState(false);
  const [activityForms, setActivityForms] = useState({});

  const loadAll = async () => {
    try {
      const [tripRes, dashRes, itinRes] = await Promise.all([
        api.get(`/trips/${tripId}`),
        api.get(`/trips/${tripId}/dashboard`),
        api.get(`/trips/${tripId}/itineraries`),
      ]);
      setTrip(tripRes.data);
      setDashboard(dashRes.data);
      setItineraries(itinRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load trip");
    }
  };

  useEffect(() => { loadAll(); }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddDay = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/trips/${tripId}/itineraries`, { dayNumber: Number(dayNumber), date, notes: "" });
      setDayNumber(""); setDate(""); setShowDayForm(false);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add day");
    }
  };

  const handleActivityChange = (itineraryId, field, value) => {
    setActivityForms((prev) => ({ ...prev, [itineraryId]: { ...prev[itineraryId], [field]: value } }));
  };

  const handleAddActivity = async (e, itineraryId) => {
    e.preventDefault();
    const form = activityForms[itineraryId] || {};
    try {
      await api.post(`/itineraries/${itineraryId}/activities`, {
        title: form.title || "", type: form.type || "SIGHTSEEING",
        location: form.location || "", scheduledTime: form.scheduledTime || null, notes: "",
      });
      setActivityForms((prev) => ({ ...prev, [itineraryId]: {} }));
      loadAll();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add activity");
    }
  };

  // Bumped whenever an expense changes, so Insights/Settlement widgets refetch
  const handleExpenseChanged = () => setRefreshKey((k) => k + 1);

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto mt-10 p-6">
          <p className="text-red-500">{error}</p>
          <Link to="/trips" className="text-blue-600">← Back to trips</Link>
        </div>
      </AppLayout>
    );
  }

  if (!trip) return <AppLayout><div className="max-w-4xl mx-auto mt-10 p-6">Loading...</div></AppLayout>;

  return (
    <AppLayout>
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/40">
      <div className="max-w-4xl mx-auto pt-10 px-6 pb-20">
        <Link to="/trips" className="text-emerald-600 text-sm">← Back to trips</Link>
        <h1 className="text-2xl font-bold mt-2 text-slate-800">{trip.title}</h1>
        <p className="text-slate-500">{trip.startDate} → {trip.endDate} · {trip.status}</p>


        {dashboard && (
          <div className="grid grid-cols-4 gap-3 my-6">
            {[
              { label: "Total Days", value: dashboard.totalDays },
              { label: "Days Planned", value: dashboard.plannedItineraryDays },
              { label: "Activities", value: dashboard.totalActivities },
              { label: "Budget", value: `₹${dashboard.budget}` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/50 bg-white/70 backdrop-blur p-3 text-center shadow-sm">
                <div className="text-xl font-bold text-slate-800">{stat.value}</div>
                <div className="text-[11px] text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === tab
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Itinerary" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-slate-800">Itinerary</h2>
              <button onClick={() => setShowDayForm(!showDayForm)} className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm">
                {showDayForm ? "Cancel" : "+ Add Day"}
              </button>
            </div>

            {showDayForm && (
              <form onSubmit={handleAddDay} className="border border-slate-200 bg-white/70 p-3 rounded-xl mb-4 flex gap-3 items-end">
                <input type="number" placeholder="Day #" value={dayNumber} onChange={(e) => setDayNumber(e.target.value)} className="border p-2 rounded-lg w-24" required />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded-lg" required />
                <button type="submit" className="bg-emerald-600 text-white px-3 py-2 rounded-lg">Save</button>
              </form>
            )}

            {itineraries.length === 0 ? (
              <p className="text-slate-500">No itinerary days yet.</p>
            ) : (
              itineraries.map((day) => (
                <div key={day.id} className="rounded-xl border border-white/50 bg-white/70 backdrop-blur p-4 mb-4 shadow-sm">
                  <h3 className="font-semibold text-slate-800">Day {day.dayNumber} — {day.date}</h3>
                  {day.activities.length === 0 ? (
                    <p className="text-sm text-slate-500 mt-2">No activities yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-1">
                      {day.activities.map((a) => (
                        <li key={a.id} className="text-sm text-slate-700">
                          <span className="font-medium">{a.title}</span> — {a.type}
                          {a.scheduledTime ? ` @ ${a.scheduledTime}` : ""}
                          {a.location ? ` (${a.location})` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                  <form onSubmit={(e) => handleAddActivity(e, day.id)} className="flex gap-2 mt-3 flex-wrap">
                    <input type="text" placeholder="Activity title" value={activityForms[day.id]?.title || ""} onChange={(e) => handleActivityChange(day.id, "title", e.target.value)} className="border p-1 rounded-lg text-sm flex-1" required />
                    <select value={activityForms[day.id]?.type || "SIGHTSEEING"} onChange={(e) => handleActivityChange(day.id, "type", e.target.value)} className="border p-1 rounded-lg text-sm">
                      <option>SIGHTSEEING</option><option>TRANSPORTATION</option><option>ACCOMMODATION</option>
                      <option>DINING</option><option>ADVENTURE</option><option>SHOPPING</option>
                    </select>
                    <input type="time" value={activityForms[day.id]?.scheduledTime || ""} onChange={(e) => handleActivityChange(day.id, "scheduledTime", e.target.value)} className="border p-1 rounded-lg text-sm" />
                    <button type="submit" className="bg-slate-800 text-white px-3 py-1 rounded-lg text-sm">Add</button>
                  </form>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "Budget & Expenses" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BudgetWidget tripId={tripId} key={`budget-${refreshKey}`} />
            <ExpenseTracker tripId={tripId} onChanged={handleExpenseChanged} />
          </div>
        )}

        {activeTab === "Insights" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SmartInsightsWidget tripId={tripId} refreshKey={refreshKey} />
            <SettlementWidget tripId={tripId} refreshKey={refreshKey} />
          </div>
        )}

        {activeTab === "Documents" && <DocumentUpload tripId={tripId} />}

        {activeTab === "Group" && <GroupMembers tripId={tripId} />}
      </div>
    </div>
    </AppLayout>
  );
}
