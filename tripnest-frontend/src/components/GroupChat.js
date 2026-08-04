import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getMessages, sendMessage } from '../services/collaboration.service';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL = 5000;

export default function GroupChat({ tripId }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);

  const load = useCallback(() => {
    getMessages(tripId).then((msgs) => {
      setMessages((prev) => {
        // Only update if changed
        if (JSON.stringify(prev.map(m => m.id)) !== JSON.stringify(msgs.map(m => m.id))) {
          return msgs;
        }
        return prev;
      });
    });
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
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      await sendMessage(tripId, input.trim());
      setInput('');
      load();
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const date = formatDate(msg.sentAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="group-chat">
      <div className="chat-messages">
        {Object.entries(grouped).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              <div className="chat-date-divider"><span>{date}</span></div>
              {msgs.map((msg) => {
                const isMe = msg.senderUsername === currentUser?.username;
                return (
                  <div key={msg.id} className={`chat-bubble-wrap ${isMe ? 'chat-bubble-wrap--me' : ''}`}>
                    {!isMe && <div className="chat-avatar">{msg.senderUsername.charAt(0).toUpperCase()}</div>}
                    <div className={`chat-bubble ${isMe ? 'chat-bubble--me' : 'chat-bubble--them'}`}>
                      {!isMe && <div className="chat-sender">@{msg.senderUsername}</div>}
                      <div className="chat-text">{msg.message}</div>
                      <div className="chat-time">{formatTime(msg.sentAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
        />
        <button type="submit" className="btn btn-primary chat-send-btn" disabled={sending || !input.trim()}>
          {sending ? '⏳' : '➤ Send'}
        </button>
      </form>
    </div>
  );
}
