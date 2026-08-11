import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import tripService from '../services/trip.service';

const BudgetManager = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [budgetStatus, setBudgetStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');

  useEffect(() => {
    loadTripData();
  }, [id]);

  const loadTripData = async () => {
    try {
      setLoading(true);
      const tripData = await tripService.getTripById(id);
      setTrip(tripData);
      setBudgetAmount(tripData.budget || '');
      
      const expenses = await tripService.getTripExpenses(id);
      setTotalExpenses(expenses || 0);
      
      calculateBudgetStatus(tripData.budget, expenses);
    } catch (err) {
      setError('Failed to load trip data');
    } finally {
      setLoading(false);
    }
  };

  const calculateBudgetStatus = (budget, expenses) => {
    if (!budget) {
      setBudgetStatus('No budget set');
      return;
    }
    
    const percentage = (expenses / budget) * 100;
    
    if (percentage >= 100) {
      setBudgetStatus('Over budget');
    } else if (percentage >= 80) {
      setBudgetStatus('Near budget limit');
    } else if (percentage >= 50) {
      setBudgetStatus('On track');
    } else {
      setBudgetStatus('Under budget');
    }
  };

  const handleBudgetUpdate = async (e) => {
    e.preventDefault();
    try {
      await tripService.updateTrip(id, { ...trip, budget: parseFloat(budgetAmount) });
      setShowBudgetForm(false);
      loadTripData();
    } catch (err) {
      setError('Failed to update budget');
    }
  };

  const getBudgetColor = () => {
    if (!trip?.budget) return 'var(--color-bg-alt)';
    
    const percentage = (totalExpenses / trip.budget) * 100;
    
    if (percentage >= 100) return 'var(--color-error-bg)';
    if (percentage >= 80) return 'var(--color-warning-bg)';
    if (percentage >= 50) return 'var(--color-success-bg)';
    return 'var(--color-info-bg)';
  };

  const getRemainingBudget = () => {
    if (!trip?.budget) return 0;
    return trip.budget - totalExpenses;
  };

  const getBudgetPercentage = () => {
    if (!trip?.budget) return 0;
    return Math.min((totalExpenses / trip.budget) * 100, 100);
  };

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Budget Manager 💰</h1>
            <p className="page-subtitle">Track and manage your trip budget</p>
          </div>
          <button className="btn btn-primary btn-auto" onClick={() => setShowBudgetForm(!showBudgetForm)}>
            {showBudgetForm ? 'Cancel' : 'Set Budget'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-text">Loading budget information...</div>
        ) : (
          <>
            {/* Budget Overview Cards */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-number">₹{Number(trip?.budget || 0).toLocaleString()}</div>
                <div className="stat-label">Total Budget</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">₹{Number(totalExpenses).toLocaleString()}</div>
                <div className="stat-label">Total Spent</div>
              </div>
              <div className="stat-card" style={{ background: getBudgetColor() }}>
                <div className="stat-number">₹{Number(getRemainingBudget()).toLocaleString()}</div>
                <div className="stat-label">Remaining</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{getBudgetPercentage().toFixed(1)}%</div>
                <div className="stat-label">Budget Used</div>
              </div>
            </div>

            {/* Budget Status */}
            <div className="section-card">
              <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Budget Status</h2>
              <div style={{ 
                padding: '1.5rem', 
                borderRadius: '8px', 
                background: getBudgetColor(),
                color: '#fff',
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                {budgetStatus}
              </div>
              
              {/* Progress Bar */}
              {trip?.budget && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ 
                    height: '20px', 
                    background: 'var(--color-bg-alt)', 
                    borderRadius: '10px', 
                    overflow: 'hidden',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${getBudgetPercentage()}%`,
                      background: getBudgetColor(),
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>₹0</span>
                    <span>₹{Number(trip.budget).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Budget Form */}
            {showBudgetForm && (
              <div className="section-card">
                <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
                  {trip?.budget ? 'Update Budget' : 'Set Budget'}
                </h2>
                <form onSubmit={handleBudgetUpdate}>
                  <div className="form-group">
                    <label htmlFor="budget-amount">Budget Amount (₹) *</label>
                    <input
                      id="budget-amount"
                      name="budgetAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-input"
                      placeholder="Enter your budget"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" className="btn btn-primary btn-auto">
                      {trip?.budget ? 'Update Budget' : 'Set Budget'}
                    </button>
                    <button type="button" className="btn btn-outline btn-auto" onClick={() => {
                      setShowBudgetForm(false);
                      setBudgetAmount(trip?.budget || '');
                    }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Budget Tips */}
            <div className="section-card">
              <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Budget Tips</h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
                  <strong>💡 Track your spending:</strong> Regularly update your expenses to stay on top of your budget.
                </div>
                <div style={{ padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
                  <strong>💡 Set realistic limits:</strong> Allocate budget for different categories like accommodation, food, and activities.
                </div>
                <div style={{ padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
                  <strong>💡 Keep a buffer:</strong> Always set aside 10-15% of your budget for unexpected expenses.
                </div>
                <div style={{ padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
                  <strong>💡 Review regularly:</strong> Check your budget status weekly to make adjustments if needed.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;
