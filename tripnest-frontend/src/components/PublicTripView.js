import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicSharedTrip } from '../services/trip.service';
import TripMap from './TripMap';
import TripTimeline from './TripTimeline';
import WeatherWidget from './WeatherWidget';

const PublicTripView = () => {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedTrip = async () => {
      try {
        setLoading(true);
        const data = await getPublicSharedTrip(token);
        setTrip(data);
      } catch (err) {
        console.error('Failed to load shared trip:', err);
        setError('This shared trip link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchSharedTrip();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium">Loading shared trip itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <span className="text-4xl block mb-3">⚠️</span>
          <h2 className="text-xl font-bold text-white mb-2">Trip Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">{error || 'Unable to display this trip.'}</p>
          <Link
            to="/login"
            className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl transition-colors text-sm"
          >
            Go to TripNest Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✈️</span>
          <span className="font-black text-xl bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            TripNest
          </span>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-2">
            Shared Itinerary
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/register"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
          >
            Join TripNest
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Trip Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-extrabold rounded-full uppercase tracking-wider">
                  {trip.status || 'PLANNED'}
                </span>
                <span className="text-xs text-slate-400">Created by @{trip.username}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{trip.title}</h1>
              <p className="text-slate-300 font-medium text-base mt-1 flex items-center gap-2">
                <span>📍</span> {trip.destination}
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 text-right">
              <span className="text-xs text-slate-400 block">Trip Duration</span>
              <span className="text-xl font-bold text-white block mt-0.5">
                {trip.durationDays ? `${trip.durationDays} Days` : 'N/A'}
              </span>
              <span className="text-xs text-emerald-400 mt-1 block">
                {trip.startDate} {trip.endDate ? `– ${trip.endDate}` : ''}
              </span>
            </div>
          </div>

          {trip.description && (
            <p className="mt-4 text-slate-300 text-sm bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 leading-relaxed">
              {trip.description}
            </p>
          )}
        </div>

        {/* Live Weather Widget */}
        <WeatherWidget destinationName={trip.destination} />

        {/* Interactive Map */}
        <TripMap destination={trip.destination} itineraries={trip.itineraries || []} />

        {/* Chronological Timeline */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🗓️</span> Day-by-Day Itinerary & Activities
          </h3>
          <TripTimeline itineraries={trip.itineraries || []} />
        </div>
      </div>
    </div>
  );
};

export default PublicTripView;
