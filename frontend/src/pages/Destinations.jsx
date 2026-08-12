import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sun, Star, Heart, Compass, BookOpen, Wind, Calendar, Info, ArrowRight, X } from 'lucide-react';
import api from '../services/api';

const DEFAULT_DESTINATIONS = [
  {
    id: 'dest_in_1',
    name: 'Taj Mahal & Agra',
    country: 'India',
    tagline: 'Land of Cultural Heritage & Wonders',
    weatherInfo: '30°C Sunny',
    humidity: '45%',
    bestTime: 'October to March',
    rating: 4.9,
    attractions: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh'],
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
    description: 'Explore one of the Seven Wonders of the World and rich Mughal architectural history.',
    travelGuide: 'Visit early in the morning for sunrise views over the Taj Mahal. Auto-rickshaws and battery buses are widely available.'
  },
  {
    id: 'dest_in_2',
    name: 'Goa',
    country: 'India',
    tagline: 'Pearl of the Orient & Beach Haven',
    weatherInfo: '29°C Tropical',
    humidity: '75%',
    bestTime: 'November to February',
    rating: 4.8,
    attractions: ['Baga Beach', 'Dudhsagar Falls', 'Fort Aguada', 'Anjuna Flea Market'],
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    description: 'Sun-kissed golden beaches, vibrant nightlife, and historic Portuguese architecture.',
    travelGuide: 'Rent a scooter to easily explore North and South Goa. Try local Goan fish curry and feni at beach shacks.'
  },
  {
    id: 'dest_in_3',
    name: 'Kerala',
    country: 'India',
    tagline: "God's Own Country",
    weatherInfo: '27°C Pleasant',
    humidity: '65%',
    bestTime: 'September to March',
    rating: 4.9,
    attractions: ['Alleppey Backwaters', 'Munnar Tea Gardens', 'Wayanad Wildlife', 'Kovalam Beach'],
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80',
    description: 'Serene backwater houseboats, lush emerald tea plantations, and pristine beaches.',
    travelGuide: 'Book an overnight houseboat in Alleppey and experience traditional Ayurvedic massage treatments.'
  },
  {
    id: 'dest_in_4',
    name: 'Jaipur (Pink City)',
    country: 'India',
    tagline: 'Royal Forts & Palaces',
    weatherInfo: '31°C Sunny',
    humidity: '40%',
    bestTime: 'October to March',
    rating: 4.7,
    attractions: ['Hawa Mahal', 'Amber Fort', 'City Palace', 'Jantar Mantar'],
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80',
    description: 'Immerse yourself in royal Rajasthani heritage, magnificent forts, and colorful bazaars.',
    travelGuide: 'Take an elephant or jeep ride up to Amber Fort and shop for authentic block-printed textiles at Johari Bazaar.'
  },
  {
    id: 'dest_1',
    name: 'Paris',
    country: 'France',
    tagline: 'The City of Light & Culinary Delights',
    weatherInfo: '22°C Sunny',
    humidity: '50%',
    bestTime: 'June to August & September to October',
    rating: 4.9,
    attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Arc de Triomphe'],
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    description: 'Experience romantic boulevards, world-class art collections, and exquisite dining along the Seine.',
    travelGuide: 'Use the Paris Metro with a Navigo Easy pass. Book Louvre tickets online in advance to skip long entrance queues.'
  },
  {
    id: 'dest_2',
    name: 'Tokyo',
    country: 'Japan',
    tagline: 'Futuristic Innovation Meets Ancient Heritage',
    weatherInfo: '26°C Clear',
    humidity: '55%',
    bestTime: 'March to May & September to November',
    rating: 4.95,
    attractions: ['Shibuya Crossing', 'Senso-ji Temple', 'Mount Fuji Day Tour', 'Akihabara'],
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
    description: 'A vibrant metropolis offering ultramodern skyscrapers, serene temples, and unmatched street food.',
    travelGuide: 'Purchase a Suica or Pasmo IC card for public transit and 7-Eleven vending machines.'
  },
  {
    id: 'dest_3',
    name: 'Rome',
    country: 'Italy',
    tagline: 'The Eternal City of Historic Marvels',
    weatherInfo: '28°C Pleasant',
    humidity: '52%',
    bestTime: 'April to June & September to October',
    rating: 4.85,
    attractions: ['Colosseum', 'Vatican City', 'Trevi Fountain', 'Pantheon'],
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    description: 'Immerse yourself in thousands of years of history, iconic architecture, and authentic Italian gelato.',
    travelGuide: 'Always toss a coin over your left shoulder into Trevi Fountain and wear covered clothes when visiting Vatican museums.'
  },
  {
    id: 'dest_4',
    name: 'Bali',
    country: 'Indonesia',
    tagline: 'Tropical Beaches, Lush Terraces & Spiritual Peace',
    weatherInfo: '30°C Tropical',
    humidity: '80%',
    bestTime: 'April to October',
    rating: 4.88,
    attractions: ['Ubud Monkey Forest', 'Uluwatu Temple', 'Tegallalang Rice Terraces', 'Seminyak Beach'],
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    description: 'Relax on sun-kissed beaches, explore volcanic highlands, and witness breathtaking sunset ceremonies.',
    travelGuide: 'Hire a local driver for full-day island tours and stay hydrated in tropical weather.'
  }
];

