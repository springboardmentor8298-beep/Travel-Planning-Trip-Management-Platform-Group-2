import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppLayout from "../layout/AppLayout";

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/destinations")
      .then((res) => setDestinations(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load destinations"))
      .finally(() => setLoading(false));
  }, []);

  const countries = useMemo(
    () => ["All", ...Array.from(new Set(destinations.map((d) => d.country))).sort()],
    [destinations]
  );

  const filtered = useMemo(() => {
    return destinations.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.country.toLowerCase().includes(search.toLowerCase());
      const matchesCountry = countryFilter === "All" || d.country === countryFilter;
      return matchesSearch && matchesCountry;
    });
  }, [destinations, search, countryFilter]);

  // Pre-fills the "Plan a New Journey" form on the Trips page via query params.
  const handlePlanTrip = (destination) => {
    navigate(`/trips?planFor=${encodeURIComponent(destination.name)}&country=${encodeURIComponent(destination.country)}`);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold mb-1 text-slate-800">Browse Destinations</h1>
        <p className="text-slate-500 mb-6">Discover places for your next trip.</p>

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
          >
            {countries.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-emerald-200">
            <p className="text-4xl mb-2">🗺️</p>
            <p className="text-slate-500">
              {destinations.length === 0
                ? "No destinations seeded yet - run the backend once with data.sql in place."
                : "No destinations match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col">
                {d.imageUrl && (
                  <div className="h-36 bg-cover bg-center" style={{ backgroundImage: `url('${d.imageUrl}')` }} />
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-slate-800">{d.name}</h3>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                      {d.country}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 flex-1">{d.description}</p>
                  {d.popularAttractions && (
                    <p className="text-xs text-slate-400 mt-3">✨ {d.popularAttractions}</p>
                  )}
                  <button
                    onClick={() => handlePlanTrip(d)}
                    className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 rounded-xl text-sm font-medium"
                  >
                    + Plan Trip Here
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
