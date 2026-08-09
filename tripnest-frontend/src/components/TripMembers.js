import React, { useEffect, useState, useCallback } from 'react';
import { getMembers, inviteMember, removeMember } from '../services/collaboration.service';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = {
  ACCEPTED: { label: 'Active', cls: 'badge--success' },
  PENDING:  { label: 'Pending', cls: 'badge--warning' },
  DECLINED: { label: 'Declined', cls: 'badge--danger' },
};

export default function TripMembers({ tripId, tripOwnerId }) {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteInput, setInviteInput] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isOwner = currentUser?.id === tripOwnerId;

  const load = useCallback(() => {
    setLoading(true);
    getMembers(tripId).then(setMembers).finally(() => setLoading(false));
  }, [tripId]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;
    setInviting(true);
    setError('');
    setSuccess('');
    try {
      await inviteMember(tripId, inviteInput.trim());
      setSuccess(`Invitation sent to "${inviteInput.trim()}"!`);
      setInviteInput('');
      load();
    } catch (err) {
      const serverMsg = err.response?.data?.message || '';
      // Provide friendlier messages for common error cases
      if (err.response?.status === 404 || serverMsg.toLowerCase().includes('user not found')) {
        setError(`No TripNest account found for "${inviteInput.trim()}". They must register first.`);
      } else if (err.response?.status === 409 || serverMsg.toLowerCase().includes('already')) {
        setError('This person has already been invited or is already a member.');
      } else if (err.response?.status === 400 || serverMsg.toLowerCase().includes('yourself')) {
        setError('You cannot invite yourself.');
      } else {
        setError(serverMsg || 'Could not send invitation. Please try again.');
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId, username) => {
    if (!window.confirm(`Remove ${username} from this trip?`)) return;
    try {
      await removeMember(tripId, memberId);
      load();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove member. Please try again.';
      setError(msg);
    }
  };

  return (
    <div className="trip-members">
      {/* Invite section — only for trip owner */}
      {isOwner && (
        <div className="invite-section">
          <h4>Invite Collaborator</h4>
          <form onSubmit={handleInvite} className="invite-form">
            <input
              type="text"
              className="form-control"
              placeholder="Enter username or email"
              value={inviteInput}
              onChange={(e) => { setInviteInput(e.target.value); setError(''); setSuccess(''); }}
            />
            <small style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: '0.25rem', display: 'block' }}>
              The person must already have a TripNest account.
            </small>
            <button type="submit" className="btn btn-primary" disabled={inviting}>
              {inviting ? 'Sending...' : 'Send Invite'}
            </button>
          </form>
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
        </div>
      )}

      {/* Members list */}
      <div className="members-list">
        <h4>Members ({members.length})</h4>
        {loading ? (
          <div className="loading-text">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">👥</div>
            <p>No members yet. Invite someone to collaborate!</p>
          </div>
        ) : (
          <div className="member-cards">
            {members.map((m) => {
              const badge = STATUS_BADGE[m.status] || STATUS_BADGE.PENDING;
              return (
                <div key={m.id} className="member-card">
                  <div className="member-card__avatar">
                    {m.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-card__info">
                    <div className="member-card__name">@{m.username}</div>
                    <div className="member-card__email">{m.email}</div>
                    <div className="member-card__meta">
                      <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      <span className="member-card__role">{m.role}</span>
                    </div>
                  </div>
                  {isOwner && m.status !== 'OWNER' && (
                    <button
                      className="btn-icon btn-icon--delete"
                      onClick={() => handleRemove(m.id, m.username)}
                      title="Remove member"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
