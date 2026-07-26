import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import { getTripStats, getTrips } from '../services/trip.service';

/**
 * Dashboard — shows trip statistics and a list of upcoming trips.
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

  const getStatusClass = (status) => {
    const map = { PLANNED: 'badge-planned', ONGOING: 'badge-ongoing', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled' };
    return `badge ${map[status] || ''}`;
  };

  if (!currentUser) return null;

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome back, {currentUser.firstName || currentUser.username}! ✈️</h1>
            <p className="page-subtitle">Here's an overview of your travel adventures</p>
          </div>
          <Link to="/trips/new" className="btn btn-primary btn-auto" id="dashboard-new-trip-btn">
            + Plan New Trip
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Stats Cards */}
        {loading ? (
          <div className="loading-text">Loading your travel data...</div>
        ) : (
          <>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-number">{stats?.totalTrips ?? 0}</div>
                <div className="stat-label">Total Trips</div>
              </div>
              <div className="stat-card stat-planned">
                <div className="stat-number">{stats?.plannedTrips ?? 0}</div>
                <div className="stat-label">Planned</div>
              </div>
              <div className="stat-card stat-ongoing">
                <div className="stat-number">{stats?.ongoingTrips ?? 0}</div>
                <div className="stat-label">Ongoing</div>
              </div>
              <div className="stat-card stat-completed">
                <div className="stat-number">{stats?.completedTrips ?? 0}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            {/* Recent Trips */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Recent Trips</h2>
                <Link to="/trips" className="link">View all →</Link>
              </div>

              {recentTrips.length === 0 ? (
                <div className="empty-state">
                  <p>No trips yet. <Link to="/trips/new" className="link">Create your first adventure!</Link></p>
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
                        <td><strong>{trip.title}</strong></td>
                        <td>{trip.destination}</td>
                        <td className="text-muted">
                          {trip.startDate} → {trip.endDate}
                        </td>
                        <td>
                          <span className={getStatusClass(trip.status)}>{trip.status}</span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline"
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
              <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Quick Actions</h2>
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
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
