import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import groupService from '../services/group.service';

const GroupCollaboration = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [groupFormData, setGroupFormData] = useState({ name: '', description: '' });
  const [memberUsername, setMemberUsername] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const loadGroups = async () => {
    try {
      setLoading(true);
      const groupsData = await groupService.getUserGroups();
      setGroups(groupsData);
    } catch (err) {
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupDetails = async (groupId) => {
    try {
      const groupData = await groupService.getGroup(groupId);
      setSelectedGroup(groupData);
    } catch (err) {
      setError('Failed to load group details');
    }
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      setSubmitting(true);
      await groupService.createGroup(groupFormData);
      setShowGroupForm(false);
      setGroupFormData({ name: '', description: '' });
      setSuccess('✅ Group created successfully!');
      loadGroups();
    } catch (err) {
      setError('Failed to create group: ' + (err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMemberByUsername = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!memberUsername.trim()) { setError('Please enter a username'); return; }
    try {
      setSubmitting(true);
      await groupService.addMemberByUsername(selectedGroup.id, memberUsername.trim());
      setShowMemberForm(false);
      setMemberUsername('');
      setSuccess(`✅ @${memberUsername.trim()} has been added to the group!`);
      loadGroupDetails(selectedGroup.id);
    } catch (err) {
      const msg = err.response?.data || err.message || 'Failed to add member';
      setError(`❌ ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId, username) => {
    if (window.confirm(`Remove @${username} from the group?`)) {
      clearMessages();
      try {
        await groupService.removeMemberFromGroup(selectedGroup.id, userId);
        setSuccess(`@${username} removed from group.`);
        loadGroupDetails(selectedGroup.id);
      } catch (err) {
        setError('Failed to remove member');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    clearMessages();
    try {
      await groupService.updateMemberRole(selectedGroup.id, userId, newRole);
      loadGroupDetails(selectedGroup.id);
    } catch (err) {
      setError('Failed to update member role');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This cannot be undone.')) {
      clearMessages();
      try {
        await groupService.deleteGroup(groupId);
        setSelectedGroup(null);
        setSuccess('Group deleted.');
        loadGroups();
      } catch (err) {
        setError('Failed to delete group');
      }
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      ADMIN:     { background: 'linear-gradient(135deg, #7b5ea7, #5e4a8a)', color: '#fff' },
      MODERATOR: { background: 'linear-gradient(135deg, #43e97b, #38f9d7)', color: '#1a3a1a' },
      MEMBER:    { background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: '#1a2a3a' },
    };
    const style = styles[role] || styles.MEMBER;
    return (
      <span style={{
        ...style,
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: '0.78rem',
        fontWeight: 600,
        display: 'inline-block',
      }}>
        {role}
      </span>
    );
  };

  const getMemberDisplayName = (member) => {
    const full = [member.firstName, member.lastName].filter(Boolean).join(' ');
    return full || member.username;
  };

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Group Collaboration 👥</h1>
            <p className="page-subtitle">Manage travel groups and invite travellers by username</p>
          </div>
          <button
            id="create-group-btn"
            className="btn btn-primary btn-auto"
            onClick={() => { setShowGroupForm(!showGroupForm); clearMessages(); }}
          >
            {showGroupForm ? '✕ Cancel' : '+ Create Group'}
          </button>
        </div>

        {/* Alerts */}
        {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

        {/* Create Group Form */}
        {showGroupForm && (
          <div className="section-card" style={{ borderLeft: '4px solid #7b5ea7', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Create New Group</h2>
            <form onSubmit={handleGroupSubmit}>
              <div className="form-group">
                <label htmlFor="group-name">Group Name *</label>
                <input
                  id="group-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Tokyo Adventure 2025"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="group-description">Description</label>
                <textarea
                  id="group-description"
                  className="form-input"
                  placeholder="What is this group for?"
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary btn-auto" disabled={submitting}>
                  {submitting ? 'Creating…' : '🏘️ Create Group'}
                </button>
                <button type="button" className="btn btn-outline btn-auto" onClick={() => { setShowGroupForm(false); clearMessages(); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: selectedGroup ? '340px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Groups List */}
          <div className="section-card">
            <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>Your Groups</h2>
            {loading ? (
              <div className="loading-text">Loading groups…</div>
            ) : groups.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <p>No groups yet. Create your first travel group or accept a trip invitation to join one!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="stat-card"
                    style={{
                      cursor: 'pointer',
                      border: selectedGroup?.id === group.id ? '2px solid #7b5ea7' : '1px solid var(--color-border)',
                      background: selectedGroup?.id === group.id ? 'rgba(123, 94, 167, 0.1)' : undefined,
                      transition: 'all 0.2s',
                    }}
                    onClick={() => { loadGroupDetails(group.id); clearMessages(); }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{group.name}</h3>
                        <p style={{ margin: '0 0 0.4rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          {group.description || 'No description'}
                        </p>
                        <small style={{ color: 'var(--color-text-muted)' }}>
                          👤 {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                        </small>
                      </div>
                      <button
                        className="btn btn-sm btn-danger btn-auto"
                        style={{ flexShrink: 0 }}
                        onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group Details Panel */}
          {selectedGroup && (
            <div className="section-card">
              {/* Group Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 className="section-title" style={{ margin: 0 }}>{selectedGroup.name}</h2>
                  {selectedGroup.description && (
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                      {selectedGroup.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to="/chat" className="btn btn-outline btn-auto" style={{ textDecoration: 'none' }}>
                    💬 Open Chat
                  </Link>
                  <button
                    id="add-member-toggle-btn"
                    className="btn btn-primary btn-auto"
                    onClick={() => { setShowMemberForm(!showMemberForm); clearMessages(); }}
                  >
                    {showMemberForm ? '✕ Cancel' : '+ Add Member'}
                  </button>
                </div>
              </div>

              {/* Add Member by Username Form */}
              {showMemberForm && (
                <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--color-bg-alt)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Add Member by Username</h3>
                  <form onSubmit={handleAddMemberByUsername}>
                    <div className="form-group">
                      <label htmlFor="member-username">👤 Username *</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>@</span>
                        <input
                          id="member-username"
                          type="text"
                          className="form-input"
                          placeholder="e.g. alice_wonder"
                          value={memberUsername}
                          onChange={(e) => setMemberUsername(e.target.value)}
                          required
                          autoFocus
                          style={{ flex: 1 }}
                        />
                      </div>
                      <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                        Enter the TripNest username of the person you want to add.
                      </small>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button type="submit" id="add-member-submit-btn" className="btn btn-primary btn-auto" disabled={submitting}>
                        {submitting ? 'Adding…' : '➕ Add to Group'}
                      </button>
                      <button type="button" className="btn btn-outline btn-auto" onClick={() => { setShowMemberForm(false); clearMessages(); }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Members List */}
              <h3 style={{ marginBottom: '1rem' }}>
                Group Members ({selectedGroup.members?.length || 0})
              </h3>
              {selectedGroup.members && selectedGroup.members.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {selectedGroup.members.map((member) => (
                    <div
                      key={member.userId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.85rem 1rem',
                        background: 'var(--color-bg-alt)',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        gap: '1rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Avatar + Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7b5ea7, #5e4a8a)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
                        }}>
                          {(member.username || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {getMemberDisplayName(member)}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            @{member.username}
                          </div>
                        </div>
                        {getRoleBadge(member.role)}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select
                          className="form-input form-select"
                          style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                        >
                          {['ADMIN', 'MODERATOR', 'MEMBER'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <button
                          className="btn btn-sm btn-danger btn-auto"
                          onClick={() => handleRemoveMember(member.userId, member.username)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No members yet. Add members by their username to start collaborating!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCollaboration;
