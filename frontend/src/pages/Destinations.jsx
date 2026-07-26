import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const destinations = [
  {
    name: "Goa",
    region: "India",
    type: "Beach",
    budget: "Medium",
    bestTime: "November to February",
    highlights: ["Beaches", "Seafood", "Night markets"],
  },
  {
    name: "Ooty",
    region: "India",
    type: "Hill Station",
    budget: "Low",
    bestTime: "October to June",
    highlights: ["Tea gardens", "Lakes", "Cool weather"],
  },
  {
    name: "Tirupati",
    region: "India",
    type: "Pilgrimage",
    budget: "Low",
    bestTime: "September to March",
    highlights: ["Temple visit", "Local food", "Short stays"],
  },
  {
    name: "Jaipur",
    region: "India",
    type: "Heritage",
    budget: "Medium",
    bestTime: "October to March",
    highlights: ["Forts", "Markets", "Rajasthani food"],
  },
  {
    name: "Munnar",
    region: "India",
    type: "Nature",
    budget: "Medium",
    bestTime: "September to May",
    highlights: ["Tea estates", "Waterfalls", "Viewpoints"],
  },
  {
    name: "Singapore",
    region: "International",
    type: "City",
    budget: "High",
    bestTime: "February to April",
    highlights: ["Gardens", "Shopping", "Universal Studios"],
  },
];

export default function Destinations() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  const destinationTypes = useMemo(
    () => ["All", ...new Set(destinations.map((destination) => destination.type))],
    [],
  );

  const filteredDestinations = useMemo(
    () =>
      destinations.filter((destination) => {
        const matchesSearch = `${destination.name} ${destination.region} ${destination.highlights.join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesType = type === "All" || destination.type === type;
        return matchesSearch && matchesType;
      }),
    [search, type],
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-brand-700 mb-2">Destination Discovery</p>
          <h1 className="text-3xl font-bold text-slate-900">Explore Places</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Browse travel ideas, compare trip styles, and start planning from a destination.
          </p>
        </div>
        <Link
          to="/trips/new"
          className="w-fit bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-md"
        >
          Plan Custom Trip
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm mb-6">
        <div className="grid md:grid-cols-[1fr_220px] gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Search by place, region, or highlight"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {destinationTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDestinations.map((destination) => (
          <div
            key={destination.name}
            className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-semibold text-slate-900">{destination.name}</h2>
                <p className="text-sm text-slate-500">{destination.region}</p>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-brand-50 text-brand-700 border-brand-100">
                {destination.type}
              </span>
            </div>

            <div className="grid gap-2 text-sm mb-4">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Budget</span>
                <span className="font-medium text-slate-800">{destination.budget}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Best time</span>
                <span className="font-medium text-slate-800 text-right">{destination.bestTime}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {destination.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
                >
                  {highlight}
                </span>
              ))}
            </div>

            <Link
              to={`/trips/new?destination=${encodeURIComponent(
                `${destination.name}, ${destination.region}`,
              )}&title=${encodeURIComponent(`${destination.name} Trip`)}`}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              Start a plan
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
