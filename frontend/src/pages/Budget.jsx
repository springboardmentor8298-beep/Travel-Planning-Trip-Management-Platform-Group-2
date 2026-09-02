import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  FaWallet,
  FaCalculator,
  FaCoins,
  FaEdit,
  FaReceipt,
  FaChartPie,
  FaArrowRight
} from "react-icons/fa";
import "../styles/AppLayout.css";

function Budget() {
  const [searchParams] = useSearchParams();
  const initialTripId = searchParams.get("tripId") || "";

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(initialTripId);
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [showModal, setShowModal] = useState(false);
  const [formConfig, setFormConfig] = useState({
    totalBudget: "",
    estimatedCost: "",
    currency: "USD",
  });
  const [submitting, setSubmitting] = useState(false);

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
      setBudget(null);
      setExpenses([]);
      return;
    }

    const fetchBudgetData = async () => {
      setLoadingData(true);
      try {
        const budgetResp = await api.get(`/budgets?tripId=${selectedTripId}`);
        const foundBudget = budgetResp.data.length > 0 ? budgetResp.data[0] : null;
        setBudget(foundBudget);

        const expenseResp = await api.get(`/expenses?tripId=${selectedTripId}`);
        setExpenses(expenseResp.data);

        if (foundBudget) {
          setFormConfig({
            totalBudget: foundBudget.totalBudget || "",
            estimatedCost: foundBudget.estimatedCost || "",
            currency: foundBudget.currency || "USD",
          });
        } else {
          const trip = trips.find((t) => t.tripId.toString() === selectedTripId);
          setFormConfig({
            totalBudget: trip ? trip.budgetAllocated : "",
            estimatedCost: "",
            currency: "USD",
          });
        }
      } catch (err) {
        setAlert({ type: "danger", message: "Error retrieving budget metrics." });
      } finally {
        setLoadingData(false);
      }
    };

    fetchBudgetData();
  }, [selectedTripId, trips]);

  const handleTripChange = (e) => {
    setSelectedTripId(e.target.value);
    setAlert({ type: "", message: "" });
  };

  const openConfigModal = () => {
    const trip = trips.find((t) => t.tripId.toString() === selectedTripId);
    setFormConfig({
      totalBudget: budget ? budget.totalBudget : trip ? trip.budgetAllocated : "",
      estimatedCost: budget ? budget.estimatedCost || "" : "",
      currency: budget ? budget.currency || "USD" : "USD",
    });
    setShowModal(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!formConfig.totalBudget || parseFloat(formConfig.totalBudget) < 0) {
      setAlert({ type: "danger", message: "Total budget cannot be empty or negative." });
      return;
    }

    setSubmitting(true);
    try {
      const totalB = parseFloat(formConfig.totalBudget);
      const estC = parseFloat(formConfig.estimatedCost) || 0;
      const totalSpent = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
      const remB = totalB - totalSpent;

      const payload = {
        totalBudget: totalB,
        estimatedCost: estC,
        remainingBudget: remB,
        currency: formConfig.currency,
        trip: { tripId: parseInt(selectedTripId) },
      };

      let saved;
      if (budget && budget.budgetId) {
        const resp = await api.put(`/budgets/${budget.budgetId}`, payload);
        saved = resp.data;
      } else {
        const resp = await api.post("/budgets", payload);
        saved = resp.data;
      }

      setBudget(saved);
      setShowModal(false);
      setAlert({ type: "success", message: "Budget parameters updated successfully." });
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to update budget." });
    } finally {
      setSubmitting(false);
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const allocatedBudget = budget ? parseFloat(budget.totalBudget) || 0 : (trips.find((t) => t.tripId.toString() === selectedTripId)?.budgetAllocated || 0);
  const remainingBalance = allocatedBudget - totalSpent;
  const percentageUsed = allocatedBudget > 0 ? Math.min(Math.round((totalSpent / allocatedBudget) * 100), 100) : 0;
  const currencySymbol = budget?.currency === "EUR" ? "€" : budget?.currency === "GBP" ? "£" : budget?.currency === "INR" ? "₹" : "$";

  const categories = ["Transportation", "Hotel", "Food", "Shopping", "Entertainment", "Miscellaneous"];
  const categoryTotals = categories.map((cat) => {
    const catSpent = expenses
      .filter((e) => e.category?.toLowerCase() === cat.toLowerCase())
      .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    return { category: cat, amount: catSpent };
  });

  return (
    <div className="app-dashboard-container">
      <Navbar />

      <div className="app-main-layout">
        <Sidebar />

        <main className="app-content-body">
          {/* Header */}
          <div className="app-page-header">
            <div className="app-page-title-wrap">
              <h1 className="app-page-title">Budget Management</h1>
              <p className="app-page-subtitle">Track trip allowances, category limits, and live expenditures.</p>
            </div>

            {selectedTripId && (
              <div className="d-flex gap-2">
                <button onClick={openConfigModal} className="app-secondary-btn" type="button">
                  <FaEdit /> Configure Budget
                </button>
                <Link to={`/expenses?tripId=${selectedTripId}`} className="app-primary-btn text-decoration-none">
                  <FaReceipt /> Manage Expenses <FaArrowRight />
                </Link>
              </div>
            )}
          </div>

          {alert.message && (
            <div className={`app-alert-banner app-alert-${alert.type}`} role="alert">
              {alert.message}
            </div>
          )}

          {/* Trip Selector Bar */}
          <div className="app-glass-card p-3 mb-4">
            <div className="d-flex align-items-center gap-3 flex-wrap flex-md-nowrap w-100">
              <span className="text-white font-weight-bold text-nowrap">Select Trip:</span>
              <div className="flex-grow-1" style={{ maxWidth: "420px" }}>
                {loadingTrips ? (
                  <span className="text-muted">Loading trip lists...</span>
                ) : (
                  <select
                    value={selectedTripId}
                    onChange={handleTripChange}
                    className="app-form-select"
                    aria-label="Select Trip for Budget tracking"
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
            </div>
          </div>

          {/* Dashboard Metrics */}
          {loadingData ? (
            <div className="app-loader-box">
              <div className="spinner-border text-primary" role="status"></div>
              <span>Calculating budget statistics...</span>
            </div>
          ) : selectedTripId ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stat Counters Grid */}
              <div className="row g-4 mb-4">
                <div className="col-6 col-md-3">
                  <motion.div className="app-glass-card p-4 d-flex align-items-center gap-3" whileHover={{ y: -4 }}>
                    <div className="p-3 bg-primary-subtle text-primary rounded-3" style={{ fontSize: "1.5rem" }}>
                      <FaWallet />
                    </div>
                    <div>
                      <span className="text-secondary-text d-block" style={{ fontSize: "14px" }}>Allocated Budget</span>
                      <strong className="text-white h3 mb-0" style={{ fontWeight: "700" }}>
                        {currencySymbol}{allocatedBudget}
                      </strong>
                    </div>
                  </motion.div>
                </div>

                <div className="col-6 col-md-3">
                  <motion.div className="app-glass-card p-4 d-flex align-items-center gap-3" whileHover={{ y: -4 }}>
                    <div className="p-3 bg-danger-subtle text-danger rounded-3" style={{ fontSize: "1.5rem" }}>
                      <FaReceipt />
                    </div>
                    <div>
                      <span className="text-secondary-text d-block" style={{ fontSize: "14px" }}>Total Spent</span>
                      <strong className="text-white h3 mb-0" style={{ fontWeight: "700" }}>
                        {currencySymbol}{totalSpent.toFixed(2)}
                      </strong>
                    </div>
                  </motion.div>
                </div>

                <div className="col-6 col-md-3">
                  <motion.div className="app-glass-card p-4 d-flex align-items-center gap-3" whileHover={{ y: -4 }}>
                    <div className="p-3 bg-success-subtle text-success rounded-3" style={{ fontSize: "1.5rem" }}>
                      <FaCoins />
                    </div>
                    <div>
                      <span className="text-secondary-text d-block" style={{ fontSize: "14px" }}>Remaining Balance</span>
                      <strong className={`h3 mb-0 ${remainingBalance < 0 ? "text-danger" : "text-white"}`} style={{ fontWeight: "700" }}>
                        {currencySymbol}{remainingBalance.toFixed(2)}
                      </strong>
                    </div>
                  </motion.div>
                </div>

                <div className="col-6 col-md-3">
                  <motion.div className="app-glass-card p-4 d-flex align-items-center gap-3" whileHover={{ y: -4 }}>
                    <div className="p-3 bg-info-subtle text-info rounded-3" style={{ fontSize: "1.5rem" }}>
                      <FaCalculator />
                    </div>
                    <div>
                      <span className="text-secondary-text d-block" style={{ fontSize: "14px" }}>Estimated Cost</span>
                      <strong className="text-white h3 mb-0" style={{ fontWeight: "700" }}>
                        {currencySymbol}{budget?.estimatedCost || "0.00"}
                      </strong>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Progress & Category Breakdown */}
              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="app-glass-card h-100">
                    <h3 className="h5 text-white mb-3" style={{ fontWeight: "700" }}>
                      Budget Consumption Status
                    </h3>
                    <p className="text-secondary-text mb-4" style={{ fontSize: "15px" }}>
                      Real-time tracker of spent funds vs total allocated trip limit.
                    </p>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between text-secondary-text mb-2">
                        <span>Used Funds ({percentageUsed}%)</span>
                        <strong className="text-white">
                          {currencySymbol}{totalSpent.toFixed(2)} / {currencySymbol}{allocatedBudget}
                        </strong>
                      </div>
                      <div className="progress bg-dark" style={{ height: "16px", borderRadius: "10px" }}>
                        <div
                          className={`progress-bar ${percentageUsed > 90 ? "bg-danger" : percentageUsed > 70 ? "bg-warning" : "bg-success"}`}
                          role="progressbar"
                          style={{ width: `${percentageUsed}%`, borderRadius: "10px" }}
                          aria-valuenow={percentageUsed}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>

                    {remainingBalance < 0 && (
                      <div className="alert alert-danger mb-0" role="alert">
                        <strong>Budget Exceeded!</strong> You have spent {currencySymbol}{Math.abs(remainingBalance).toFixed(2)} beyond your allocated limit.
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="app-glass-card h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 className="h5 text-white mb-0" style={{ fontWeight: "700" }}>
                        <FaChartPie className="text-primary me-2" /> Expense Categories
                      </h3>
                      <Link to={`/expenses?tripId=${selectedTripId}`} className="text-primary text-decoration-none" style={{ fontSize: "14px" }}>
                        View All Logged Expenses
                      </Link>
                    </div>

                    <div className="d-flex flex-column gap-3 mt-3">
                      {categoryTotals.map((item) => {
                        const itemPercentage = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;
                        return (
                          <div key={item.category}>
                            <div className="d-flex justify-content-between text-secondary-text mb-1" style={{ fontSize: "14px" }}>
                              <span>{item.category}</span>
                              <span className="text-white font-weight-bold">
                                {currencySymbol}{item.amount.toFixed(2)} ({itemPercentage}%)
                              </span>
                            </div>
                            <div className="progress bg-dark" style={{ height: "8px", borderRadius: "10px" }}>
                              <div
                                className="progress-bar bg-info"
                                role="progressbar"
                                style={{ width: `${itemPercentage}%`, borderRadius: "10px" }}
                                aria-valuenow={itemPercentage}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="app-glass-card text-center p-5">
              <FaWallet className="text-muted mb-3" style={{ fontSize: "3.5rem" }} />
              <h2 className="h3 text-dark font-weight-bold">No Trip Selected</h2>
              <p className="text-muted">Choose a trip above to view or configure its budget allocation.</p>
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
            <header className="app-modal-header">
              <h2 className="app-modal-title text-dark">Configure Trip Budget</h2>
            </header>
            <form onSubmit={handleSaveBudget}>
              <div className="app-modal-body">
                <div className="app-form-group">
                  <label htmlFor="totalBudget" className="app-form-label">Total Allocated Budget</label>
                  <input
                    type="number"
                    id="totalBudget"
                    value={formConfig.totalBudget}
                    onChange={(e) => setFormConfig({ ...formConfig, totalBudget: e.target.value })}
                    className="app-form-input"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="app-form-group">
                  <label htmlFor="estimatedCost" className="app-form-label">Estimated Total Cost</label>
                  <input
                    type="number"
                    id="estimatedCost"
                    value={formConfig.estimatedCost}
                    onChange={(e) => setFormConfig({ ...formConfig, estimatedCost: e.target.value })}
                    placeholder="e.g. 2500.00"
                    className="app-form-input"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="app-form-group">
                  <label htmlFor="currency" className="app-form-label">Currency</label>
                  <select
                    id="currency"
                    value={formConfig.currency}
                    onChange={(e) => setFormConfig({ ...formConfig, currency: e.target.value })}
                    className="app-form-select"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <footer className="app-modal-footer">
                <button onClick={() => setShowModal(false)} className="app-secondary-btn" type="button">
                  Cancel
                </button>
                <button type="submit" className="app-primary-btn" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Budget"}
                </button>
              </footer>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Budget;