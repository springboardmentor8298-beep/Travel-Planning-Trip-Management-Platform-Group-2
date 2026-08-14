import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './Navbar';
import { getDestinations, searchDestinations } from '../services/trip.service';
import userService from '../services/user.service';
import WeatherWidget from './WeatherWidget';
import { Globe, Search, Heart, Thermometer, Calendar, X, Sparkles } from 'lucide-react';

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

  const onSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    handleSearch(val);
  };

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className="page-title">Explore Destinations</h1>
            <p className="page-subtitle">Discover top travel spots, check live weather, and bookmark your dream getaways</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Search Bar */}
        <div className="search-bar-wrapper" style={{ marginBottom: '2rem' }}>
          <div className="search-input-container" style={{ position: 'relative' }}>
            <Search size={18} className="search-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              id="search-destinations-input"
              type="text"
              className="form-input search-input"
              placeholder="Search by city or country (e.g. Tokyo, France)..."
              value={search}
              onChange={onSearchChange}
              style={{ paddingLeft: '2.75rem' }}
            />
            {searching && <span className="search-spinner spinner" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}></span>}
          </div>
        </div>

        {/* Destination Detail Modal */}
        {selected && (
          <div className="modal-backdrop" onClick={() => setSelected(null)}>
            <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h2 className="modal-title">{selected.name}</h2>
                  <button
                    onClick={(e) => handleToggleFavorite(selected.id, e)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Bookmark Favorite"
                  >
                    <Heart size={20} fill={favorites.has(selected.id) ? '#ef4444' : 'none'} color={favorites.has(selected.id) ? '#ef4444' : '#9ca3af'} />
                  </button>
                </div>
                <button className="modal-close" onClick={() => setSelected(null)} id="close-destination-modal">
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body space-y-4">
                <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Globe size={15} />
                  <span>{selected.country}</span>
                </p>
                {selected.description && <p style={{ lineHeight: 1.7 }}>{selected.description}</p>}

                {/* Live Weather Forecast */}
                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                  <WeatherWidget destinationName={selected.name} />
                </div>

                <div className="dest-detail-grid">
                  {selected.climate && (
                    <div className="dest-detail-item">
                      <div className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Thermometer size={14} className="text-muted" /> Climate
                      </div>
                      <div>{selected.climate}</div>
                    </div>
                  )}
                  {selected.bestTimeToVisit && (
                    <div className="dest-detail-item">
                      <div className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} className="text-muted" /> Best Time to Visit
                      </div>
                      <div>{selected.bestTimeToVisit}</div>
                    </div>
                  )}
                </div>
                {selected.popularAttractions && (
                  <div style={{ marginTop: '1rem' }}>
                    <div className="info-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Sparkles size={14} className="text-muted" /> Popular Attractions
                    </div>
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
                    <span className="dest-country" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Globe size={13} className="text-muted" />
                      <span>{dest.country}</span>
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleToggleFavorite(dest.id, e)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Bookmark Favorite"
                  >
                    <Heart size={18} fill={favorites.has(dest.id) ? '#ef4444' : 'none'} color={favorites.has(dest.id) ? '#ef4444' : '#9ca3af'} />
                  </button>
                </div>

                <p className="dest-desc">{dest.description}</p>

                <div className="dest-meta">
                  {dest.climate && (
                    <span className="dest-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Thermometer size={13} className="text-muted" />
                      <span>{dest.climate}</span>
                    </span>
                  )}
                  {dest.bestTimeToVisit && (
                    <span className="dest-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={13} className="text-muted" />
                      <span>{dest.bestTimeToVisit}</span>
                    </span>
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

export default Destinations;
