import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  FaReceipt,
  FaPlus,
  FaSearch,
  FaTrashAlt,
  FaCar,
  FaHotel,
  FaUtensils,
  FaShoppingBag,
  FaFilm,
  FaTag,
  FaCalendarAlt
} from "react-icons/fa";
import "../styles/AppLayout.css";

const CATEGORIES = [
  { value: "Accommodation", label: "Accommodation / Hotel", icon: <FaHotel /> },
  { value: "Transportation", label: "Transportation", icon: <FaCar /> },
  { value: "Food", label: "Food & Dining", icon: <FaUtensils /> },
  { value: "Activities", label: "Activities & Tours", icon: <FaFilm /> },
  { value: "Shopping", label: "Shopping", icon: <FaShoppingBag /> },
  { value: "Other", label: "Other / Misc", icon: <FaTag /> }
];

function Expenses() {
  const [searchParams] = useSearchParams();
  const initialTripId = searchParams.get("tripId") || "";

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(initialTripId);
  const [expenses, setExpenses] = useState([]);

  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    id: null,
    expenseTitle: "",
    category: "Food",
    amount: "",
    expenseDate: new Date().toISOString().substring(0, 10),
    notes: "",
  });

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await api.get("/trips");
        setTrips(response.data);
        if (!initialTripId && response.data.length > 0) {
          setSelectedTripId(response.data[0].tripId.toString());
        }
      } catch (err) {
        setAlert({ type: "danger", message: "Failed to fetch user trips." });
      } finally {
        setLoadingTrips(false);
      }
    };
    fetchTrips();
  }, [initialTripId]);

  useEffect(() => {
    if (!selectedTripId) {
      setExpenses([]);
      return;
    }

    const fetchExpenses = async () => {
      setLoadingExpenses(true);
      try {
        const expResp = await api.get(`/expenses?tripId=${selectedTripId}`);
        setExpenses(expResp.data);
      } catch (err) {
        setAlert({ type: "danger", message: "Error loading expenses list." });
      } finally {
        setLoadingExpenses(false);
      }
    };

    fetchExpenses();
  }, [selectedTripId]);

  const handleTripChange = (e) => {
    setSelectedTripId(e.target.value);
    setAlert({ type: "", message: "" });
  };

  const openAddExpenseModal = () => {
    setExpenseForm({
      id: null,
      expenseTitle: "",
      category: "Food",
      amount: "",
      expenseDate: new Date().toISOString().substring(0, 10),
      notes: "",
    });
    setShowModal(true);
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.expenseTitle.trim() || !expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      setAlert({ type: "danger", message: "Title and positive amount are required." });
      return;
    }

    setSubmitting(true);
    try {
      // Resolve budget ID for selected trip
      const budgetResp = await api.get(`/budgets?tripId=${selectedTripId}`);
      let budgetId = budgetResp.data.length > 0 ? budgetResp.data[0].budgetId : null;
      if (!budgetId) {
        const tripObj = trips.find((t) => t.tripId.toString() === selectedTripId);
        const newBudget = await api.post("/budgets", {
          totalBudget: tripObj ? tripObj.budgetAllocated : 1000,
          currency: "USD",
          trip: { tripId: parseInt(selectedTripId) },
        });
        budgetId = newBudget.data.budgetId;
      }

      const payload = {
        expenseTitle: expenseForm.expenseTitle,
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        expenseDate: expenseForm.expenseDate,
        notes: expenseForm.notes,
        budget: { budgetId: budgetId },
      };

      const response = await api.post("/expenses", payload);
      setExpenses([...expenses, response.data]);
      setShowModal(false);
      setAlert({ type: "success", message: "Expense recorded successfully!" });
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to save expense entry." });
    } finally {
      setSubmitting(false);
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;

    try {
      await api.delete(`/expenses/${expenseId}`);
      setExpenses(expenses.filter((e) => e.expenseId !== expenseId));
      setAlert({ type: "success", message: "Expense removed." });
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to delete expense." });
    } finally {
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const getCategoryIcon = (catName) => {
    const matched = CATEGORIES.find((c) => c.value.toLowerCase() === (catName || "").toLowerCase());
    return matched ? matched.icon : <FaTag />;
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.expenseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenseSum = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  return (
    <div className="app-dashboard-container">
      <Navbar />

      <div className="app-main-layout">
        <Sidebar />

        <main className="app-content-body">
          {/* Header */}
          <div className="app-page-header">
            <div className="app-page-title-wrap">
              <h1 className="app-page-title">Expense Tracker</h1>
              <p className="app-page-subtitle">Catalog live expenditures, view receipt logs, and monitor category totals.</p>
            </div>

            {selectedTripId && (
              <button onClick={openAddExpenseModal} className="app-primary-btn" type="button">
                <FaPlus /> Record Expense
              </button>
            )}
          </div>

          {alert.message && (
            <div className={`app-alert-banner app-alert-${alert.type}`} role="alert">
              {alert.message}
            </div>
          )}

          {/* Filters Horizontal Row */}
          <div className="app-glass-card p-3 mb-4">
            <div className="d-flex align-items-center gap-3 flex-wrap flex-md-nowrap w-100">
              <div className="flex-grow-1" style={{ minWidth: "200px" }}>
                {loadingTrips ? (
                  <span className="text-muted">Loading trips...</span>
                ) : (
                  <select
                    value={selectedTripId}
                    onChange={handleTripChange}
                    className="app-form-select"
                    aria-label="Filter Expenses by Trip"
                  >
                    <option value="">-- Choose a Trip --</option>
                    {trips.map((t) => (
                      <option key={t.tripId} value={t.tripId}>
                        {t.tripName} ({t.destinationName})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex-grow-1" style={{ minWidth: "220px", position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search title or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="app-form-input ps-5"
                />
                <FaSearch style={{ position: "absolute", left: "16px", top: "18px", color: "#64748B" }} />
              </div>

              <div className="flex-grow-1" style={{ minWidth: "180px" }}>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="app-form-select"
                  aria-label="Filter expenses by category"
                >
                  <option value="ALL">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Expenses Content */}
          {loadingExpenses ? (
            <div className="app-loader-box">
              <div className="spinner-border text-primary" role="status"></div>
              <span>Fetching expense logs...</span>
            </div>
          ) : selectedTripId ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Summary Card */}
              <div className="app-glass-card mb-4 p-3 d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-secondary-text d-block" style={{ fontSize: "14px" }}>Total Logged Expenses</span>
                  <strong className="text-white h3 mb-0" style={{ fontWeight: "800" }}>${totalExpenseSum.toFixed(2)}</strong>
                </div>
                <span className="badge bg-primary px-3 py-2" style={{ borderRadius: "10px", fontSize: "14px" }}>
                  {filteredExpenses.length} Expense Records
                </span>
              </div>

              {/* Table */}
              {filteredExpenses.length > 0 ? (
                <div className="app-table-wrapper mb-4">
                  <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>EXPENSE TITLE</th>
                          <th>CATEGORY</th>
                          <th>DATE</th>
                          <th>AMOUNT</th>
                          <th className="text-end">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenses.map((exp) => (
                          <tr key={exp.expenseId}>
                            <td>
                              <strong className="text-white" style={{ fontSize: "15px" }}>{exp.expenseTitle}</strong>
                              {exp.notes && <div className="text-secondary-text" style={{ fontSize: "13px" }}>{exp.notes}</div>}
                            </td>
                            <td>
                              <span className="badge bg-dark border border-secondary text-primary d-inline-flex align-items-center gap-2 px-3 py-2" style={{ borderRadius: "8px" }}>
                                {getCategoryIcon(exp.category)} {exp.category}
                              </span>
                            </td>
                            <td className="text-secondary-text" style={{ fontSize: "14px" }}>
                              <span className="d-flex align-items-center gap-2">
                                <FaCalendarAlt /> {exp.expenseDate}
                              </span>
                            </td>
                            <td>
                              <strong className="text-white" style={{ fontSize: "16px" }}>
                                ${parseFloat(exp.amount).toFixed(2)}
                              </strong>
                            </td>
                            <td className="text-end">
                              <button
                                onClick={() => handleDeleteExpense(exp.expenseId)}
                                className="btn btn-sm btn-outline-danger"
                                style={{ borderRadius: "8px", padding: "8px 14px" }}
                                type="button"
                                title="Delete Expense"
                              >
                                <FaTrashAlt />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="app-glass-card text-center p-5">
                  <FaReceipt className="text-muted mb-3" style={{ fontSize: "3.5rem" }} />
                  <h2 className="h3 text-dark font-weight-bold">No Expenses Recorded</h2>
                  <p className="text-muted">
                    {searchTerm || categoryFilter !== "ALL"
                      ? "Try clearing your filters."
                      : "Click 'Record Expense' to log your first payment."}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="app-glass-card text-center p-5">
              <h2 className="h3 text-dark font-weight-bold">No Trip Selected</h2>
              <p className="text-muted">Select a trip above to view or add expenses.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="app-modal-overlay" role="dialog" aria-modal="true">
          <motion.div
            className="app-modal-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <header className="app-modal-header text-white">
              <h2 className="app-modal-title">Record New Expense</h2>
            </header>
            <form onSubmit={handleExpenseSubmit}>
              <div className="app-modal-body">
                <div className="app-form-group">
                  <label htmlFor="expenseTitle" className="app-form-label">Expense Title</label>
                  <input
                    type="text"
                    id="expenseTitle"
                    value={expenseForm.expenseTitle}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expenseTitle: e.target.value })}
                    placeholder="e.g. Flight to Paris, Dinner at Bistro"
                    className="app-form-input"
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 app-form-group">
                    <label htmlFor="expenseCategory" className="app-form-label">Category</label>
                    <select
                      id="expenseCategory"
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                      className="app-form-select"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 app-form-group">
                    <label htmlFor="amount" className="app-form-label">Amount ($)</label>
                    <input
                      type="number"
                      id="amount"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      placeholder="e.g. 150.00"
                      className="app-form-input"
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="app-form-group">
                  <label htmlFor="expenseDate" className="app-form-label">Date</label>
                  <input
                    type="date"
                    id="expenseDate"
                    value={expenseForm.expenseDate}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                    className="app-form-input text-white"
                    style={{ colorScheme: "dark" }}
                    required
                  />
                </div>

                <div className="app-form-group mb-0">
                  <label htmlFor="expenseNotes" className="app-form-label">Notes / Description (Optional)</label>
                  <textarea
                    id="expenseNotes"
                    value={expenseForm.notes}
                    onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                    placeholder="Add details, receipt numbers..."
                    className="app-form-textarea"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <footer className="app-modal-footer">
                <button onClick={() => setShowModal(false)} className="app-secondary-btn" type="button">
                  Cancel
                </button>
                <button type="submit" className="app-primary-btn" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Expense"}
                </button>
              </footer>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Expenses;