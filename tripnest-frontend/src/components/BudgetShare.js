import React, { useState, useEffect } from 'react';
import { budgetShareService } from '../services/budgetShareService';
import './BudgetShare.css';

const BudgetShare = ({ tripId, groupId }) => {
  const [shares, setShares] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tripId) {
      loadBudgetShares();
    }
  }, [tripId]);

  const loadBudgetShares = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sharesData, paidData, budgetData] = await Promise.all([
        budgetShareService.getBudgetSharesByTrip(tripId),
        budgetShareService.getTotalPaidAmount(tripId),
        budgetShareService.getTotalBudgetAmount(tripId)
      ]);
      setShares(sharesData);
      setTotalPaid(parseFloat(paidData) || 0);
      setTotalBudget(parseFloat(budgetData) || 0);
    } catch (err) {
      setError('Failed to load budget shares');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createEqualShares = async () => {
    if (!groupId) {
      setError('Please select a group first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await budgetShareService.createEqualSharesForGroup(tripId, groupId);
      await loadBudgetShares();
    } catch (err) {
      setError('Failed to create equal shares');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmShare = async (shareId) => {
    try {
      await budgetShareService.confirmShare(shareId);
      await loadBudgetShares();
    } catch (err) {
      setError('Failed to confirm share');
      console.error(err);
    }
  };

  const markAsPaid = async (shareId) => {
    try {
      await budgetShareService.markAsPaid(shareId);
      await loadBudgetShares();
    } catch (err) {
      setError('Failed to mark as paid');
      console.error(err);
    }
  };

  const deleteShare = async (shareId) => {
    if (window.confirm('Are you sure you want to delete this share?')) {
      try {
        await budgetShareService.deleteBudgetShare(shareId);
        await loadBudgetShares();
      } catch (err) {
        setError('Failed to delete share');
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      PENDING: 'badge-pending',
      CONFIRMED: 'badge-confirmed',
      PAID: 'badge-paid',
      CANCELLED: 'badge-cancelled'
    };
    return <span className={`badge ${statusStyles[status] || ''}`}>{status}</span>;
  };

  const getShareTypeBadge = (type) => {
    const typeStyles = {
      EQUAL: 'badge-equal',
      PERCENTAGE: 'badge-percentage',
      CUSTOM: 'badge-custom'
    };
    return <span className={`badge ${typeStyles[type] || ''}`}>{type}</span>;
  };

  if (loading && shares.length === 0) {
    return <div className="budget-share-loading">Loading budget shares...</div>;
  }

  return (
    <div className="budget-share-container">
      <div className="budget-share-header">
        <h2>Budget Sharing</h2>
        {groupId && (
          <button 
            className="btn btn-primary"
            onClick={createEqualShares}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Equal Shares'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="budget-summary">
        <div className="summary-card">
          <h3>Total Budget</h3>
          <p className="amount">${totalBudget.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Paid</h3>
          <p className="amount paid">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Remaining</h3>
          <p className="amount remaining">${(totalBudget - totalPaid).toFixed(2)}</p>
        </div>
      </div>

      {shares.length === 0 ? (
        <div className="no-shares">
          <p>No budget shares created yet.</p>
          {groupId && <p>Click "Create Equal Shares" to distribute the budget among group members.</p>}
        </div>
      ) : (
        <div className="shares-list">
          <table className="shares-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((share) => (
                <tr key={share.id}>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{share.username}</span>
                      <span className="user-full-name">
                        {share.userFirstName} {share.userLastName}
                      </span>
                    </div>
                  </td>
                  <td className="amount">${parseFloat(share.amount).toFixed(2)}</td>
                  <td>{getShareTypeBadge(share.shareType)}</td>
                  <td>{getStatusBadge(share.status)}</td>
                  <td className="actions">
                    {share.status === 'PENDING' && (
                      <>
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => confirmShare(share.id)}
                        >
                          Confirm
                        </button>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => markAsPaid(share.id)}
                        >
                          Mark Paid
                        </button>
                      </>
                    )}
                    {share.status === 'CONFIRMED' && (
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => markAsPaid(share.id)}
                      >
                        Mark Paid
                      </button>
                    )}
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteShare(share.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BudgetShare;
