import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getMessages, sendMessage } from '../services/collaboration.service';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  MessageSquare,
  Sparkles,
  CheckCheck,
  RefreshCw,
  X
} from 'lucide-react';

const POLL_INTERVAL = 4000;

const QUICK_PROMPTS = [
  '📍 What is our next destination?',
  '💰 Please check and settle the expenses!',
  '🗓️ Reviewing today\'s itinerary.',
  '🚗 All packed and ready to leave!',
  '📸 Uploaded new trip documents!'
];

// Deterministic color palette for user avatars
const AVATAR_COLORS = [
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #3b82f6, #2563eb)',
  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #ec4899, #db2777)',
  'linear-gradient(135deg, #06b6d4, #0891b2)',
];

const getAvatarBg = (username = '') => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export default function GroupChat({ tripId, tripTitle = 'Trip Group', onClose, isDrawer = false }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const intervalRef = useRef(null);

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const msgs = await getMessages(tripId);
      setMessages((prev) => {
        if (JSON.stringify(prev.map(m => m.id)) !== JSON.stringify(msgs.map(m => m.id))) {
          return msgs;
        }
        return prev;
      });
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      if (manual) setRefreshing(false);
    }
  }, [tripId]);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    const textToSend = input.trim();
    setInput('');
    try {
      await sendMessage(tripId, textToSend);
      await load();
    } catch (err) {
      console.error('Failed to send message:', err);
      setInput(textToSend); // Restore on error
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Today';
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Group messages by human readable date
  const grouped = messages.reduce((acc, msg) => {
    const date = formatDate(msg.sentAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="section-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: isDrawer ? '100%' : '580px',
      padding: 0,
      borderRadius: isDrawer ? 0 : 'var(--radius-xl)',
      border: isDrawer ? 'none' : '1px solid var(--border)',
      background: 'var(--bg-surface)',
      overflow: 'hidden',
      boxShadow: isDrawer ? 'none' : 'var(--shadow-md)',
    }}>
      {/* Enhanced Chat Header */}
      <div style={{
        padding: '1rem 1.25rem',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px', height: '38px',
            borderRadius: '12px',
            background: 'var(--accent-dim)',
            color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border-accent)',
          }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.2,
            }}>
              {tripTitle}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginTop: '0.15rem'
            }}>
              <span style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'inline-block'
              }} />
              <span>Real-time Group Chat • {messages.length} messages</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="btn btn-ghost"
            style={{
              padding: '0.4rem',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Refresh Messages"
            aria-label="Refresh Messages"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{
                padding: '0.4rem',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Close Chat"
              aria-label="Close Chat"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: 'var(--bg-base)',
      }}>
        {Object.entries(grouped).length === 0 ? (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '320px',
          }}>
            <div style={{
              width: '56px', height: '56px',
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem',
            }}>
              💬
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              No messages yet
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Kickstart the trip discussion with your fellow travelers below!
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, msgs]) => (
            <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Date divider */}
              <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  padding: '0.2rem 0.75rem',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {date}
                </span>
              </div>

              {/* Message bubbles */}
              {msgs.map((msg) => {
                const isMe = msg.senderUsername === currentUser?.username;
                const avatarBg = getAvatarBg(msg.senderUsername);
                const senderName = msg.senderFullName || msg.senderUsername || 'Traveler';

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '0.5rem',
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '82%',
                    }}
                  >
                    {!isMe && (
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: avatarBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          flexShrink: 0,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                        title={`@${msg.senderUsername}`}
                      >
                        {(msg.senderUsername || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                    }}>
                      {!isMe && (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          marginBottom: '0.15rem',
                          paddingLeft: '0.35rem',
                        }}>
                          {senderName} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>@{msg.senderUsername}</span>
                        </span>
                      )}

                      <div
                        style={{
                          padding: '0.7rem 1rem',
                          borderRadius: '16px',
                          borderBottomRightRadius: isMe ? '4px' : '16px',
                          borderBottomLeftRadius: isMe ? '16px' : '4px',
                          background: isMe
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'var(--bg-elevated)',
                          color: isMe ? '#ffffff' : 'var(--text-primary)',
                          border: isMe ? 'none' : '1px solid var(--border)',
                          boxShadow: isMe
                            ? '0 3px 12px rgba(16, 185, 129, 0.25)'
                            : '0 2px 6px rgba(0, 0, 0, 0.05)',
                          wordBreak: 'break-word',
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                        }}
                      >
                        <div>{msg.message}</div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '0.25rem',
                          fontSize: '0.65rem',
                          marginTop: '0.25rem',
                          opacity: isMe ? 0.85 : 0.6,
                        }}>
                          <span>{formatTime(msg.sentAt)}</span>
                          {isMe && <CheckCheck size={12} />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div style={{
        padding: '0.5rem 1rem',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        overflowX: 'auto',
        display: 'flex',
        gap: '0.4rem',
        whiteSpace: 'nowrap',
      }}>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickPrompt(prompt)}
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.72rem',
              borderRadius: '9999px',
              border: '1px solid var(--border)',
              background: 'var(--bg-glass)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Sparkles size={11} />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Input Box */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '0.75rem 1rem',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message to your travel group... (Press Enter to send)"
          className="form-input"
          disabled={sending}
          style={{
            flex: 1,
            padding: '0.7rem 1rem',
            fontSize: '0.875rem',
            borderRadius: '9999px',
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-base)',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="btn btn-primary btn-auto"
          style={{
            borderRadius: '9999px',
            padding: '0.7rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {sending ? (
            <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <>
              <Send size={15} />
              <span>Send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
