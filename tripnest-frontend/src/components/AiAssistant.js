import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Send,
  X,
  RefreshCw,
  Compass,
  CloudSun,
  DollarSign,
  Utensils,
  ListTodo
} from 'lucide-react';
import { queryAiGuide } from '../services/aiGuide.service';
import { getTrips, getTripById } from '../services/trip.service';
import { useAuth } from '../context/AuthContext';

export default function AiAssistant() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `👋 **Hello! I'm your AI Tourist Guide & Trip Assistant.**\n\nAsk me anything about **weather predictions**, **budget analysis**, **top tourist attractions**, **local food**, or your **upcoming trips**!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['🌤️ Live Weather', '🏛️ Top Places to Visit', '🍲 Famous Local Food', '💰 Budget Analysis', '📋 Show My Trips']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);
  const [allTrips, setAllTrips] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Determine if on a specific trip detail page
  const tripMatch = location.pathname.match(/\/trips\/(\d+)/);
  const currentTripId = tripMatch ? tripMatch[1] : null;

  // Load context trips
  const loadContextData = useCallback(async () => {
    if (!currentUser) return;
    try {
      if (currentTripId) {
        const res = await getTripById(currentTripId);
        setActiveTrip(res.data);
      } else {
        setActiveTrip(null);
      }
      const tripsRes = await getTrips();
      setAllTrips(tripsRes.data || []);
    } catch (err) {
      console.warn('AI Assistant context fetch error:', err);
    }
  }, [currentTripId, currentUser]);

  useEffect(() => {
    loadContextData();
  }, [loadContextData]);

  // Update initial greeting when active trip changes
  useEffect(() => {
    if (activeTrip) {
      setMessages((prev) => {
        // If already has trip welcome, don't duplicate
        if (prev.some(m => m.tripId === activeTrip.id)) return prev;
        return [
          ...prev,
          {
            id: Date.now(),
            sender: 'bot',
            tripId: activeTrip.id,
            text: `📍 **Active Trip Context: ${activeTrip.title} (${activeTrip.destination})**\n\nI have loaded your trip details. You can ask for live weather predictions for **${activeTrip.destination}**, budget breakdown for **₹${Number(activeTrip.budget || 0).toLocaleString()}**, or top tourist spots!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: [
              `🌤️ Weather in ${activeTrip.destination}`,
              `🏛️ Top sights in ${activeTrip.destination}`,
              `🍲 Famous food in ${activeTrip.destination}`,
              `💰 Budget analysis`,
              `🧳 Packing checklist`
            ]
          }
        ];
      });
    }
  }, [activeTrip]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (customPrompt) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await queryAiGuide({
        prompt: textToSend,
        activeTrip: activeTrip,
        allTrips: allTrips
      });

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: response.suggestions || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: `⚠️ *Sorry, I encountered an issue analyzing your query. Please try again!*`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: `✨ **Chat history cleared.** How can I assist your travels today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['🌤️ Live Weather', '🏛️ Top Sights', '🍲 Famous Food', '💰 Budget Analysis', '📋 Show My Trips']
      }
    ]);
  };

  // Format markdown helper (bold, lists, code)
  const renderFormattedText = (text = '') => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      // Bold replace
      const parts = content.split(/(\*\*.*?\*\*|\*.*?\*)/g);

      return (
        <div key={idx} style={{ minHeight: line.trim() ? 'auto' : '0.4rem', marginBottom: '0.2rem' }}>
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={pIdx} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
            }
            if (p.startsWith('*') && p.endsWith('*')) {
              return <em key={pIdx} style={{ opacity: 0.85 }}>{p.slice(1, -1)}</em>;
            }
            return <span key={pIdx}>{p}</span>;
          })}
        </div>
      );
    });
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Floating AI Tourist Guide Window */}
      {isOpen && (
        <div
          id="ai-tourist-guide-widget"
          style={{
            position: 'fixed',
            bottom: '5.25rem',
            right: '2rem',
            width: '410px',
            maxWidth: 'calc(100vw - 2.5rem)',
            height: '560px',
            maxHeight: 'calc(100vh - 7rem)',
            zIndex: 9999,
            boxShadow: 'var(--shadow-lg), 0 20px 50px rgba(0, 0, 0, 0.35)',
            borderRadius: '24px',
            overflow: 'hidden',
            animation: 'fadeUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* AI Header */}
          <div style={{
            padding: '0.9rem 1.2rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%), var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                flexShrink: 0,
              }}>
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>AI Tourist Guide</span>
                  <span style={{ fontSize: '0.65rem', background: 'var(--accent-dim)', color: 'var(--accent)', padding: '0.1rem 0.45rem', borderRadius: '999px', fontWeight: 700, border: '1px solid var(--border-accent)' }}>
                    LIVE
                  </span>
                </h4>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  <span>{activeTrip ? `Trip: ${activeTrip.destination}` : 'Ready to guide your trips'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <button
                onClick={handleClearChat}
                className="btn btn-ghost"
                style={{ padding: '0.35rem', borderRadius: '8px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                title="Clear Chat History"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost"
                style={{ padding: '0.35rem', borderRadius: '8px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                title="Minimize Guide"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Context Action Bar */}
          <div style={{
            padding: '0.4rem 0.75rem',
            background: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            gap: '0.35rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}>
            <button
              onClick={() => handleSend(`Weather predictions in ${activeTrip?.destination || 'Hyderabad'}`)}
              style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
            >
              <CloudSun size={12} style={{ color: '#0284c7' }} /> Weather
            </button>
            <button
              onClick={() => handleSend(`Top sights and places to visit in ${activeTrip?.destination || 'Hyderabad'}`)}
              style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
            >
              <Compass size={12} style={{ color: '#10b981' }} /> Sights
            </button>
            <button
              onClick={() => handleSend(`Famous food and dining in ${activeTrip?.destination || 'Hyderabad'}`)}
              style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
            >
              <Utensils size={12} style={{ color: '#f59e0b' }} /> Food
            </button>
            <button
              onClick={() => handleSend(activeTrip ? 'Analyze my trip budget' : 'Trip budget tips')}
              style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
            >
              <DollarSign size={12} style={{ color: '#10b981' }} /> Budget
            </button>
            <button
              onClick={() => handleSend('Show my trips')}
              style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
            >
              <ListTodo size={12} style={{ color: '#8b5cf6' }} /> My Trips
            </button>
          </div>

          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            background: 'var(--bg-base)',
          }}>
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: isUser ? '85%' : '92%',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.45rem',
                    flexDirection: isUser ? 'row-reverse' : 'row'
                  }}>
                    {!isUser && (
                      <div style={{
                        width: '26px', height: '26px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                        color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '0.7rem',
                        marginTop: '0.2rem'
                      }}>
                        🤖
                      </div>
                    )}

                    <div style={{
                      padding: '0.75rem 0.95rem',
                      borderRadius: '16px',
                      borderBottomRightRadius: isUser ? '4px' : '16px',
                      borderBottomLeftRadius: isUser ? '16px' : '4px',
                      background: isUser
                        ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                        : 'var(--bg-elevated)',
                      color: isUser ? '#ffffff' : 'var(--text-primary)',
                      border: isUser ? 'none' : '1px solid var(--border)',
                      boxShadow: isUser ? '0 3px 10px rgba(16, 185, 129, 0.25)' : '0 2px 6px rgba(0, 0, 0, 0.05)',
                      fontSize: '0.84rem',
                      lineHeight: 1.55,
                      wordBreak: 'break-word',
                    }}>
                      {renderFormattedText(m.text)}

                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        fontSize: '0.62rem',
                        marginTop: '0.35rem',
                        opacity: isUser ? 0.8 : 0.6
                      }}>
                        {m.time}
                      </div>
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.3rem',
                      marginTop: '0.45rem',
                      paddingLeft: isUser ? 0 : '2rem'
                    }}>
                      {m.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          style={{
                            padding: '0.2rem 0.6rem',
                            fontSize: '0.7rem',
                            borderRadius: '9999px',
                            border: '1px solid var(--border-accent)',
                            background: 'var(--accent-dim)',
                            color: 'var(--accent)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            fontWeight: 600
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem'
                }}>
                  🤖
                </div>
                <div style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: '16px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <Sparkles size={14} className="animate-spin" style={{ color: 'var(--accent)' }} />
                  <span>Tourist Guide is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{
              padding: '0.7rem 0.9rem',
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about weather, places, food, budget..."
              className="form-input"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.6rem 0.9rem',
                fontSize: '0.84rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-base)',
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary btn-auto"
              style={{
                borderRadius: '9999px',
                padding: '0.6rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                flexShrink: 0,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              }}
            >
              <Send size={14} />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}

      {/* Floating AI Agent Launcher Button - Placed at bottom-right of every screen */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="floating-ai-guide-agent-btn"
        style={{
          position: 'fixed',
          bottom: '1.75rem',
          right: '2rem',
          height: '48px',
          padding: isOpen ? '0 1rem' : '0 1.25rem',
          borderRadius: '9999px',
          background: isOpen
            ? 'var(--bg-elevated)'
            : 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 700,
          fontSize: '0.875rem',
          cursor: 'pointer',
          zIndex: 9998,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
        title={isOpen ? 'Close AI Tourist Guide' : 'Open AI Tourist Guide & Trip Assistant'}
        aria-label="Toggle AI Tourist Guide"
      >
        {isOpen ? (
          <>
            <X size={17} />
            <span>Close Guide</span>
          </>
        ) : (
          <>
            <Sparkles size={17} />
            <span>AI Guide</span>
          </>
        )}
      </button>
    </>
  );
}
