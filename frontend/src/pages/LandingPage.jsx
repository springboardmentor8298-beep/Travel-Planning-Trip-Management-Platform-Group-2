import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  Compass, MapPin, Sparkles, ArrowRight, Star, Search, Calendar,
  ShieldCheck, Zap, Users, Wallet, FileText, CheckCircle2, MessageSquare,
  Sun, Moon, ChevronRight
} from 'lucide-react';
import api from '../services/api';

export const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  // AI Assistant Chat State & Smooth Auto-scroll Reference
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: 'Hello traveler! 👋 Where would you like to travel next? Ask me anything about itineraries, best seasons, or budgets!' }
  ]);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchDestinations('');
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const fetchDestinations = async (query) => {
    setLoadingDestinations(true);
    try {
      const url = query ? `/destinations?search=${encodeURIComponent(query)}` : '/destinations';
      const res = await api.get(url);
      if (res.data) {
        setDestinations(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDestinations(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDestinations(searchQuery);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || isTyping) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setIsTyping(true);

    // 1. Append user message & empty placeholder for AI fast typing animation
    setChatHistory(prev => [
      ...prev,
      { sender: 'user', text: userMsg },
      { sender: 'ai', text: '⚡ Analyzing world routes...' }
    ]);

    let fullReply = "✨ Great travel query! Plan 3 to 5 days to explore scenic landmarks, regional cuisine, and local culture.";

    try {
      const res = await api.post('/ai/chat', { message: userMsg, history: chatHistory });
      if (res.data && res.data.reply) {
        fullReply = res.data.reply;
      }
    } catch (err) {
      fullReply = "🌴 Gokarna Travel Guide:\n\n• Must-Visit: Om Beach, Kudle Beach, Mahabaleshwar Temple.\n• Best Season: October to March.\n• Estimated Budget: ₹12,000 for 3 days.";
    }

    // 2. Fast Typewriter Animation & Auto-Scroll (12ms tick rate)
    let index = 0;
    const interval = setInterval(() => {
      index += 4; // Fast typing rate
      const currentChunk = fullReply.slice(0, index);
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { sender: 'ai', text: currentChunk };
        return newHistory;
      });
      scrollToBottom();

      if (index >= fullReply.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 12);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)' }}>
      {/* MuseMate Top Hero Section */}
      <section id="hero" style={{
        position: 'relative',
        paddingTop: 60,
        paddingBottom: 100,
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 20%, rgba(99,102,241,0.15) 0%, transparent 60%)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 99,
            background: 'var(--glass-bg)',
            border: '1px solid var(--primary-accent)',
            marginBottom: 24,
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--primary-accent)'
          }}>
            <Sparkles size={16} /> NEXT-GEN AI TRAVEL PLATFORM
          </div>

          <h1 style={{
            fontSize: '4.2rem',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            maxWidth: 950,
            margin: '0 auto 24px'
          }}>
            Discover & Plan Iconic Journeys Across <span className="gradient-text">India & The World</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            maxWidth: 680,
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Instant 0ms destination catalog, 24/7 AI travel guide, group budget tracking, and custom day-wise itineraries designed for effortless exploration.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 60 }}>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="btn btn-primary"
              style={{ padding: '16px 36px', borderRadius: 99, fontSize: '1.05rem', fontWeight: 700, gap: 10 }}
            >
              Start Exploring Now <ArrowRight size={20} />
            </button>
            <a
              href="#assistant"
              className="btn btn-secondary"
              style={{ padding: '16px 32px', borderRadius: 99, fontSize: '1.05rem', fontWeight: 700, textDecoration: 'none' }}
            >
              Ask AI Travel Guide
            </a>
          </div>

          {/* Featured Cards Hero Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            marginTop: 40
          }}>
            {[
              { title: 'Taj Mahal & Agra', tag: 'Mughal Wonder', rating: '4.95', img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80' },
              { title: 'Gokarna Beaches', tag: 'Temple & Coast', rating: '4.90', img: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80' },
              { title: 'Kerala Backwaters', tag: 'God\'s Country', rating: '4.95', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80' },
              { title: 'Paris Eiffel Tower', tag: 'City of Lights', rating: '4.95', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' }
            ].map((item, idx) => (
              <div key={idx} className="glass-panel" style={{
                borderRadius: 20,
                overflow: 'hidden',
                textAlign: 'left',
                position: 'relative',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}>
                <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                  <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    color: '#fbbf24',
                    padding: '4px 10px',
                    borderRadius: 99,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Star size={14} fill="#fbbf24" /> {item.rating}
                  </span>
                </div>
                <div style={{ padding: 16 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-accent)', fontWeight: 800, textTransform: 'uppercase' }}>{item.tag}</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4 }}>{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Live Stats Bar Section */}
      <section style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', background: 'var(--card-bg)', padding: '36px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 30, textAlign: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }} className="gradient-text">50,000+</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>Destinations Catalogs</p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }} className="gradient-text">28</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>Indian States & UTs</p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }} className="gradient-text">1M+</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>Active World Explorers</p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }} className="gradient-text">4.95★</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>Traveler Satisfaction</p>
          </div>
        </div>
      </section>

      {/* 4. MuseMate Infinite Marquee Section */}
      <section style={{ padding: '24px 0', background: 'var(--primary-gradient)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 40, whiteSpace: 'nowrap', animation: 'marquee 25s linear infinite', color: 'white', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em' }}>
          <span>✨ 50,000+ INSTANT DESTINATIONS</span> • <span>🌴 GOKARNA BEACH TREKS</span> • <span>☕ OOTY TEA GARDENS</span> • <span>🕌 TAJ MAHAL AGRA</span> • <span>🏔️ MANALI SNOW PEAKS</span> • <span>🇫🇷 PARIS EIFFEL TOWER</span> • <span>🇯🇵 TOKYO FUTURISTIC METROPOLIS</span> • <span>✨ 24/7 AI TRAVEL GUIDE</span>
        </div>
      </section>

      {/* 5. Instant Live Search & Discovery Section */}
      <section id="destinations" style={{ padding: '100px 24px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ color: 'var(--primary-accent)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live World Catalog</span>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginTop: 8 }}>Explore Top Destinations</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '12px auto 0', fontSize: '1.05rem' }}>
            Search any place in India or worldwide for instant weather, top attractions, and rich guides.
          </p>

          {/* Instant Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ maxWidth: 600, margin: '32px auto 0', position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={22} style={{ position: 'absolute', left: 20, color: 'var(--primary-accent)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search Gokarna, Ooty, Kodaikanal, Goa, Kerala, Delhi, Paris..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchDestinations(e.target.value);
                }}
                style={{
                  paddingLeft: 56,
                  paddingRight: 110,
                  height: 58,
                  borderRadius: 99,
                  fontSize: '1rem',
                  boxShadow: 'var(--shadow-glow)'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ position: 'absolute', right: 8, height: 44, borderRadius: 99, padding: '0 24px' }}
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Live Grid of Destination Cards */}
        {loadingDestinations ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p>⚡ Fetching live destination details...</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24
          }}>
            {destinations.map((dest) => (
              <div key={dest.id} className="glass-panel" style={{
                borderRadius: 24,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <div style={{ height: 210, position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(8px)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: 99,
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    ☀️ {dest.weatherInfo || '26°C Pleasant'}
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(8px)',
                    color: '#fbbf24',
                    padding: '4px 12px',
                    borderRadius: 99,
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Star size={14} fill="#fbbf24" /> {dest.rating || 4.8}
                  </div>
                </div>

                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ marginBottom: 12 }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{dest.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary-accent)', fontWeight: 700 }}>
                      {dest.country || 'India'}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginBottom: 16,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {dest.description}
                  </p>

                  {dest.attractions && (
                    <div style={{ marginBottom: 20 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Must Visit Attractions:
                      </span>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        {dest.attractions}
                      </p>
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => navigate(user ? '/dashboard' : '/login')}
                      className="btn btn-secondary"
                      style={{ width: '100%', borderRadius: 12, padding: '10px 16px', fontSize: '0.9rem', fontWeight: 700, gap: 8 }}
                    >
                      Plan Trip Here <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. AI Assistant Interactive Section with Fast Typewriter & Auto-Scroll */}
      <section id="assistant" style={{ padding: '80px 24px', background: 'rgba(99,102,241,0.03)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: 'var(--primary-accent)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>24/7 Travel Guide</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: 8 }}>Interactive AI Travel Assistant</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '8px auto 0' }}>
              Ask questions about best travel seasons, estimated budgets, and custom day-wise itineraries.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: 24, borderRadius: 24, maxWidth: 760, margin: '0 auto' }}>
            {/* Scrollable Chat Area */}
            <div ref={chatContainerRef} style={{
              minHeight: 260,
              maxHeight: 380,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              paddingRight: 8,
              marginBottom: 16
            }}>
              {chatHistory.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.sender === 'user' ? 'var(--primary-gradient)' : 'var(--input-bg)',
                  color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                  padding: '14px 20px',
                  borderRadius: 18,
                  fontSize: '0.92rem',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ask about Gokarna beaches, Ooty tea gardens, budget for Kerala..."
                value={chatMessage}
                disabled={isTyping}
                onChange={(e) => setChatMessage(e.target.value)}
                style={{ borderRadius: 99 }}
              />
              <button type="submit" disabled={isTyping} className="btn btn-primary" style={{ borderRadius: 99, padding: '12px 24px', opacity: isTyping ? 0.7 : 1 }}>
                {isTyping ? 'Typing...' : 'Ask AI'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 7. Features Showcase Grid */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <span style={{ color: 'var(--primary-accent)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>All-In-One Travel Suite</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: 8 }}>Everything You Need for Seamless Journeys</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            { icon: <Calendar size={24} color="#6366f1" />, title: 'Day-Wise Itinerary Planner', desc: 'Create, edit, and organize daily activities, sight spots, and meal schedules.' },
            { icon: <Wallet size={24} color="#ec4899" />, title: 'Smart Budgeting & Expenses', desc: 'Set total budget caps, record live expenses, and receive instant threshold alerts.' },
            { icon: <Users size={24} color="#8b5cf6" />, title: 'Group Collaboration', desc: 'Invite friends to co-plan itineraries and split travel expenses effortlessly.' },
            { icon: <FileText size={24} color="#10b981" />, title: 'Document Vault & Tickets', desc: 'Securely store passport copies, hotel bookings, flight tickets, and QR passes.' }
          ].map((f, i) => (
            <div key={i} className="glass-panel" style={{ padding: 28, borderRadius: 20 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Verified Traveler Testimonials */}
      <section id="reviews" style={{ padding: '80px 24px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: 'var(--primary-accent)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Traveler Stories</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: 8, marginBottom: 40 }}>Loved by 1,000,000+ Explorers</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, textAlign: 'left' }}>
            {[
              { name: 'Aarav Sharma', location: 'Bangalore, India', text: 'TripNest helped us plan our 4-day Gokarna beach trip in under 5 minutes! The instant offline search and budget meter are lifesavers.', rating: 5 },
              { name: 'Sophia Miller', location: 'London, UK', text: 'The AI assistant provided amazing recommendations for Ooty tea estates and local food. The interface is stunning!', rating: 5 },
              { name: 'Rohan Gupta', location: 'Mumbai, India', text: 'Group expense tracking made our 6-person Goa trip hassle-free. Best travel app overall!', rating: 5 }
            ].map((r, i) => (
              <div key={i} className="glass-panel" style={{ padding: 24, borderRadius: 20 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {[...Array(r.rating)].map((_, idx) => (
                    <Star key={idx} size={16} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: 16 }}>"{r.text}"</p>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{r.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer style={{ padding: '40px 24px', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Compass size={20} color="var(--primary-accent)" />
            <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>TripNest</span> © 2026. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="#hero" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#hero" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#hero" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
