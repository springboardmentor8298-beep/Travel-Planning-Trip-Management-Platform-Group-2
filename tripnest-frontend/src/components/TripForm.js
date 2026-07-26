import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import { createTrip, getTripById, updateTrip } from '../services/trip.service';

/**
 * TripForm — used for both creating and editing a trip.
 * If `id` param is present, loads existing trip data for editing.
 */
const STATUS_OPTIONS = ['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'];

const TripForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: 'PLANNED',
    description: '',
    numberOfTravelers: 1,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      getTripById(id)
        .then((trip) => {
          setForm({
            title: trip.title || '',
            destination: trip.destination || '',
            startDate: trip.startDate || '',
            endDate: trip.endDate || '',
            budget: trip.budget != null ? String(trip.budget) : '',
            status: trip.status || 'PLANNED',
            description: trip.description || '',
            numberOfTravelers: trip.numberOfTravelers || 1,
          });
        })
        .catch(() => setError('Failed to load trip data.'))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date must be on or after start date.');
      return;
    }

    setLoading(true);
    const payload = {
      ...form,
      budget: form.budget ? parseFloat(form.budget) : null,
      numberOfTravelers: parseInt(form.numberOfTravelers, 10) || 1,
    };

    try {
      if (isEdit) {
        await updateTrip(id, payload);
      } else {
        const created = await createTrip(payload);
        navigate(`/trips/${created.id}`);
        return;
      }
      navigate(`/trips/${id}`);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save trip. Please check all fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="page-root">
      <Navbar />
      <div className="page-content"><div className="loading-text">Loading trip...</div></div>
    </div>
  );

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">{isEdit ? 'Edit Trip' : 'Plan a New Adventure'}</h1>
          <button className="btn btn-outline btn-auto" onClick={() => navigate(isEdit ? `/trips/${id}` : '/trips')}>
            Cancel
          </button>
        </div>

        <div className="form-card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} id="trip-form">
            {/* Title & Destination */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="trip-title">Trip Title *</label>
                <input
                  id="trip-title"
                  name="title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Europe Summer Adventure"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="trip-destination">Destination *</label>
                <input
                  id="trip-destination"
                  name="destination"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Paris, France"
                  value={form.destination}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="trip-start-date">Start Date *</label>
                <input
                  id="trip-start-date"
                  name="startDate"
                  type="date"
                  className="form-input"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="trip-end-date">End Date *</label>
                <input
                  id="trip-end-date"
                  name="endDate"
                  type="date"
                  className="form-input"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Budget & Travelers & Status */}
            <div className="form-row form-row-3">
              <div className="form-group">
                <label htmlFor="trip-budget">Budget (₹)</label>
                <input
                  id="trip-budget"
                  name="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  placeholder="Optional"
                  value={form.budget}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="trip-travelers">No. of Travelers</label>
                <input
                  id="trip-travelers"
                  name="numberOfTravelers"
                  type="number"
                  min="1"
                  className="form-input"
                  value={form.numberOfTravelers}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="trip-status">Status</label>
                <select
                  id="trip-status"
                  name="status"
                  className="form-input form-select"
                  value={form.status}
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="trip-description">Description</label>
              <textarea
                id="trip-description"
                name="description"
                className="form-input form-textarea"
                placeholder="Describe your adventure plans, goals, and notes..."
                rows={4}
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <button
              id="trip-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : isEdit ? 'Save Changes' : 'Create Adventure'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TripForm;
