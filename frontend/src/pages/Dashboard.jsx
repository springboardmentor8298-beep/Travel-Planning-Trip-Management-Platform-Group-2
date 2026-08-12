import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CurrencyContext } from '../context/CurrencyContext';
import { Plus, Calendar, MapPin, DollarSign, Users, ChevronRight, Compass, Filter, Trash2 } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { formatAmount, currencySymbol } = useContext(CurrencyContext);
  const location = useLocation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  // New Trip Form State
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [tripStatus, setTripStatus] = useState('PLANNED');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchTrips();
    window.addEventListener('trip_updated', fetchTrips);
    return () => window.removeEventListener('trip_updated', fetchTrips);
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const destParam = params.get('destination');
    const createParam = params.get('create');
    if (destParam || createParam === 'true') {
      if (destParam) {
        setDestination(destParam);
        setTitle(`Trip to ${destParam}`);
      }
      setShowModal(true);
    }
  }, [location.search]);

  const fetchTrips = async () => {
    try {
      const emailParam = user?.email || user?.username || user?.id || '';
      const res = await api.get(`/trips?email=${encodeURIComponent(emailParam)}`);
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!budget || parseFloat(budget) <= 0) {
      alert("Target budget is required to create a trip!");
      return;
    }

    try {
      await api.post('/trips', {
        title,
        destination,
        startDate,
        endDate,
        ownerEmail: user?.email,
        totalBudget: parseFloat(budget || 0),
        budget: parseFloat(budget || 0),
        notes: description,
        description,
        status: tripStatus,
      });
      setShowModal(false);
      setTitle('');
      setDestination('');
      setStartDate('');
      setEndDate('');
      setBudget('');
      setTripStatus('PLANNED');
      setDescription('');
      fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create trip');
    }
  };

  const handleDeleteTrip = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await api.delete(`/trips/${id}`);
        fetchTrips();
      } catch (err) {
        alert('Failed to delete trip');
      }
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (filter === 'ALL') return true;
    const currentStatus = (t.status || 'PLANNED').trim().toUpperCase();
    return currentStatus === filter.toUpperCase();
  });

  const totalSpentAll = trips.reduce((acc, t) => acc + (t.spentBudget || t.totalExpenses || 0), 0);
  const totalBudget = trips.reduce((acc, t) => acc + (t.totalBudget || t.budget || 0), 0);

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            Travel <span className="gradient-text">Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
            Plan journeys, organize day-wise itineraries, and manage travel budgets.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 12 }}>
          <Plus size={18} /> Create New Trip
        </button>
      </div>

      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 36 }}>
        <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'rgba(99,102,241,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-accent)'
          }}>
            <Compass size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL TRIPS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 2 }}>{trips.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'rgba(16,185,129,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--success)'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL BUDGET</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 2 }}>{formatAmount(totalBudget)}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'rgba(236,72,153,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ec4899'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>EXPENSES RECORDED</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 2 }}>{formatAmount(totalSpentAll)}</div>
          </div>
        </div>
      </div>

      {/* Trips Roster Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Your Journeys</h2>
        <div style={{ display: 'flex', gap: 8, background: 'var(--input-bg)', padding: 4, borderRadius: 10, border: '1px solid var(--border-color)' }}>
          {['ALL', 'PLANNED', 'ACTIVE', 'COMPLETED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                background: filter === f ? 'var(--primary-accent)' : 'transparent',
                color: filter === f ? 'white' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading your journeys...</div>
      ) : filteredTrips.length === 0 ? (
        <div className="glass-panel" style={{ padding: 60, textAlign: 'center' }}>
          <Compass size={48} color="var(--primary-accent)" style={{ opacity: 0.8, marginBottom: 16 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>No journeys found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>Start planning your dream trip today.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} /> Create Your First Trip
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24
        }}>
          {filteredTrips.map((trip) => {
            const spent = trip.spentBudget || trip.totalExpenses || 0;
            const bgt = trip.totalBudget || trip.budget || 1;
            const progress = Math.min(100, Math.round((spent / bgt) * 100));

            return (
              <div key={trip.id} className="glass-panel" style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                overflow: 'hidden'
              }}>
                <div style={{ padding: 24 }}>
                  {/* Status & Actions Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <span className={`badge badge-${(trip.status || 'planned').toLowerCase()}`}>
                      {trip.status || 'PLANNED'}
                    </span>
                    <button
                      onClick={(e) => handleDeleteTrip(trip.id, e)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
                      title="Delete Trip"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>{trip.title}</h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                    <MapPin size={16} color="var(--primary-accent)" />
                    <span style={{ fontWeight: 600, color: '#e5e7eb' }}>{trip.destination}</span>
                  </div>

                  {trip.startDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
                      <Calendar size={15} />
                      {trip.startDate} to {trip.endDate || 'TBD'}
                    </div>
                  )}

                  {/* Budget Meter */}
                  <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Budget Spent</span>
                      <span style={{ color: spent > bgt ? 'var(--danger)' : '#fff' }}>
                        {formatAmount(spent)} / {formatAmount(bgt)}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: spent > bgt ? 'var(--danger)' : 'var(--primary-gradient)',
                        borderRadius: 3,
                        transition: 'width 0.4s ease'
                      }}></div>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '16px 24px',
                  background: 'rgba(0,0,0,0.2)',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Users size={14} /> {trip.memberCount || (trip.sharedMembers ? trip.sharedMembers.split(',').filter(Boolean).length + 1 : 1)} Traveler(s)
                  </div>
                  <Link to={`/trips/${trip.id}`} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                    Manage Trip <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Trip Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 20 }}>Plan New Trip</h3>
            <form onSubmit={handleCreateTrip}>
              <div className="form-group">
                <label className="form-label">Trip Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Summer Break in Paris"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Destination *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Paris, France"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Target Budget ({currencySymbol}) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g. 2500"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Trip Status</label>
                  <select
                    className="form-select"
                    value={tripStatus}
                    onChange={(e) => setTripStatus(e.target.value)}
                  >
                    <option value="PLANNED">PLANNED (Upcoming)</option>
                    <option value="ACTIVE">ACTIVE (Ongoing)</option>
                    <option value="COMPLETED">COMPLETED (Past Trip)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Trip objectives, packing notes, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
