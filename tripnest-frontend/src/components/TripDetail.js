import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import ItineraryDay from './ItineraryDay';
import BudgetOverview from './BudgetOverview';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';
import TripMembers from './TripMembers';
import GroupChat from './GroupChat';
import DocumentManager from './DocumentManager';
import WeatherWidget from './WeatherWidget';
import TripMap from './TripMap';
import TripTimeline from './TripTimeline';
import ExpenseSplits from './ExpenseSplits';
import { getTripById, deleteTrip, getItineraries, addItinerary, deleteItinerary, generateShareToken } from '../services/trip.service';
import authService from '../services/auth.service';

const TABS = [
  { id: 'overview',   label: '📋 Overview' },
  { id: 'itinerary',  label: '🗓️ Itinerary' },
  { id: 'map',        label: '🗺️ Map' },
  { id: 'timeline',   label: '📈 Timeline' },
  { id: 'budget',     label: '💰 Budget & Expenses' },
  { id: 'splits',     label: '🤝 Expense Splits' },
  { id: 'members',    label: '👥 Members' },
  { id: 'documents',  label: '📁 Documents' },
  { id: 'chat',       label: '💬 Group Chat' },
];

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [trip, setTrip] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedShare, setCopiedShare] = useState(false);

  // Expense form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseRefresh, setExpenseRefresh] = useState(0);

  // Add day form
  const [showAddDay, setShowAddDay] = useState(false);
  const [dayForm, setDayForm] = useState({ dayNumber: '', date: '', notes: '' });
  const [addingDay, setAddingDay] = useState(false);
  const [dayError, setDayError] = useState('');

  useEffect(() => { fetchAll(); }, [id]); // eslint-disable-line

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tripData, itnData] = await Promise.all([getTripById(id), getItineraries(id)]);
      setTrip(tripData);
      setItineraries(itnData);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError('You do not have permission to view this trip.');
      } else if (status === 404) {
        setError('Trip not found.');
      } else {
        setError('Failed to load trip details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShareTrip = async () => {
    try {
      const res = await generateShareToken(id);
      const token = res.shareToken || trip.shareToken;
      const shareUrl = `${window.location.origin}/trips/share/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    } catch (err) {
      console.error('Share generation error:', err);
      setError('Failed to generate public share link.');
    }
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm(`Are you sure you want to delete "${trip.title}"? This cannot be undone.`)) {
      return;
    }
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
      await addItinerary(id, payload);
      setDayForm({ dayNumber: '', date: '', notes: '' });
      setShowAddDay(false);
      const updated = await getItineraries(id);
      setItineraries(updated);
    } catch (err) {
      setDayError(err.response?.data?.message || 'Failed to add itinerary day.');
    } finally {
      setAddingDay(false);
    }
  };

  const handleDeleteDay = async (itineraryId) => {
    if (!window.confirm('Delete this day and all its activities?')) return;
    try {
      await deleteItinerary(id, itineraryId);
      setItineraries((prev) => prev.filter((d) => d.id !== itineraryId));
    } catch {
      setError('Failed to delete itinerary day.');
    }
  };

  const handleExpenseSaved = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
    setExpenseRefresh((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="page-root">
        <Navbar />
        <div className="page-content page-loading">
          <div className="spinner" />
          <p>Loading trip...</p>
        </div>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="page-root">
        <Navbar />
        <div className="page-content">
          <div className="alert alert-error">{error}</div>
          <Link to="/trips" className="btn btn-outline" style={{ marginTop: '1rem' }}>
            ← Back to My Trips
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && trip && currentUser.id === trip.userId;

  const getStatusClass = (status) => {
    switch (status) {
      case 'ONGOING':   return 'badge badge-success';
      case 'COMPLETED': return 'badge badge-info';
      case 'CANCELLED': return 'badge badge-danger';
      default:          return 'badge badge-warning';
    }
  };

  const handleExportPdf = async () => {
    try {
      const response = await fetch(`/api/trips/${trip.id}/export/pdf`, {
        headers: {
          'Authorization': 'Bearer ' + authService.getToken()
        }
      });
      if (!response.ok) throw new Error('PDF generation failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tripnest_${trip.title.replace(/\s+/g, '_')}_summary.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export PDF.');
    }
  };

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
            <button className="btn btn-outline btn-auto" onClick={handleShareTrip} id="share-trip-btn">
              {copiedShare ? '✅ Link Copied!' : '🔗 Share Trip'}
            </button>
            <button className="btn btn-outline btn-auto" onClick={handleExportPdf} id="export-pdf-btn">
              📄 Export PDF
            </button>
            {isOwner && (
              <>
                <Link to={`/trips/${id}/edit`} className="btn btn-outline btn-auto" id="edit-trip-btn">Edit</Link>
                <button className="btn btn-danger btn-auto" onClick={handleDeleteTrip} id="delete-trip-detail-btn">Delete</button>
              </>
            )}
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

        {/* Tab Navigation */}
        <div className="trip-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`trip-tab ${activeTab === tab.id ? 'trip-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="trip-tab-content">

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="section-card">
                <h2 className="section-title">Trip Overview</h2>
                {trip.description && (
                  <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{trip.description}</p>
                )}
                <div className="overview-quick-stats">
                  <div className="quick-stat">
                    <div className="quick-stat__label">Status</div>
                    <span className={getStatusClass(trip.status)}>{trip.status}</span>
                  </div>
                  <div className="quick-stat">
                    <div className="quick-stat__label">Itinerary Days</div>
                    <div className="quick-stat__value">{itineraries.length}</div>
                  </div>
                  <div className="quick-stat">
                    <div className="quick-stat__label">Owner</div>
                    <div className="quick-stat__value">@{trip.username}</div>
                  </div>
                </div>
              </div>

              {/* Real-time destination weather */}
              <WeatherWidget destinationName={trip.destination} />
            </div>
          )}

          {/* Itinerary */}
          {activeTab === 'itinerary' && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Itinerary ({itineraries.length} day{itineraries.length !== 1 ? 's' : ''})</h2>
                <button className="btn btn-primary btn-auto" onClick={() => setShowAddDay(true)} id="add-day-btn">+ Add Day</button>
              </div>
              {showAddDay && (
                <div className="activity-form-box" style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.75rem' }}>Add Itinerary Day</h4>
                  {dayError && <div className="alert alert-error">{dayError}</div>}
                  <form onSubmit={handleAddDay} id="add-day-form">
                    <div className="form-row form-row-3">
                      <div className="form-group">
                        <label htmlFor="day-number">Day Number *</label>
                        <input id="day-number" type="number" min="1" className="form-input" value={dayForm.dayNumber}
                          onChange={(e) => setDayForm((p) => ({ ...p, dayNumber: e.target.value }))} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="day-date">Date</label>
                        <input id="day-date" type="date" className="form-input" value={dayForm.date}
                          onChange={(e) => setDayForm((p) => ({ ...p, date: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="day-notes">Notes</label>
                        <input id="day-notes" type="text" className="form-input" placeholder="Optional notes"
                          value={dayForm.notes} onChange={(e) => setDayForm((p) => ({ ...p, notes: e.target.value }))} />
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
                <div className="empty-state"><p>No days planned yet. Click "+ Add Day" to build your itinerary.</p></div>
              ) : (
                <div className="itinerary-list">
                  {itineraries.map((day) => (
                    <ItineraryDay key={day.id} day={day} tripId={id} onDelete={handleDeleteDay} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Interactive Map */}
          {activeTab === 'map' && (
            <div>
              <TripMap destination={trip.destination} itineraries={itineraries} />
            </div>
          )}

          {/* Visual Timeline */}
          {activeTab === 'timeline' && (
            <div className="section-card">
              <h2 className="section-title">Trip Timeline</h2>
              <TripTimeline itineraries={itineraries} />
            </div>
          )}

          {/* Budget & Expenses */}
          {activeTab === 'budget' && (
            <div className="section-card">
              <h2 className="section-title">Budget & Expenses</h2>
              <BudgetOverview tripId={id} key={expenseRefresh} />
              <div style={{ marginTop: '2rem' }}>
                <ExpenseList
                  tripId={id}
                  onEdit={(expense) => { setEditingExpense(expense); setShowExpenseForm(true); }}
                  onAdd={() => { setEditingExpense(null); setShowExpenseForm(true); }}
                  refresh={expenseRefresh}
                />
              </div>
              {showExpenseForm && (
                <ExpenseForm
                  tripId={id}
                  expense={editingExpense}
                  onSave={handleExpenseSaved}
                  onCancel={() => { setShowExpenseForm(false); setEditingExpense(null); }}
                />
              )}
            </div>
          )}

          {/* Group Expense Splits */}
          {activeTab === 'splits' && (
            <div className="section-card">
              <h2 className="section-title">Group Expense Splits & Settlements</h2>
              <ExpenseSplits tripId={id} />
            </div>
          )}

          {/* Members */}
          {activeTab === 'members' && (
            <div className="section-card">
              <h2 className="section-title">Trip Collaborators</h2>
              <TripMembers tripId={id} tripOwnerId={trip.userId} />
            </div>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <div className="section-card">
              <h2 className="section-title">Travel Documents</h2>
              <DocumentManager tripId={id} />
            </div>
          )}

          {/* Group Chat */}
          {activeTab === 'chat' && (
            <div className="section-card">
              <h2 className="section-title">Group Chat</h2>
              <GroupChat tripId={id} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TripDetail;
