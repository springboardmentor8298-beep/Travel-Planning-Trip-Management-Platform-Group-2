import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './Navbar';
import { getDestinations, searchDestinations } from '../services/trip.service';

/**
 * Destinations — browse and search travel destinations.
 */
const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getDestinations()
      .then(setDestinations)
      .catch(() => setError('Failed to load destinations.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setSearching(true);
      getDestinations()
        .then(setDestinations)
        .finally(() => setSearching(false));
      return;
    }
    setSearching(true);
    searchDestinations(q)
      .then(setDestinations)
      .catch(() => setError('Search failed.'))
      .finally(() => setSearching(false));
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => handleSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search, handleSearch]);

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Explore Destinations 🌍</h1>
            <p className="page-subtitle">Discover amazing travel destinations around the world</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Search */}
        <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
          <input
            id="destination-search-input"
            type="text"
            className="form-input filter-search"
            placeholder="Search destinations or countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searching && <span className="text-muted" style={{ fontSize: '0.875rem' }}>Searching...</span>}
        </div>

        {/* Destination Detail Modal */}
        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{selected.name}</h2>
                <button className="modal-close" onClick={() => setSelected(null)} id="close-destination-modal">✕</button>
              </div>
              <div className="modal-body">
                <p className="text-muted" style={{ marginBottom: '1rem' }}>🌐 {selected.country}</p>
                {selected.description && <p style={{ marginBottom: '1rem', lineHeight: 1.7 }}>{selected.description}</p>}
                <div className="dest-detail-grid">
                  {selected.climate && (
                    <div className="dest-detail-item">
                      <div className="info-label">Climate</div>
                      <div>🌡️ {selected.climate}</div>
                    </div>
                  )}
                  {selected.bestTimeToVisit && (
                    <div className="dest-detail-item">
                      <div className="info-label">Best Time to Visit</div>
                      <div>📅 {selected.bestTimeToVisit}</div>
                    </div>
                  )}
                </div>
                {selected.popularAttractions && (
                  <div style={{ marginTop: '1rem' }}>
                    <div className="info-label" style={{ marginBottom: '0.5rem' }}>Popular Attractions</div>
                    <div className="attractions-list">
                      {selected.popularAttractions.split(',').map((a, i) => (
                        <span key={i} className="attraction-tag">{a.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Destination Grid */}
        {loading ? (
          <div className="loading-text">Loading destinations...</div>
        ) : destinations.length === 0 ? (
          <div className="empty-state section-card">
            <p>No destinations found.</p>
          </div>
        ) : (
          <div className="dest-grid">
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className="dest-card"
                onClick={() => setSelected(dest)}
                id={`destination-card-${dest.id}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelected(dest)}
              >
                <div className="dest-card-header">
                  <h3 className="dest-name">{dest.name}</h3>
                  <span className="dest-country">🌐 {dest.country}</span>
                </div>
                {dest.description && (
                  <p className="dest-desc">{dest.description.substring(0, 100)}...</p>
                )}
                <div className="dest-meta">
                  {dest.climate && <span className="dest-tag">🌡️ {dest.climate}</span>}
                  {dest.bestTimeToVisit && <span className="dest-tag">📅 {dest.bestTimeToVisit}</span>}
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <button className="btn btn-sm btn-outline btn-auto" id={`view-dest-${dest.id}`}>
                    Explore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
