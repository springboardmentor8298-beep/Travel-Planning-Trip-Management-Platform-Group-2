import React, { useEffect, useState, useCallback } from 'react';
import { getExpenses, deleteExpense } from '../services/expense.service';
import { useAuth } from '../context/AuthContext';

const CATEGORY_ICONS = {
  TRANSPORTATION: '✈️', HOTEL: '🏨', FOOD: '🍽️',
  SHOPPING: '🛍️', ENTERTAINMENT: '🎭', MISCELLANEOUS: '📦',
};

export default function ExpenseList({ tripId, onEdit, onAdd, refresh }) {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(() => {
    setLoading(true);
    getExpenses(tripId).then(setExpenses).finally(() => setLoading(false));
  }, [tripId]);

  useEffect(() => { load(); }, [load, refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await deleteExpense(tripId, id);
    load();
  };

  const categories = ['ALL', 'TRANSPORTATION', 'HOTEL', 'FOOD', 'SHOPPING', 'ENTERTAINMENT', 'MISCELLANEOUS'];
  const filtered = filter === 'ALL' ? expenses : expenses.filter((e) => e.category === filter);

  return (
    <div className="expense-list">
      <div className="expense-list__header">
        <h4>Expenses</h4>
        <button className="btn btn-primary btn-sm" onClick={onAdd}>+ Add Expense</button>
      </div>

      {/* Category filter */}
      <div className="expense-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`expense-filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'ALL' ? '🗂️ All' : `${CATEGORY_ICONS[cat]} ${cat.replace('_', ' ')}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-text">Loading expenses...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">💸</div>
          <p>No expenses recorded yet.</p>
        </div>
      ) : (
        <div className="expense-table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Date</th>
                <th>Amount</th>
                <th>By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td>
                    <span className="expense-category-badge">
                      {CATEGORY_ICONS[e.category]} {e.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="expense-desc">{e.description || '—'}</td>
                  <td>{new Date(e.expenseDate).toLocaleDateString('en-IN')}</td>
                  <td className="expense-amount">₹{Number(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="expense-user">@{e.username}</td>
                  <td>
                    {currentUser?.username === e.username && (
                      <div className="expense-actions">
                        <button className="btn-icon btn-icon--edit" onClick={() => onEdit(e)} title="Edit">✏️</button>
                        <button className="btn-icon btn-icon--delete" onClick={() => handleDelete(e.id)} title="Delete">🗑️</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
