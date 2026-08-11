import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import discussionService from '../services/discussion.service';
import groupService from '../services/group.service';
import { useAuth } from '../context/AuthContext';

const GroupChat = () => {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewDiscussionForm, setShowNewDiscussionForm] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    loadGroups();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadDiscussions(selectedGroup.id);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedDiscussion) {
      loadMessages(selectedDiscussion.id);
      // Poll for new messages every 4 seconds
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => loadMessages(selectedDiscussion.id), 4000);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedDiscussion]);

  // Auto-scroll to bottom when messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getUserGroups();
      setGroups(data);
      // Auto-select first group
      if (data.length > 0) {
        setSelectedGroup(data[0]);
      }
    } catch (err) {
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const loadDiscussions = async (groupId) => {
    try {
      const data = await discussionService.getGroupDiscussions(groupId);
      setDiscussions(data);
      // Auto-select first discussion
      if (data.length > 0) {
        setSelectedDiscussion(data[0]);
      } else {
        setSelectedDiscussion(null);
        setMessages([]);
      }
    } catch (err) {
      setError('Failed to load discussions');
    }
  };

  const loadMessages = async (discussionId) => {
    try {
      const data = await discussionService.getDiscussionMessages(discussionId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages');
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!newDiscussionTitle.trim()) return;
    try {
      await discussionService.createDiscussion(selectedGroup.id, newDiscussionTitle.trim());
      setShowNewDiscussionForm(false);
      setNewDiscussionTitle('');
      loadDiscussions(selectedGroup.id);
    } catch (err) {
      setError('Failed to create discussion');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedDiscussion) return;
    try {
      setSending(true);
      await discussionService.addMessage(selectedDiscussion.id, newMessage.trim());
      setNewMessage('');
      await loadMessages(selectedDiscussion.id);
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e);
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (window.confirm('Delete this discussion? All messages will be lost.')) {
      try {
        await discussionService.deleteDiscussion(discussionId);
        if (selectedDiscussion?.id === discussionId) {
          setSelectedDiscussion(null);
          setMessages([]);
        }
        loadDiscussions(selectedGroup.id);
      } catch (err) {
        setError('Failed to delete discussion');
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Delete this message?')) {
      try {
        await discussionService.deleteMessage(messageId);
        loadMessages(selectedDiscussion.id);
      } catch (err) {
        setError('Failed to delete message');
      }
    }
  };

  // Determine if a message was sent by the current user
  const isOwnMessage = (message) => {
    if (!currentUser) return false;
    const senderUsername = message.user?.username || message.sender?.username;
    return senderUsername === currentUser.username;
  };

  const getSenderName = (message) => {
    const u = message.user || message.sender;
    if (!u) return 'Unknown';
    const full = [u.firstName, u.lastName].filter(Boolean).join(' ');
    return full || u.username || 'Unknown';
  };

  const getSenderUsername = (message) => {
    return (message.user || message.sender)?.username || 'unknown';
  };

  const getInitial = (message) => {
    const name = getSenderName(message);
    return name[0]?.toUpperCase() || '?';
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  // Color hash from username for avatar
  const avatarColor = (username) => {
    const colors = [
      'linear-gradient(135deg, #7b5ea7, #5e4a8a)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #f9a826, #e07b00)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #ff4d6d, #c9184a)',
    ];
    let hash = 0;
    for (let i = 0; i < (username || '').length; i++) hash += username.charCodeAt(i);
    return colors[hash % colors.length];
  };

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content" style={{ padding: '0 1.5rem 1.5rem' }}>
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h1 className="page-title">Group Chat 💬</h1>
            <p className="page-subtitle">Real-time collaboration with your travel group</p>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '1rem',
          height: 'calc(100vh - 180px)',
          minHeight: 500,
        }}>

          {/* ── LEFT SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>

            {/* Groups Panel */}
            <div className="section-card" style={{ flex: '0 0 auto', maxHeight: '40%', overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                Your Groups
              </h3>
              {loading ? (
                <div className="loading-text" style={{ fontSize: '0.9rem' }}>Loading…</div>
              ) : groups.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                  No groups yet.<br />Accept a trip invitation to join a group!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: selectedGroup?.id === group.id ? 'rgba(123, 94, 167, 0.2)' : 'var(--color-bg-alt)',
                        border: selectedGroup?.id === group.id ? '1px solid rgba(123, 94, 167, 0.6)' : '1px solid transparent',
                        transition: 'all 0.15s',
                      }}
                      onClick={() => { setSelectedGroup(group); setError(''); }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{group.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discussions Panel */}
            {selectedGroup && (
              <div className="section-card" style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                    Channels
                  </h3>
                  <button
                    id="new-channel-btn"
                    className="btn btn-sm btn-primary btn-auto"
                    onClick={() => setShowNewDiscussionForm(!showNewDiscussionForm)}
                    title="New channel"
                    style={{ padding: '0.2rem 0.55rem', fontSize: '1rem', lineHeight: 1 }}
                  >
                    +
                  </button>
                </div>

                {showNewDiscussionForm && (
                  <form onSubmit={handleCreateDiscussion} style={{ marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Channel name…"
                      value={newDiscussionTitle}
                      onChange={(e) => setNewDiscussionTitle(e.target.value)}
                      required
                      autoFocus
                      style={{ marginBottom: '0.4rem', fontSize: '0.85rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button type="submit" className="btn btn-sm btn-primary btn-auto">Create</button>
                      <button type="button" className="btn btn-sm btn-outline btn-auto" onClick={() => setShowNewDiscussionForm(false)}>Cancel</button>
                    </div>
                  </form>
                )}

                {discussions.length === 0 ? (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '0.75rem 0' }}>
                    No channels yet. Create one!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {discussions.map((d) => (
                      <div
                        key={d.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: selectedDiscussion?.id === d.id ? 'rgba(123, 94, 167, 0.2)' : 'transparent',
                          border: selectedDiscussion?.id === d.id ? '1px solid rgba(123, 94, 167, 0.5)' : '1px solid transparent',
                          transition: 'all 0.1s',
                        }}
                        onClick={() => setSelectedDiscussion(d)}
                      >
                        <span style={{ fontSize: '0.88rem', fontWeight: selectedDiscussion?.id === d.id ? 600 : 400 }}>
                          # {d.title}
                        </span>
                        <button
                          className="btn btn-sm btn-danger btn-auto"
                          style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem', opacity: 0.7 }}
                          onClick={(e) => { e.stopPropagation(); handleDeleteDiscussion(d.id); }}
                          title="Delete channel"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── CHAT AREA ── */}
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            {selectedDiscussion ? (
              <>
                {/* Chat Header */}
                <div style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexShrink: 0,
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>
                      # {selectedDiscussion.title}
                    </h3>
                    <small style={{ color: 'var(--color-text-muted)' }}>
                      {selectedGroup?.name} · {selectedGroup?.memberCount} member{selectedGroup?.memberCount !== 1 ? 's' : ''}
                    </small>
                  </div>
                  <small style={{ color: 'var(--color-text-muted)' }}>
                    Created {formatFullDate(selectedDiscussion.createdAt)}
                  </small>
                </div>

                {/* Messages */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 'auto', paddingTop: '4rem' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💬</div>
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const own = isOwnMessage(msg);
                      return (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            flexDirection: own ? 'row-reverse' : 'row',
                            alignItems: 'flex-end',
                            gap: '0.6rem',
                          }}
                        >
                          {/* Avatar */}
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: avatarColor(getSenderUsername(msg)),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                            flexShrink: 0,
                          }}>
                            {getInitial(msg)}
                          </div>

                          {/* Bubble */}
                          <div style={{ maxWidth: '65%' }}>
                            {!own && (
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>
                                {getSenderName(msg)} · @{getSenderUsername(msg)}
                              </div>
                            )}
                            <div style={{
                              padding: '0.6rem 0.9rem',
                              borderRadius: own ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                              background: own
                                ? 'linear-gradient(135deg, #7b5ea7, #5e4a8a)'
                                : 'var(--color-bg-alt)',
                              color: own ? '#fff' : 'var(--color-text)',
                              border: own ? 'none' : '1px solid var(--color-border)',
                              wordBreak: 'break-word',
                            }}>
                              {msg.content}
                            </div>
                            <div style={{
                              fontSize: '0.7rem',
                              color: 'var(--color-text-muted)',
                              textAlign: own ? 'right' : 'left',
                              marginTop: '0.2rem',
                              display: 'flex',
                              justifyContent: own ? 'flex-end' : 'flex-start',
                              gap: '0.5rem',
                              alignItems: 'center',
                            }}>
                              <span>{formatTime(msg.createdAt)}</span>
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--color-text-muted)',
                                  padding: 0,
                                  fontSize: '0.7rem',
                                  opacity: 0.6,
                                }}
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Delete message"
                              >
                                🗑
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    gap: '0.6rem',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <input
                    id="chat-message-input"
                    type="text"
                    className="form-input"
                    placeholder={`Message #${selectedDiscussion.title}…`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ flex: 1 }}
                    disabled={sending}
                  />
                  <button
                    id="chat-send-btn"
                    type="submit"
                    className="btn btn-primary btn-auto"
                    disabled={sending || !newMessage.trim()}
                    style={{ flexShrink: 0 }}
                  >
                    {sending ? '…' : '➤ Send'}
                  </button>
                </form>
              </>
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: '100%', color: 'var(--color-text-muted)', textAlign: 'center',
                gap: '0.75rem', padding: '2rem',
              }}>
                <div style={{ fontSize: '4rem' }}>💬</div>
                {groups.length === 0 ? (
                  <>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No groups yet</p>
                    <p style={{ fontSize: '0.9rem' }}>Accept a trip invitation to be added to a travel group and start chatting!</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Select a channel to start chatting</p>
                    <p style={{ fontSize: '0.9rem' }}>Choose a group from the left, then select or create a channel.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
