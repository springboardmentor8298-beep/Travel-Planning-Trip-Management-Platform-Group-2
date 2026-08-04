import React, { useEffect, useState, useCallback } from 'react';
import { getBudgetSummary } from '../services/expense.service';

const CATEGORY_COLORS = {
  TRANSPORTATION: '#6366f1',
  HOTEL: '#8b5cf6',
  FOOD: '#ec4899',
  SHOPPING: '#f59e0b',
  ENTERTAINMENT: '#10b981',
  MISCELLANEOUS: '#64748b',
};

const CATEGORY_ICONS = {
  TRANSPORTATION: '✈️',
  HOTEL: '🏨',
  FOOD: '🍽️',
  SHOPPING: '🛍️',
  ENTERTAINMENT: '🎭',
  MISCELLANEOUS: '📦',
};

export default function BudgetOverview({ tripId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getBudgetSummary(tripId)
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [tripId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="budget-loading">Loading budget data...</div>;
  if (!summary) return null;

  const { totalBudget, totalSpent, remaining, overBudget, categoryBreakdown } = summary;
  const pct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  return (
    <div className="budget-overview">
      {/* Header cards */}
      <div className="budget-cards">
        <div className="budget-card budget-card--total">
          <div className="budget-card__label">Total Budget</div>
          <div className="budget-card__value">₹{Number(totalBudget).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="budget-card budget-card--spent">
          <div className="budget-card__label">Total Spent</div>
          <div className="budget-card__value">₹{Number(totalSpent).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className={`budget-card ${overBudget ? 'budget-card--over' : 'budget-card--remaining'}`}>
          <div className="budget-card__label">{overBudget ? 'Over Budget By' : 'Remaining'}</div>
          <div className="budget-card__value">₹{Math.abs(Number(remaining)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="budget-progress-section">
        <div className="budget-progress-label">
          <span>Budget Used</span>
          <span className={overBudget ? 'text-danger' : ''}>{pct.toFixed(1)}%</span>
        </div>
        <div className="budget-progress-bar">
          <div
            className={`budget-progress-fill ${overBudget ? 'budget-progress-fill--over' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="budget-categories">
        <h4 className="budget-categories__title">Spending by Category</h4>
        <div className="budget-category-grid">
          {Object.entries(categoryBreakdown || {}).map(([cat, amt]) => {
            const amount = Number(amt);
            const catPct = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : 0;
            return (
              <div key={cat} className="budget-category-item">
                <div className="budget-category-item__header">
                  <span className="budget-category-item__icon">{CATEGORY_ICONS[cat] || '📦'}</span>
                  <span className="budget-category-item__name">{cat.replace('_', ' ')}</span>
                  <span className="budget-category-item__amount">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="budget-category-bar">
                  <div
                    className="budget-category-bar__fill"
                    style={{ width: `${catPct}%`, background: CATEGORY_COLORS[cat] || '#64748b' }}
                  />
                </div>
                <span className="budget-category-item__pct">{catPct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
