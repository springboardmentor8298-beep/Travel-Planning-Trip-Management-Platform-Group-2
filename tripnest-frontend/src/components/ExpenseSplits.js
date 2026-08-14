import React, { useEffect, useState } from 'react';
import { getTripSplits } from '../services/trip.service';
import { Users, ArrowRight, ArrowLeftRight, CheckCircle2, Check } from 'lucide-react';

const ExpenseSplits = ({ tripId }) => {
  const [splitData, setSplitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settling, setSettling] = useState(null);
  const [settledHistory, setSettledHistory] = useState([]);

  useEffect(() => {
    fetchSplits();
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSplits = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTripSplits(tripId);
      setSplitData(data);
    } catch (err) {
      console.error('Failed to load expense splits:', err);
      setError('Could not calculate expense splits.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = (settlement) => {
    setSettling(settlement);
    // Simulate instantaneous settlement
    setTimeout(() => {
      setSettledHistory(prev => [...prev, `${settlement.fromFullName} paid ₹${settlement.amount} to ${settlement.toFullName}`]);
      setSettling(null);
    }, 1200);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        <div style={{
          display: 'inline-block',
          width: '36px', height: '36px',
          border: '3px solid rgba(16,185,129,0.2)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '1rem',
        }} />
        <p>Calculating group expense splits and balances...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!splitData) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Summary */}
      <div className="stats-row">
        <div className="stat-card">
          <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>💰</div>
          <div className="stat-number">₹{splitData.totalTripSpent?.toLocaleString() || '0'}</div>
          <div className="stat-label">Total Trip Spent</div>
        </div>

        <div className="stat-card">
          <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>👥</div>
          <div className="stat-number" style={{ color: 'var(--accent-info)' }}>{splitData.totalMembers}</div>
          <div className="stat-label">Group Members</div>
        </div>

        <div className="stat-card">
          <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>⚖️</div>
          <div className="stat-number" style={{ color: 'var(--accent)' }}>₹{splitData.equalSharePerMember?.toLocaleString() || '0'}</div>
          <div className="stat-label">Equal Share / Person</div>
        </div>
      </div>

      {/* Member Balances Table */}
      <div className="section-card">
        <h4 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Users size={18} style={{ color: 'var(--accent)' }} />
          <span>Individual Member Balances</span>
        </h4>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Total Paid</th>
                <th>Share</th>
                <th>Net Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {splitData.memberBalances?.map((m) => {
                const isOwed = m.netBalance > 0;
                const isEven = m.netBalance === 0;
                return (
                  <tr key={m.userId}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{m.username}</div>
                    </td>
                    <td>₹{m.totalPaid?.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>₹{m.fairShare?.toLocaleString()}</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: isEven ? 'var(--text-muted)' : isOwed ? 'var(--accent)' : 'var(--accent-danger)'
                      }}>
                        {isOwed ? `+₹${m.netBalance.toLocaleString()}` : isEven ? '₹0' : `-₹${Math.abs(m.netBalance).toLocaleString()}`}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isEven ? 'badge-completed' : isOwed ? 'badge-planned' : 'badge-cancelled'}`}>
                        {isEven ? 'Settled' : isOwed ? 'Gets Back' : 'Owes'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggested Settlements / Debt Simplification */}
      <div className="section-card">
        <h4 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <ArrowLeftRight size={18} style={{ color: 'var(--accent-2)' }} />
          <span>Optimized Settlement Plan</span>
        </h4>

        {splitData.suggestedSettlements?.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <CheckCircle2 size={32} style={{ color: 'var(--accent)', marginBottom: '0.75rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>All Balances Are Settled!</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No outstanding debts remain for this trip.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {splitData.suggestedSettlements?.map((s, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.fromFullName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-2)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span>pays</span>
                    <ArrowRight size={14} />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>₹{s.amount?.toLocaleString()}</span>
                    <ArrowRight size={14} />
                    <span>to</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.toFullName}</span>
                </div>

                <button
                  onClick={() => handleSettle(s)}
                  disabled={settling === s}
                  className="btn btn-outline btn-sm btn-auto"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {settling === s ? 'Settling...' : <><Check size={14} /> Mark as Paid</>}
                </button>
              </div>
            ))}
          </div>
        )}

        {settledHistory.length > 0 && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Recent Settlements
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {settledHistory.map((item, i) => (
                <div key={i} style={{ fontSize: '0.85rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check size={14} /> {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseSplits;
