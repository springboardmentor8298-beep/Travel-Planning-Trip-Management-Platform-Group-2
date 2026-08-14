import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Navigation, Compass } from 'lucide-react';

// Fix leaflet default marker icons in webpack/react bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Fallback coordinates for common cities
const KNOWN_COORDS = {
  'hyderabad': [17.3850, 78.4867],
  'delhi': [28.6139, 77.2090],
  'mumbai': [19.0760, 72.8777],
  'bangalore': [12.9716, 77.5946],
  'goa': [15.2993, 74.1240],
  'chennai': [13.0827, 80.2707],
  'kolkata': [22.5726, 88.3639],
  'jaipur': [26.9124, 75.7873],
  'paris': [48.8566, 2.3522],
  'tokyo': [35.6762, 139.6503],
  'new york': [40.7128, -74.0060],
  'london': [51.5074, -0.1278],
  'dubai': [25.2048, 55.2708],
  'singapore': [1.3521, 103.8198],
  'sydney': [-33.8688, 151.2093],
  'rome': [41.9028, 12.4964],
  'bali': [-8.4095, 115.1889],
  'bangkok': [13.7563, 100.5018],
};

// Component to dynamically re-center map when coordinates change
function ChangeView({ center, zoom = 12 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

const TripMap = ({ destination = 'Hyderabad', destinationName, itineraries = [] }) => {
  const destParam = destinationName || destination || 'Hyderabad';
  const [coords, setCoords] = useState([17.3850, 78.4867]);
  const [resolvedName, setResolvedName] = useState(destParam);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [mapZoom, setMapZoom] = useState(12);

  // Dynamic Geocoding for destination
  const geocodeLocation = useCallback(async (locationStr) => {
    if (!locationStr) return;
    const clean = locationStr.split(',')[0].trim();
    try {
      setLoading(true);
      // 1. Try Open-Meteo Geocoding
      const res = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(clean)}&count=1&language=en&format=json`
      );
      if (res.data?.results && res.data.results.length > 0) {
        const first = res.data.results[0];
        const newCoords = [first.latitude, first.longitude];
        setCoords(newCoords);
        setResolvedName(`${first.name}${first.country ? ', ' + first.country : ''}`);
        setMapZoom(12);
        return;
      }
    } catch (e) {
      console.warn('Geocoding search failed, falling back:', e);
    }

    // 2. Fallback to dictionary
    const lower = clean.toLowerCase();
    for (const [city, c] of Object.entries(KNOWN_COORDS)) {
      if (lower.includes(city) || city.includes(lower)) {
        setCoords(c);
        setResolvedName(locationStr);
        setMapZoom(12);
        return;
      }
    }

    // 3. Fallback default
    setCoords([17.3850, 78.4867]);
    setResolvedName(locationStr);
  }, []);

  useEffect(() => {
    geocodeLocation(destParam).finally(() => setLoading(false));
  }, [destParam, geocodeLocation]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=1&language=en&format=json`
      );
      if (res.data?.results && res.data.results.length > 0) {
        const first = res.data.results[0];
        setCoords([first.latitude, first.longitude]);
        setResolvedName(`${first.name}${first.country ? ', ' + first.country : ''}`);
        setMapZoom(13);
        setSearchQuery('');
      } else {
        alert(`Location "${searchQuery}" not found. Try another city or landmark name.`);
      }
    } catch (err) {
      console.error('Search location error:', err);
    } finally {
      setSearching(false);
    }
  };

  // Build markers
  const markers = [
    {
      title: `${resolvedName} (Base)`,
      desc: 'Main Trip Destination',
      lat: coords[0],
      lng: coords[1],
      type: 'DESTINATION'
    }
  ];

  if (itineraries && itineraries.length > 0) {
    itineraries.forEach((day, dIdx) => {
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach((act, aIdx) => {
          // Controlled slight offset around destination coords for plotted activities
          const offsetLat = (Math.sin(dIdx * 3 + aIdx) * 0.025);
          const offsetLng = (Math.cos(dIdx * 2 + aIdx) * 0.035);
          markers.push({
            title: act.activityName || act.title || `Day ${day.dayNumber} Activity`,
            desc: act.location ? `${act.location} • ${act.activityType || 'Sightseeing'}` : (act.activityType || 'Activity'),
            cost: act.cost ? `₹${act.cost}` : null,
            time: act.startTime ? `${act.startTime} - ${act.endTime || ''}` : null,
            lat: coords[0] + offsetLat,
            lng: coords[1] + offsetLng,
            type: 'ACTIVITY'
          });
        });
      }
    });
  }

  return (
    <div className="section-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Map Control Header */}
      <div style={{
        padding: '1rem 1.25rem',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '36px', height: '36px',
            borderRadius: '10px',
            background: 'var(--accent-dim)',
            color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Compass size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Interactive Travel Map</span>
              <span className="badge badge-ongoing" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                Live GPS
              </span>
            </h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
              <MapPin size={13} style={{ color: 'var(--accent)' }} />
              <span>{resolvedName} • {markers.length} points plotted</span>
            </div>
          </div>
        </div>

        {/* Search location bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Jump to city/place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                padding: '0.4rem 0.6rem 0.4rem 2rem',
                fontSize: '0.8rem',
                width: '180px',
                borderRadius: '9999px',
                height: '34px'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="btn btn-primary btn-auto"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', height: '34px', borderRadius: '9999px' }}
          >
            {searching ? 'Locating...' : 'Go'}
          </button>
          <button
            type="button"
            onClick={() => geocodeLocation(destParam)}
            className="btn btn-outline btn-auto"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', height: '34px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            title="Reset to Trip Destination"
          >
            <Navigation size={13} />
            <span>Reset</span>
          </button>
        </form>
      </div>

      {/* Map Body */}
      <div style={{ height: '420px', width: '100%', position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-card)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            <div style={{
              width: '20px', height: '20px',
              border: '2px solid var(--accent)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span>Loading map coordinates for {resolvedName}...</span>
          </div>
        )}

        <MapContainer
          center={coords}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <ChangeView center={coords} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {markers.map((m, idx) => (
            <Marker key={idx} position={[m.lat, m.lng]}>
              <Popup>
                <div style={{ padding: '0.35rem', minWidth: '180px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    background: m.type === 'DESTINATION' ? '#dbeafe' : '#dcfce7',
                    color: m.type === 'DESTINATION' ? '#1e40af' : '#166534',
                    display: 'inline-block',
                    marginBottom: '0.35rem'
                  }}>
                    {m.type}
                  </span>
                  <h5 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                    {m.title}
                  </h5>
                  <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 0.35rem 0' }}>
                    {m.desc}
                  </p>
                  {m.time && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>⏰ {m.time}</div>}
                  {m.cost && <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginTop: '0.2rem' }}>💰 {m.cost}</div>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default TripMap;