export const Destinations = () => {
  const [query, setQuery] = useState('');
  const [destinations, setDestinations] = useState(DEFAULT_DESTINATIONS);
  const [favorites, setFavorites] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDestinations(query);
  }, [query]);

  const fetchDestinations = async (searchQuery) => {
    try {
      setLoading(true);
      const url = searchQuery ? `/destinations?search=${encodeURIComponent(searchQuery)}` : '/destinations';
      const res = await api.get(url);
      if (res.data && res.data.length > 0) {
        setDestinations(res.data);
      } else {
        const filtered = DEFAULT_DESTINATIONS.filter(d =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.country.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setDestinations(filtered);
      }
    } catch (e) {
      const filtered = DEFAULT_DESTINATIONS.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDestinations(filtered);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
          Discover Top <span className="gradient-text">Destinations</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: '1rem' }}>
          Explore world-famous locations, check live weather, and discover top attractions.
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: 540, margin: '24px auto 0', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} size={20} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 48, borderRadius: 30, height: 48 }}
            placeholder="Search India, Goa, Kerala, Paris, Tokyo, Bali..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Searching worldwide locations...</div>
      ) : destinations.length === 0 ? (
        <div className="glass-panel" style={{ padding: 60, textAlign: 'center' }}>
          <Compass size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <h3>No destinations found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Try searching for India, Goa, Paris, Tokyo, or Rome.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 28
        }}>
          {destinations.map((dest) => {
            const isFav = favorites.includes(dest.id);
            const attractionList = Array.isArray(dest.attractions)
              ? dest.attractions
              : (dest.attractions || '').split(',').map(s => s.trim());

            return (
              <div key={dest.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                    <img
                      src={dest.imageUrl || dest.image}
                      alt={dest.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      onClick={() => toggleFavorite(dest.id)}
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(8px)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Heart size={18} color={isFav ? '#ef4444' : '#fff'} fill={isFav ? '#ef4444' : 'none'} />
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 14,
                      background: 'rgba(15,23,42,0.85)',
                      backdropFilter: 'blur(6px)',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Sun size={14} color="#f59e0b" /> {dest.weatherInfo || dest.weather || '28°C Pleasant'}
                    </div>
                  </div>

                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {dest.name}, <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{dest.country}</span>
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
                        <Star size={16} fill="#f59e0b" /> {dest.rating || 4.8}
                      </div>
                    </div>
                    <p style={{ color: 'var(--primary-accent)', fontWeight: 600, fontSize: '0.85rem', marginTop: 4 }}>{dest.tagline}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 10, lineHeight: 1.5 }}>{dest.description}</p>

                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.05em' }}>MUST-VISIT ATTRACTIONS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                        {attractionList.slice(0, 3).map((att, i) => (
                          <span key={i} style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', color: 'var(--text-main)' }}>
                            {att}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0 24px 24px' }}>
                  <button
                    onClick={() => setSelectedDest(dest)}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}
                  >
                    <BookOpen size={16} /> View Travel Guide & Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Destination Details & Travel Guide Modal */}
      {selectedDest && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: 640, maxHeight: '85vh', overflowY: 'auto', padding: 0 }}>
            <div style={{ position: 'relative', height: 240 }}>
              <img src={selectedDest.imageUrl || selectedDest.image} alt={selectedDest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => setSelectedDest(null)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
              <div style={{ position: 'absolute', bottom: 16, left: 24, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sun size={16} color="#f59e0b" /> {selectedDest.weatherInfo || '28°C Pleasant'}
              </div>
            </div>

            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{selectedDest.name}, {selectedDest.country}</h2>
                  <p style={{ color: 'var(--primary-accent)', fontWeight: 600, marginTop: 4 }}>{selectedDest.tagline}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>
                  <Star size={20} fill="#f59e0b" /> {selectedDest.rating || 4.9}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '20px 0', background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Calendar size={20} color="var(--primary-accent)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BEST TIME TO VISIT</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedDest.bestTime || 'October to March'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Wind size={20} color="var(--primary-accent)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HUMIDITY</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedDest.humidity || '55%'}</div>
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Overview</h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{selectedDest.description}</p>

              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 24, marginBottom: 12 }}>Top Attractions Listing</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(Array.isArray(selectedDest.attractions) ? selectedDest.attractions : (selectedDest.attractions || '').split(',')).map((att, idx) => (
                  <div key={idx} style={{ padding: '10px 14px', background: 'var(--bg-card-hover)', borderRadius: 10, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600 }}>
                    <MapPin size={16} color="var(--primary-accent)" /> {typeof att === 'string' ? att.trim() : att}
                  </div>
                ))}
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 24, marginBottom: 8 }}>Traveler Guide & Expert Advice</h4>
              <div style={{ background: 'rgba(99,102,241,0.1)', borderLeft: '4px solid var(--primary-accent)', padding: 16, borderRadius: '0 10px 10px 0', fontSize: '0.9rem', lineHeight: 1.5, color: '#e5e7eb' }}>
                <Info size={18} style={{ float: 'left', marginRight: 10, marginTop: 2 }} color="var(--primary-accent)" />
                {selectedDest.travelGuide || 'Plan your visit during peak season to experience local culture and sightseeing tours.'}
              </div>

              <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedDest(null)} className="btn btn-secondary">Close</button>
                <button
                  onClick={() => navigate(`/dashboard?destination=${encodeURIComponent(selectedDest.name)}&create=true`)}
                  className="btn btn-primary"
                >
                  Plan Trip to {selectedDest.name} <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
