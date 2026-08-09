import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { getTrips, deleteTrip } from '../services/trip.service';

/**
 * TripList — displays all trips for the current user with search and filter.
 */
const STATUS_OPTIONS = ['ALL', 'PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'];

const TripList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    let result = trips;
    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [trips, search, statusFilter]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await getTrips();
      setTrips(data);
    } catch {
      setError('Failed to load trips.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    setDeletingId(id);
    try {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Failed to delete trip.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusClass = (status) => {
    const map = { PLANNED: 'badge-planned', ONGOING: 'badge-ongoing', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled' };
    return `badge ${map[status] || ''}`;
  };

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Trips</h1>
            <p className="page-subtitle">{trips.length} trip{trips.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link to="/trips/new" className="btn btn-primary btn-auto" id="triplist-new-trip-btn">
            + New Trip
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Filters */}
        <div className="filter-bar">
          <input
            id="trip-search-input"
            type="text"
            className="form-input filter-search"
            placeholder="Search trips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filter-tabs">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                id={`filter-${s.toLowerCase()}`}
                className={`filter-tab${statusFilter === s ? ' active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Trip Cards */}
        {loading ? (
          <div className="loading-text">Loading trips...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state section-card">
            <p>No trips found. <Link to="/trips/new" className="link">Create your first trip!</Link></p>
          </div>
        ) : (
          <div className="trip-grid">
            {filtered.map((trip) => (
              <div key={trip.id} className="trip-card">
                <div className="trip-card-header">
                  <div>
                    <h3 className="trip-card-title">{trip.title}</h3>
                    <p className="trip-card-destination">📍 {trip.destination}</p>
                  </div>
                  <span className={getStatusClass(trip.status)}>{trip.status}</span>
                </div>

                <div className="trip-card-meta">
                  <span>📅 {trip.startDate} → {trip.endDate}</span>
                  <span>🗓️ {trip.durationDays} day{trip.durationDays !== 1 ? 's' : ''}</span>
                  <span>👥 {trip.numberOfTravelers} traveler{trip.numberOfTravelers !== 1 ? 's' : ''}</span>
                  {trip.budget && <span>💰 ₹{Number(trip.budget).toLocaleString()}</span>}
                </div>

                {trip.description && (
                  <p className="trip-card-desc">{trip.description}</p>
                )}

                <div className="trip-card-actions">
                  <button
                    id={`view-trip-${trip.id}`}
                    className="btn btn-sm btn-primary btn-auto"
                    onClick={() => navigate(`/trips/${trip.id}`)}
                  >
                    View
                  </button>
                  {currentUser?.id === trip.userId && (
                    <>
                      <button
                        id={`edit-trip-${trip.id}`}
                        className="btn btn-sm btn-outline btn-auto"
                        onClick={() => navigate(`/trips/${trip.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        id={`delete-trip-${trip.id}`}
                        className="btn btn-sm btn-danger btn-auto"
                        onClick={() => handleDelete(trip.id)}
                        disabled={deletingId === trip.id}
                      >
                        {deletingId === trip.id ? '...' : 'Delete'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripList;
