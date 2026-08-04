import React, { useState, useEffect } from 'react';
import { addExpense, updateExpense } from '../services/expense.service';

const CATEGORIES = ['TRANSPORTATION', 'HOTEL', 'FOOD', 'SHOPPING', 'ENTERTAINMENT', 'MISCELLANEOUS'];

export default function ExpenseForm({ tripId, expense, onSave, onCancel }) {
  const isEdit = !!expense;
  const [form, setForm] = useState({
    category: 'MISCELLANEOUS',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setForm({
        category: expense.category,
        amount: expense.amount,
        description: expense.description || '',
        expenseDate: expense.expenseDate,
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (isEdit) {
        await updateExpense(tripId, expense.id, payload);
      } else {
        await addExpense(tripId, payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Expense' : 'Add Expense'}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="form-control">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="form-control"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="form-control"
              placeholder="What was this for?"
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="expenseDate"
              value={form.expenseDate}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
