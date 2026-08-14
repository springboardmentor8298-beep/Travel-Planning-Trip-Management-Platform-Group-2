import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicSharedTrip } from '../services/trip.service';
import TripMap from './TripMap';
import TripTimeline from './TripTimeline';
import WeatherWidget from './WeatherWidget';
import { Compass, Calendar, Clock, Users, DollarSign, MapPin } from 'lucide-react';

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
      <div className="page-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '40px', height: '40px',
            border: '3px solid rgba(16,185,129,0.2)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '1rem',
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading shared trip itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="page-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
        <div className="section-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⚠️</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Trip Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error || 'Unable to display this trip.'}</p>
          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Go to TripNest Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-root">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="nav-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Compass size={24} color="var(--accent)" />
            <span className="nav-brand-text">TripNest</span>
            <span className="badge badge-ongoing" style={{ fontSize: '0.75rem' }}>
              Shared Itinerary
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/register" className="btn btn-primary btn-sm btn-auto">
              Join TripNest
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="page-content">
        {/* Trip Hero Banner */}
        <div className="section-card" style={{
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(56,189,248,0.04) 50%, var(--bg-card) 100%)',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-completed">{trip.status || 'PLANNED'}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Created by @{trip.username}</span>
              </div>
              <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.375rem' }}>{trip.title}</h1>
              <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '1rem' }}>
                <MapPin size={16} /> <span>{trip.destination}</span>
              </p>
            </div>
          </div>

          {trip.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginTop: '1.25rem', maxWidth: '720px' }}>
              {trip.description}
            </p>
          )}

          {/* Quick Metrics */}
          <div className="trip-info-row" style={{ marginTop: '1.5rem' }}>
            <div className="info-card">
              <div className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={14} className="text-muted" /> Dates
              </div>
              <div className="info-value">{trip.startDate} → {trip.endDate}</div>
            </div>
            <div className="info-card">
              <div className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={14} className="text-muted" /> Duration
              </div>
              <div className="info-value">{trip.durationDays} day{trip.durationDays !== 1 ? 's' : ''}</div>
            </div>
            <div className="info-card">
              <div className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Users size={14} className="text-muted" /> Travelers
              </div>
              <div className="info-value">{trip.numberOfTravelers}</div>
            </div>
            {trip.budget && (
              <div className="info-card">
                <div className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <DollarSign size={14} className="text-muted" /> Budget
                </div>
                <div className="info-value">₹{Number(trip.budget).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Live Weather Forecast */}
        <div style={{ marginBottom: '2rem' }}>
          <WeatherWidget destinationName={trip.destination} />
        </div>

        {/* Map & Timeline Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.75rem' }}>
          <div className="section-card">
            <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>🗺️ Route & Places to Visit</h3>
            <TripMap tripId={trip.id} destinationName={trip.destination} />
          </div>

          <div className="section-card">
            <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>⏱️ Day-by-Day Timeline</h3>
            <TripTimeline tripId={trip.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicTripView;
