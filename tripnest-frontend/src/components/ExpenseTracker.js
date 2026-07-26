import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import expenseService from '../services/expense.service';

const ExpenseTracker = () => {
  const { id } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'MISCELLANEOUS',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    notes: ''
  });

  const EXPENSE_CATEGORIES = [
    'TRANSPORTATION',
    'HOTEL',
    'FOOD',
    'SHOPPING',
    'ENTERTAINMENT',
    'MISCELLANEOUS'
  ];

  useEffect(() => {
    loadExpenses();
  }, [id]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const [expensesData, totalData, categoryData] = await Promise.all([
        expenseService.getExpensesByTrip(id),
        expenseService.getTotalExpensesByTrip(id),
        expenseService.getExpensesByCategory(id)
      ]);
      setExpenses(expensesData);
      setTotalExpenses(totalData || 0);
      setExpensesByCategory(categoryData || {});
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, formData);
      } else {
        await expenseService.createExpense(id, formData);
      }
      setShowForm(false);
      setEditingExpense(null);
      setFormData({
        description: '',
        amount: '',
        category: 'MISCELLANEOUS',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        notes: ''
      });
      loadExpenses();
    } catch (err) {
      setError(editingExpense ? 'Failed to update expense' : 'Failed to create expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      expenseDate: expense.expenseDate,
      paymentMethod: expense.paymentMethod || '',
      notes: expense.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(expenseId);
        loadExpenses();
      } catch (err) {
        setError('Failed to delete expense');
      }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      TRANSPORTATION: 'var(--gradient-primary)',
      HOTEL: 'var(--gradient-secondary)',
      FOOD: 'var(--gradient-accent)',
      SHOPPING: 'var(--gradient-warm)',
      ENTERTAINMENT: 'var(--color-info-bg)',
      MISCELLANEOUS: 'var(--color-bg-alt)'
    };
    return colors[category] || 'var(--color-bg-alt)';
  };

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Expense Tracker 💰</h1>
            <p className="page-subtitle">Track and manage your travel expenses</p>
          </div>
          <button className="btn btn-primary btn-auto" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Expense'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Expense Summary Cards */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-number">₹{Number(totalExpenses).toLocaleString()}</div>
            <div className="stat-label">Total Spent</div>
          </div>
          {Object.entries(expensesByCategory).map(([category, amount]) => (
            <div key={category} className="stat-card" style={{ background: getCategoryColor(category) }}>
              <div className="stat-number">₹{Number(amount).toLocaleString()}</div>
              <div className="stat-label">{category}</div>
            </div>
          ))}
        </div>

        {/* Expense Form */}
        {showForm && (
          <div className="section-card">
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expense-description">Description *</label>
                  <input
                    id="expense-description"
                    name="description"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Flight tickets"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="expense-amount">Amount (₹) *</label>
                  <input
                    id="expense-amount"
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expense-category">Category *</label>
                  <select
                    id="expense-category"
                    name="category"
                    className="form-input form-select"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="expense-date">Date *</label>
                  <input
                    id="expense-date"
                    name="expenseDate"
                    type="date"
                    className="form-input"
                    value={formData.expenseDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expense-payment">Payment Method</label>
                  <input
                    id="expense-payment"
                    name="paymentMethod"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Credit Card, Cash"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="expense-notes">Notes</label>
                  <input
                    id="expense-notes"
                    name="notes"
                    type="text"
                    className="form-input"
                    placeholder="Optional notes"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary btn-auto">
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
                <button type="button" className="btn btn-outline btn-auto" onClick={() => {
                  setShowForm(false);
                  setEditingExpense(null);
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Expense List */}
        <div className="section-card">
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Expense History</h2>
          {loading ? (
            <div className="loading-text">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <p>No expenses recorded yet. Start tracking your spending!</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.expenseDate}</td>
                    <td>
                      <strong>{expense.description}</strong>
                      {expense.notes && <div className="text-muted" style={{ fontSize: '0.8rem' }}>{expense.notes}</div>}
                    </td>
                    <td>
                      <span className="badge" style={{ background: getCategoryColor(expense.category), color: '#fff' }}>
                        {expense.category}
                      </span>
                    </td>
                    <td><strong>₹{Number(expense.amount).toLocaleString()}</strong></td>
                    <td>{expense.paymentMethod || '-'}</td>
                    <td>
                      <button className="btn btn-sm btn-outline btn-auto" onClick={() => handleEdit(expense)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger btn-auto" onClick={() => handleDelete(expense.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
