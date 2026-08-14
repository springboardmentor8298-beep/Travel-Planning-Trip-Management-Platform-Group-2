import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import { getTripStats, getTrips } from '../services/trip.service';

/**
 * Dashboard — premium dark hero design with glass stat cards and trip list.
 */
const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, tripsData] = await Promise.all([getTripStats(), getTrips()]);
        setStats(statsData);
        setRecentTrips(tripsData.slice(0, 5));
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    const map = {
      PLANNED:   { cls: 'badge-planned',   label: 'Planned' },
      ONGOING:   { cls: 'badge-ongoing',   label: 'Ongoing' },
      COMPLETED: { cls: 'badge-completed', label: 'Completed' },
      CANCELLED: { cls: 'badge-cancelled', label: 'Cancelled' },
    };
    const s = map[status] || { cls: 'badge-activity', label: status };
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  const statItems = [
    { label: 'Total Trips',  value: stats?.totalTrips   ?? 0, extraCls: '',               icon: '🗺️' },
    { label: 'Planned',      value: stats?.plannedTrips  ?? 0, extraCls: 'stat-planned',   icon: '📅' },
    { label: 'Ongoing',      value: stats?.ongoingTrips  ?? 0, extraCls: 'stat-ongoing',   icon: '✈️' },
    { label: 'Completed',    value: stats?.completedTrips ?? 0, extraCls: 'stat-completed', icon: '✅' },
  ];

  if (!currentUser) return null;

  const firstName = currentUser.firstName || currentUser.username;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-root">
      <Navbar />

      <div className="page-content">
        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(56,189,248,0.04) 50%, transparent 100%)',
          border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: '20px',
          padding: '2rem 2.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow orb */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>
              {greeting} 👋
            </p>
            <h1 style={{
              fontFamily: 'Plus Jakarta Sans',
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              marginBottom: '0.375rem',
              color: 'var(--text-primary)',
            }}>
              {firstName}!
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Here's an overview of your travel plans.
            </p>
          </div>

          <Link
            to="/trips/new"
            className="btn btn-primary btn-auto"
            id="dashboard-new-trip-btn"
            style={{ flexShrink: 0 }}
          >
            <span>+</span> New Trip
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#475569' }}>
            <div style={{
              display: 'inline-block',
              width: '40px', height: '40px',
              border: '3px solid rgba(16,185,129,0.2)',
              borderTopColor: '#10b981',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginBottom: '1rem',
            }} />
            <p>Loading your dashboard…</p>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="stats-row" style={{ marginBottom: '1.75rem' }}>
              {statItems.map((s) => (
                <div key={s.label} className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                  <div className={`stat-number ${s.extraCls}`}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Trips */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Recent Trips</h2>
                <Link to="/trips" className="link" style={{ fontSize: '0.875rem' }}>View all →</Link>
              </div>

              {recentTrips.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No trips yet</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Start planning your first adventure!</p>
                  <Link to="/trips/new" className="btn btn-primary btn-auto" style={{ display: 'inline-flex' }}>
                    Plan Your First Trip
                  </Link>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Trip</th>
                      <th>Destination</th>
                      <th>Dates</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map((trip) => (
                      <tr key={trip.id}>
                        <td><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{trip.title}</span></td>
                        <td style={{ color: 'var(--text-secondary)' }}>📍 {trip.destination}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {trip.startDate} → {trip.endDate}
                        </td>
                        <td>{getStatusBadge(trip.status)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline btn-auto"
                            onClick={() => navigate(`/trips/${trip.id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Quick Actions */}
            <div className="section-card">
              <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>Quick Actions</h2>
              <div className="quick-actions">
                <Link to="/trips/new" className="quick-action-btn" id="qa-new-trip">
                  <span>🗺️</span>
                  <span>Plan a Trip</span>
                </Link>
                <Link to="/trips" className="quick-action-btn" id="qa-my-trips">
                  <span>📋</span>
                  <span>My Trips</span>
                </Link>
                <Link to="/destinations" className="quick-action-btn" id="qa-destinations">
                  <span>🌍</span>
                  <span>Destinations</span>
                </Link>
                <Link to="/analytics" className="quick-action-btn" id="qa-analytics">
                  <span>📊</span>
                  <span>Analytics</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
