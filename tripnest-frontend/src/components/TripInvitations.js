import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import invitationService from '../services/invitation.service';

const TripInvitations = () => {
  const { id } = useParams();
  const [invitations, setInvitations] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteeUsername, setInviteeUsername] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadInvitations();
    loadPendingInvitations();
  }, [id]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const loadInvitations = async () => {
    try {
      setLoading(true);
      if (id && id !== 'undefined') {
        const data = await invitationService.getTripInvitations(id);
        setInvitations(data);
      }
    } catch (err) {
      setError('Failed to load invitations. Make sure you are the trip owner.');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingInvitations = async () => {
    try {
      const data = await invitationService.getPendingInvitations();
      setPendingInvitations(data);
    } catch (err) {
      console.error('Failed to load pending invitations');
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!inviteeUsername.trim()) {
      setError('Please enter a username to invite.');
      return;
    }
    try {
      setSubmitting(true);
      await invitationService.sendInvitation(id, inviteeUsername.trim(), message);
      setShowInviteForm(false);
      setInviteeUsername('');
      setMessage('');
      setSuccess(`✅ Invitation sent to @${inviteeUsername.trim()}! They will receive a notification.`);
      loadInvitations();
    } catch (err) {
      const msg = err.response?.data || err.message || 'Failed to send invitation';
      setError(`❌ ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespondToInvitation = async (invitationId, accepted, tripTitle) => {
    clearMessages();
    try {
      await invitationService.respondToInvitation(invitationId, accepted);
      setSuccess(accepted
        ? `✅ You accepted the invitation for "${tripTitle}"! You have been added to the travel group.`
        : `You declined the invitation for "${tripTitle}".`
      );
      loadPendingInvitations();
    } catch (err) {
      const msg = err.response?.data || err.message || 'Failed to respond to invitation';
      setError(`❌ ${msg}`);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (window.confirm('Are you sure you want to cancel this invitation?')) {
      clearMessages();
      try {
        await invitationService.cancelInvitation(id, invitationId);
        setSuccess('Invitation cancelled.');
        loadInvitations();
      } catch (err) {
        setError('Failed to cancel invitation');
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING:  { background: 'linear-gradient(135deg, #f9a826, #e07b00)', color: '#fff', padding: '3px 10px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600 },
      ACCEPTED: { background: 'linear-gradient(135deg, #43e97b, #38f9d7)', color: '#1a2a1a', padding: '3px 10px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600 },
      DECLINED: { background: 'linear-gradient(135deg, #ff4d6d, #c9184a)', color: '#fff', padding: '3px 10px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600 },
      EXPIRED:  { background: '#4a4a6a', color: '#aaa', padding: '3px 10px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600 },
    };
    return <span style={styles[status] || styles.EXPIRED}>{status}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Trip Invitations 📨</h1>
            <p className="page-subtitle">Invite travellers to join your trip by their username</p>
          </div>
          {id && id !== 'undefined' && (
            <button
              id="invite-toggle-btn"
              className="btn btn-primary btn-auto"
              onClick={() => { setShowInviteForm(!showInviteForm); clearMessages(); }}
            >
              {showInviteForm ? '✕ Cancel' : '+ Send Invitation'}
            </button>
          )}
        </div>

        {/* Alerts */}
        {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

        {/* Send Invitation Form */}
        {showInviteForm && (
          <div className="section-card" style={{ borderLeft: '4px solid #7b5ea7', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Send New Invitation</h2>
            <form onSubmit={handleSendInvitation}>
              <div className="form-group">
                <label htmlFor="invitee-username">
                  <strong>👤 Traveller Username *</strong>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>@</span>
                  <input
                    id="invitee-username"
                    type="text"
                    className="form-input"
                    placeholder="e.g. john_doe"
                    value={inviteeUsername}
                    onChange={(e) => setInviteeUsername(e.target.value)}
                    required
                    autoFocus
                    style={{ flex: 1 }}
                  />
                </div>
                <small style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Ask the traveller for their TripNest username. They'll receive an instant notification.
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="invite-message">💬 Personal Message (optional)</label>
                <textarea
                  id="invite-message"
                  className="form-input"
                  placeholder="Add a personal note to your invitation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="submit"
                  id="send-invite-btn"
                  className="btn btn-primary btn-auto"
                  disabled={submitting}
                >
                  {submitting ? 'Sending…' : '📤 Send Invitation'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-auto"
                  onClick={() => { setShowInviteForm(false); clearMessages(); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pending Invitations for the current user */}
        {pendingInvitations.length > 0 && (
          <div className="section-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #f9a826' }}>
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
              🔔 Your Pending Invitations ({pendingInvitations.length})
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="stat-card"
                  style={{ borderLeft: '4px solid #f9a826', padding: '1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.4rem 0' }}>{inv.tripTitle}</h3>
                      <p style={{ margin: '0 0 0.25rem 0', color: 'var(--color-text-muted)' }}>
                        📍 {inv.tripDestination}
                      </p>
                      <p style={{ margin: '0 0 0.25rem 0', color: 'var(--color-text-muted)' }}>
                        👤 Invited by: <strong>@{inv.inviterName}</strong>
                      </p>
                      {inv.message && (
                        <p style={{ margin: '0.5rem 0', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                          "{inv.message}"
                        </p>
                      )}
                      <small style={{ color: 'var(--color-text-muted)' }}>
                        Sent: {formatDate(inv.createdAt)}
                      </small>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        id={`accept-invite-${inv.id}`}
                        className="btn btn-primary btn-auto"
                        onClick={() => handleRespondToInvitation(inv.id, true, inv.tripTitle)}
                      >
                        ✅ Accept
                      </button>
                      <button
                        id={`decline-invite-${inv.id}`}
                        className="btn btn-danger btn-auto"
                        onClick={() => handleRespondToInvitation(inv.id, false, inv.tripTitle)}
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trip's sent invitations */}
        {id && id !== 'undefined' && (
          <div className="section-card">
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Invitations for This Trip</h2>
            {loading ? (
              <div className="loading-text">Loading invitations…</div>
            ) : invitations.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p>No invitations sent yet. Invite travellers by their username to collaborate!</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Traveller</th>
                    <th>Status</th>
                    <th>Message</th>
                    <th>Sent</th>
                    <th>Responded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <strong>@{inv.inviteeName}</strong>
                      </td>
                      <td>{getStatusBadge(inv.status)}</td>
                      <td style={{ maxWidth: 200, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {inv.message ? `"${inv.message}"` : '—'}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{formatDate(inv.createdAt)}</td>
                      <td style={{ fontSize: '0.85rem' }}>{formatDate(inv.respondedAt)}</td>
                      <td>
                        {inv.status === 'PENDING' && (
                          <button
                            className="btn btn-sm btn-danger btn-auto"
                            onClick={() => handleCancelInvitation(inv.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="section-card" style={{ marginTop: '1.5rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>💡 Invitation Tips</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px', borderLeft: '3px solid #7b5ea7' }}>
              <strong>👥 Invite by Username:</strong> Simply enter the traveller's TripNest username — no ID numbers needed.
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px', borderLeft: '3px solid #43e97b' }}>
              <strong>🏘️ Auto Group Creation:</strong> When a traveller accepts, they are automatically added to the trip's travel group and gain access to the group chat.
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px', borderLeft: '3px solid #f9a826' }}>
              <strong>🔔 Instant Notifications:</strong> Travellers receive a real-time notification when invited. You get notified when they respond.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripInvitations;
