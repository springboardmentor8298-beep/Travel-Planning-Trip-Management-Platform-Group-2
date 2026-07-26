import React, { useState } from 'react';
import { addActivity, updateActivity, deleteActivity } from '../services/trip.service';

const ACTIVITY_TYPES = ['SIGHTSEEING', 'TRANSPORT', 'ACCOMMODATION', 'DINING', 'ADVENTURE', 'SHOPPING'];

const ACTIVITY_ICONS = {
  SIGHTSEEING: '🏛️',
  TRANSPORT: '🚗',
  ACCOMMODATION: '🏨',
  DINING: '🍽️',
  ADVENTURE: '🧗',
  SHOPPING: '🛍️',
};

/**
 * ItineraryDay — shows a single itinerary day with its activities.
 * Handles activity CRUD inline.
 */
const ItineraryDay = ({ day, tripId, onDelete, onUpdate }) => {
  const [activities, setActivities] = useState(day.activities || []);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [actForm, setActForm] = useState(emptyActivityForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function emptyActivityForm() {
    return { name: '', description: '', activityType: 'SIGHTSEEING', startTime: '', endTime: '', location: '', cost: '' };
  }

  const openAddForm = () => {
    setEditingActivity(null);
    setActForm(emptyActivityForm());
    setShowForm(true);
    setError('');
  };

  const openEditForm = (act) => {
    setEditingActivity(act);
    setActForm({
      name: act.name || '',
      description: act.description || '',
      activityType: act.activityType || 'SIGHTSEEING',
      startTime: act.startTime || '',
      endTime: act.endTime || '',
      location: act.location || '',
      cost: act.cost != null ? String(act.cost) : '',
    });
    setShowForm(true);
    setError('');
  };

  const handleActChange = (e) => {
    const { name, value } = e.target;
    setActForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleActSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = { ...actForm, cost: actForm.cost ? parseFloat(actForm.cost) : null };
    if (!payload.startTime) payload.startTime = null;
    if (!payload.endTime) payload.endTime = null;

    try {
      if (editingActivity) {
        const updated = await updateActivity(day.id, editingActivity.id, payload);
        setActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const created = await addActivity(day.id, payload);
        setActivities((prev) => [...prev, created]);
      }
      setShowForm(false);
      setActForm(emptyActivityForm());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save activity.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async (actId) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await deleteActivity(day.id, actId);
      setActivities((prev) => prev.filter((a) => a.id !== actId));
    } catch {
      setError('Failed to delete activity.');
    }
  };

  return (
    <div className="day-card">
      <div className="day-card-header">
        <div>
          <h3 className="day-title">Day {day.dayNumber}</h3>
          {day.date && <span className="day-date">{day.date}</span>}
        </div>
        <div className="day-actions">
          <button className="btn btn-sm btn-outline btn-auto" onClick={openAddForm} id={`add-activity-day-${day.id}`}>
            + Activity
          </button>
          <button className="btn btn-sm btn-danger btn-auto" onClick={() => onDelete(day.id)} id={`delete-day-${day.id}`}>
            Delete Day
          </button>
        </div>
      </div>

      {day.notes && <p className="day-notes">{day.notes}</p>}

      {error && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}

      {/* Activities */}
      <div className="activity-list">
        {activities.length === 0 && !showForm && (
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>No activities planned yet. Add your first activity above.</p>
        )}
        {activities.map((act) => (
          <div key={act.id} className="activity-item">
            <div className="activity-icon">{ACTIVITY_ICONS[act.activityType] || '📌'}</div>
            <div className="activity-info">
              <div className="activity-name">{act.name}</div>
              <div className="activity-meta">
                <span className="badge badge-activity">{act.activityType}</span>
                {act.startTime && <span>{act.startTime}{act.endTime ? ` – ${act.endTime}` : ''}</span>}
                {act.location && <span>📍 {act.location}</span>}
                {act.cost != null && <span>💰 ₹{Number(act.cost).toLocaleString()}</span>}
              </div>
              {act.description && <p className="activity-desc">{act.description}</p>}
            </div>
            <div className="activity-actions">
              <button className="btn btn-sm btn-outline btn-auto" onClick={() => openEditForm(act)} id={`edit-act-${act.id}`}>Edit</button>
              <button className="btn btn-sm btn-danger btn-auto" onClick={() => handleDeleteActivity(act.id)} id={`delete-act-${act.id}`}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Form */}
      {showForm && (
        <div className="activity-form-box">
          <h4 style={{ marginBottom: '0.75rem' }}>{editingActivity ? 'Edit Activity' : 'Add Activity'}</h4>
          <form onSubmit={handleActSubmit} id={`activity-form-${day.id}`}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor={`act-name-${day.id}`}>Activity Name *</label>
                <input
                  id={`act-name-${day.id}`}
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Visit Eiffel Tower"
                  value={actForm.name}
                  onChange={handleActChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor={`act-type-${day.id}`}>Type</label>
                <select
                  id={`act-type-${day.id}`}
                  name="activityType"
                  className="form-input form-select"
                  value={actForm.activityType}
                  onChange={handleActChange}
                >
                  {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor={`act-start-${day.id}`}>Start Time</label>
                <input id={`act-start-${day.id}`} name="startTime" type="time" className="form-input" value={actForm.startTime} onChange={handleActChange} />
              </div>
              <div className="form-group">
                <label htmlFor={`act-end-${day.id}`}>End Time</label>
                <input id={`act-end-${day.id}`} name="endTime" type="time" className="form-input" value={actForm.endTime} onChange={handleActChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor={`act-location-${day.id}`}>Location</label>
                <input id={`act-location-${day.id}`} name="location" type="text" className="form-input" placeholder="Address or landmark" value={actForm.location} onChange={handleActChange} />
              </div>
              <div className="form-group">
                <label htmlFor={`act-cost-${day.id}`}>Cost (₹)</label>
                <input id={`act-cost-${day.id}`} name="cost" type="number" min="0" step="0.01" className="form-input" placeholder="Optional" value={actForm.cost} onChange={handleActChange} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor={`act-desc-${day.id}`}>Description</label>
              <textarea id={`act-desc-${day.id}`} name="description" className="form-input form-textarea" rows={2} placeholder="Optional notes" value={actForm.description} onChange={handleActChange} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary btn-auto" disabled={saving} id={`save-act-${day.id}`}>
                {saving ? <span className="spinner" /> : 'Save Activity'}
              </button>
              <button type="button" className="btn btn-outline btn-auto" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ItineraryDay;
