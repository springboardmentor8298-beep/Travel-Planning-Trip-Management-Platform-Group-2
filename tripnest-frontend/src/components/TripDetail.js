import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import ItineraryDay from './ItineraryDay';
import BudgetShare from './BudgetShare';
import { getTripById, deleteTrip, getItineraries, addItinerary, deleteItinerary } from '../services/trip.service';

/**
 * TripDetail — full trip view with itinerary days and activities.
 */
const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBudgetShare, setShowBudgetShare] = useState(false);

  // Add day form
  const [showAddDay, setShowAddDay] = useState(false);
  const [dayForm, setDayForm] = useState({ dayNumber: '', date: '', notes: '' });
  const [addingDay, setAddingDay] = useState(false);
  const [dayError, setDayError] = useState('');

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tripData, itnData] = await Promise.all([getTripById(id), getItineraries(id)]);
      setTrip(tripData);
      setItineraries(itnData);
    } catch {
      setError('Failed to load trip.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm('Are you sure you want to delete this trip and all its data?')) return;
    try {
      await deleteTrip(id);
      navigate('/trips');
    } catch {
      setError('Failed to delete trip.');
    }
  };

  const handleAddDay = async (e) => {
    e.preventDefault();
    setDayError('');
    setAddingDay(true);
    try {
      const payload = {
        dayNumber: parseInt(dayForm.dayNumber, 10),
        date: dayForm.date || null,
        notes: dayForm.notes || null,
      };
      const newDay = await addItinerary(id, payload);
      setItineraries((prev) => [...prev, newDay].sort((a, b) => a.dayNumber - b.dayNumber));
      setDayForm({ dayNumber: '', date: '', notes: '' });
      setShowAddDay(false);
    } catch (err) {
      setDayError(err.response?.data?.message || 'Failed to add day.');
    } finally {
      setAddingDay(false);
    }
  };

  const handleDeleteDay = async (dayId) => {
    if (!window.confirm('Delete this day and all its activities?')) return;
    try {
      await deleteItinerary(id, dayId);
      setItineraries((prev) => prev.filter((d) => d.id !== dayId));
    } catch {
      setError('Failed to delete day.');
    }
  };

  const getStatusClass = (status) => {
    const map = { PLANNED: 'badge-planned', ONGOING: 'badge-ongoing', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled' };
    return `badge ${map[status] || ''}`;
  };

  if (loading) return (
    <div className="page-root">
      <Navbar />
      <div className="page-content"><div className="loading-text">Loading trip...</div></div>
    </div>
  );

  if (!trip) return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        <div className="alert alert-error">Trip not found.</div>
        <Link to="/trips" className="link">← Back to trips</Link>
      </div>
    </div>
  );

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Trip Header */}
        <div className="trip-detail-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
              <h1 className="page-title" style={{ marginBottom: 0 }}>{trip.title}</h1>
              <span className={getStatusClass(trip.status)}>{trip.status}</span>
            </div>
            <p className="page-subtitle">📍 {trip.destination}</p>
          </div>
          <div className="trip-detail-actions">
            {trip.budget && (
              <button 
                className="btn btn-outline btn-auto" 
                onClick={() => setShowBudgetShare(!showBudgetShare)}
              >
                {showBudgetShare ? 'Hide Budget Share' : 'Budget Share'}
              </button>
            )}
            <Link to={`/trips/${id}/edit`} className="btn btn-outline btn-auto" id="edit-trip-btn">Edit</Link>
            <button className="btn btn-danger btn-auto" onClick={handleDeleteTrip} id="delete-trip-detail-btn">Delete</button>
          </div>
        </div>

        {/* Trip Info Cards */}
        <div className="trip-info-row">
          <div className="info-card">
            <div className="info-label">Dates</div>
            <div className="info-value">📅 {trip.startDate} → {trip.endDate}</div>
          </div>
          <div className="info-card">
            <div className="info-label">Duration</div>
            <div className="info-value">🗓️ {trip.durationDays} day{trip.durationDays !== 1 ? 's' : ''}</div>
          </div>
          <div className="info-card">
            <div className="info-label">Travelers</div>
            <div className="info-value">👥 {trip.numberOfTravelers}</div>
          </div>
          {trip.budget && (
            <div className="info-card">
              <div className="info-label">Budget</div>
              <div className="info-value">💰 ₹{Number(trip.budget).toLocaleString()}</div>
            </div>
          )}
        </div>

        {trip.description && (
          <div className="section-card">
            <h2 className="section-title">About This Adventure</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{trip.description}</p>
          </div>
        )}

        {/* Budget Sharing Section */}
        {showBudgetShare && trip.budget && (
          <div className="section-card">
            <BudgetShare tripId={id} />
          </div>
        )}

        {/* Itinerary Section */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Itinerary ({itineraries.length} day{itineraries.length !== 1 ? 's' : ''})</h2>
            <button
              className="btn btn-primary btn-auto"
              onClick={() => setShowAddDay(true)}
              id="add-day-btn"
            >
              + Add Day
            </button>
          </div>

          {/* Add Day Form */}
          {showAddDay && (
            <div className="activity-form-box" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>Add Itinerary Day</h4>
              {dayError && <div className="alert alert-error">{dayError}</div>}
              <form onSubmit={handleAddDay} id="add-day-form">
                <div className="form-row form-row-3">
                  <div className="form-group">
                    <label htmlFor="day-number">Day Number *</label>
                    <input
                      id="day-number"
                      type="number"
                      min="1"
                      className="form-input"
                      value={dayForm.dayNumber}
                      onChange={(e) => setDayForm((p) => ({ ...p, dayNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="day-date">Date</label>
                    <input
                      id="day-date"
                      type="date"
                      className="form-input"
                      value={dayForm.date}
                      onChange={(e) => setDayForm((p) => ({ ...p, date: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="day-notes">Notes</label>
                    <input
                      id="day-notes"
                      type="text"
                      className="form-input"
                      placeholder="Optional notes for the day"
                      value={dayForm.notes}
                      onChange={(e) => setDayForm((p) => ({ ...p, notes: e.target.value }))}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary btn-auto" disabled={addingDay} id="save-day-btn">
                    {addingDay ? <span className="spinner" /> : 'Add Day'}
                  </button>
                  <button type="button" className="btn btn-outline btn-auto" onClick={() => setShowAddDay(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {itineraries.length === 0 ? (
            <div className="empty-state">
              <p>No days planned yet. Click "+ Add Day" to build your adventure itinerary.</p>
            </div>
          ) : (
            <div className="itinerary-list">
              {itineraries.map((day) => (
                <ItineraryDay
                  key={day.id}
                  day={day}
                  tripId={id}
                  onDelete={handleDeleteDay}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
