import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './Navbar';
import { getDestinations, searchDestinations } from '../services/trip.service';
import userService from '../services/user.service';
import WeatherWidget from './WeatherWidget';

/**
 * Destinations — browse and search travel destinations with live weather and bookmarking.
 */
const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      getDestinations(),
      userService.getFavorites().catch(() => ({ data: [] }))
    ])
      .then(([dists, favs]) => {
        setDestinations(dists);
        if (favs.data) {
          setFavorites(new Set(favs.data.map(f => f.id)));
        }
      })
      .catch(() => setError('Failed to load destinations.'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleFavorite = async (destId, e) => {
    e.stopPropagation();
    try {
      const res = await userService.toggleFavorite(destId);
      const isFav = res.data.favorited;
      setFavorites(prev => {
        const next = new Set(prev);
        if (isFav) next.add(destId);
        else next.delete(destId);
        return next;
      });
    } catch {
      // Ignored if user not logged in
    }
  };

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
            <h1 className="page-title">Destinations 🌍</h1>
            <p className="page-subtitle">Explore global travel destinations with real-time weather and guides.</p>
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
            <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 className="modal-title">{selected.name}</h2>
                  <button
                    onClick={(e) => handleToggleFavorite(selected.id, e)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
                    title="Bookmark Favorite"
                  >
                    {favorites.has(selected.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <button className="modal-close" onClick={() => setSelected(null)} id="close-destination-modal">✕</button>
              </div>
              <div className="modal-body space-y-4">
                <p className="text-muted">🌐 {selected.country}</p>
                {selected.description && <p style={{ lineHeight: 1.7 }}>{selected.description}</p>}

                {/* Live Weather Forecast */}
                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                  <WeatherWidget destinationName={selected.name} />
                </div>

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
                <div className="dest-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="dest-name">{dest.name}</h3>
                    <span className="dest-country">🌐 {dest.country}</span>
                  </div>
                  <button
                    onClick={(e) => handleToggleFavorite(dest.id, e)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                    title="Bookmark Favorite"
                  >
                    {favorites.has(dest.id) ? '❤️' : '🤍'}
                  </button>
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
                    View Details & Weather
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
