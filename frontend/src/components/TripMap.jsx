import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, ExternalLink } from 'lucide-react';

export const TripMap = ({ query = "Ooty, Tamil Nadu", height = "300px" }) => {
  const [mapUrl, setMapUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMapUrl();
  }, [query]);

  const fetchMapUrl = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/maps/embed-url?query=${encodeURIComponent(query)}`);
      setMapUrl(res.data.openMapsEmbedUrl);
    } catch (e) {
      setMapUrl(`https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: 16, border: '1px solid var(--border-color)' }}>
      <div style={{ padding: '12px 18px', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 700 }}>
          <MapPin size={18} color="var(--primary-accent)" />
          <span>Google Maps Location: {query}</span>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--primary-accent)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontWeight: 600 }}
        >
          Open in Google Maps <ExternalLink size={14} />
        </a>
      </div>

      {loading ? (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Loading Google Maps...
        </div>
      ) : (
        <iframe
          title={`Google Map - ${query}`}
          width="100%"
          height={height}
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapUrl}
        ></iframe>
      )}
    </div>
  );
};
