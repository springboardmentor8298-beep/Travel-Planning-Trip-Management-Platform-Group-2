import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api, { getReports } from "../services/api";
import {
  FaFileAlt,
  FaDownload,
  FaPrint,
  FaFilter,
  FaRedo,
  FaSuitcase,
  FaWallet,
  FaReceipt,
  FaChartPie,
  FaCalendarCheck,
  FaInfoCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import "../styles/AppLayout.css";
import "../styles/Reports.css";

const CATEGORIES = [
  { value: "ALL", label: "All Categories" },
  { value: "Accommodation", label: "Accommodation" },
  { value: "Transportation", label: "Transportation" },
  { value: "Food", label: "Food & Dining" },
  { value: "Activities", label: "Activities" },
  { value: "Shopping", label: "Shopping" },
  { value: "Other", label: "Other / Misc" }
];

const STATUSES = [
  { value: "ALL", label: "All Statuses" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ACTIVE", label: "Active" },
  { value: "PLANNING", label: "Planning" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" }
];

function Reports() {
  const [activeTab, setActiveTab] = useState("TRIP_SUMMARY");
  const [tripsList, setTripsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter States
  const [selectedTripId, setSelectedTripId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Report Data
  const [reportData, setReportData] = useState({
    tripSummary: [],
    budgetSummary: [],
    expenseSummary: [],
    statusSummary: [],
    activitySummary: []
  });

  // Load user trips for dropdown
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await api.get("/trips");
        setTripsList(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load trips for report filter:", err);
      }
    };
    fetchTrips();
  }, []);

  // Fetch Report Data whenever filters change
  const fetchReportData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (selectedTripId) params.tripId = selectedTripId;
      if (selectedCategory && selectedCategory !== "ALL") params.category = selectedCategory;
      if (selectedStatus && selectedStatus !== "ALL") params.status = selectedStatus;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await getReports(params);
      if (res.data) {
        setReportData({
          tripSummary: res.data.tripSummary || [],
          budgetSummary: res.data.budgetSummary || [],
          expenseSummary: res.data.expenseSummary || [],
          statusSummary: res.data.statusSummary || [],
          activitySummary: res.data.activitySummary || []
        });
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError("Failed to load report data from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedTripId, selectedCategory, selectedStatus, startDate, endDate]);

  const handleResetFilters = () => {
    setSelectedTripId("");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
    setStartDate("");
    setEndDate("");
  };

  // Aggregated KPIs
  const totalBudget = useMemo(() => {
    return reportData.tripSummary.reduce((acc, t) => acc + (parseFloat(t.budgetAllocated) || 0), 0);
  }, [reportData.tripSummary]);

  const totalSpent = useMemo(() => {
    return reportData.tripSummary.reduce((acc, t) => acc + (parseFloat(t.totalExpenses) || 0), 0);
  }, [reportData.tripSummary]);

  const totalRemaining = totalBudget - totalSpent;

  // Export to CSV Functionality
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = "tripnest-report.csv";

    if (activeTab === "TRIP_SUMMARY") {
      filename = "tripnest-trip-summary.csv";
      headers = ["Trip ID", "Trip Name", "Destination", "Start Date", "End Date", "Status", "Travelers", "Budget", "Spent", "Remaining", "Activities"];
      rows = reportData.tripSummary.map(t => [
        t.tripId,
        `"${t.tripName || ""}"`,
        `"${t.destination || ""}"`,
        t.startDate || "",
        t.endDate || "",
        t.status || "",
        t.numberOfTravelers || 1,
        t.budgetAllocated || 0,
        t.totalExpenses || 0,
        t.remainingBudget || 0,
        t.activityCount || 0
      ]);
    } else if (activeTab === "BUDGET_SUMMARY") {
      filename = "tripnest-budget-summary.csv";
      headers = ["Trip ID", "Trip Name", "Total Budget", "Total Spent", "Remaining", "Utilization %", "Health Status"];
      rows = reportData.budgetSummary.map(b => [
        b.tripId,
        `"${b.tripName || ""}"`,
        b.totalBudget || 0,
        b.totalSpent || 0,
        b.remainingBudget || 0,
        `${b.utilizationPercentage || 0}%`,
        b.healthStatus || ""
      ]);
    } else if (activeTab === "EXPENSE_SUMMARY") {
      filename = "tripnest-expense-summary.csv";
      headers = ["Expense ID", "Trip Name", "Category", "Title", "Amount", "Date", "Notes"];
      rows = reportData.expenseSummary.map(e => [
        e.expenseId,
        `"${e.tripName || ""}"`,
        e.category || "",
        `"${e.title || ""}"`,
        e.amount || 0,
        e.date || "",
        `"${e.notes || ""}"`
      ]);
    } else if (activeTab === "STATUS_SUMMARY") {
      filename = "tripnest-status-summary.csv";
      headers = ["Status", "Count", "Percentage"];
      rows = reportData.statusSummary.map(s => [
        s.status,
        s.count,
        `${s.percentage}%`
      ]);
    } else if (activeTab === "ACTIVITY_SUMMARY") {
      filename = "tripnest-activity-summary.csv";
      headers = ["Activity ID", "Trip Name", "Activity Name", "Location", "Date", "Time", "Cost"];
      rows = reportData.activitySummary.map(a => [
        a.activityId,
        `"${a.tripName || ""}"`,
        `"${a.activityName || ""}"`,
        `"${a.location || ""}"`,
        a.date || "",
        a.time || "",
        a.cost || 0
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-dashboard-container">
      <Navbar />

      <div className="app-main-layout">
        <Sidebar />

        <main className="app-content-body">
          <div className="reports-root">
            {/* Header Card */}
            <div className="reports-header-card">
              <div className="reports-title-area">
                <h1>
                  <FaFileAlt style={{ color: "#0284C7" }} />
                  Travel & Financial Reports
                </h1>
                <p>Generate, filter, audit and export official TripNest summaries and metrics.</p>
              </div>
              <div className="reports-actions">
                <button className="report-action-btn" onClick={handlePrint} title="Print / Save as PDF">
                  <FaPrint /> Print View
                </button>
                <button className="report-action-btn primary" onClick={handleExportCSV} title="Export current tab to CSV">
                  <FaDownload /> Export CSV
                </button>
              </div>
            </div>

            {/* Overview KPI Cards */}
            <div className="reports-kpi-grid">
              <div className="report-kpi-card">
                <div className="report-kpi-icon" style={{ background: "#E0F2FE", color: "#0284C7" }}>
                  <FaSuitcase />
                </div>
                <div className="report-kpi-info">
                  <div className="kpi-label">Filtered Trips</div>
                  <div className="kpi-val">{reportData.tripSummary.length}</div>
                </div>
              </div>

              <div className="report-kpi-card">
                <div className="report-kpi-icon" style={{ background: "#DCFCE7", color: "#16A34A" }}>
                  <FaWallet />
                </div>
                <div className="report-kpi-info">
                  <div className="kpi-label">Total Allocated</div>
                  <div className="kpi-val">${totalBudget.toLocaleString()}</div>
                </div>
              </div>

              <div className="report-kpi-card">
                <div className="report-kpi-icon" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                  <FaReceipt />
                </div>
                <div className="report-kpi-info">
                  <div className="kpi-label">Total Expenses</div>
                  <div className="kpi-val">${totalSpent.toLocaleString()}</div>
                </div>
              </div>

              <div className="report-kpi-card">
                <div className="report-kpi-icon" style={{ background: "#F3E8FF", color: "#9333EA" }}>
                  <FaChartPie />
                </div>
                <div className="report-kpi-info">
                  <div className="kpi-label">Net Remaining</div>
                  <div className="kpi-val">${Math.max(0, totalRemaining).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="reports-filter-card">
              <div className="reports-filter-grid">
                <div className="filter-group">
                  <label>Filter by Trip</label>
                  <select value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)}>
                    <option value="">All Trips</option>
                    {tripsList.map((t) => (
                      <option key={t.tripId} value={t.tripId}>
                        {t.tripName} ({t.destinationName || "Trip #" + t.tripId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Trip Status</label>
                  <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Expense Category</label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>

                <div className="filter-group">
                  <label>End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>

                <div>
                  <button className="report-action-btn" onClick={handleResetFilters} style={{ width: "100%", justifyContent: "center" }}>
                    <FaRedo /> Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Report Tabs */}
            <div className="reports-tabs-wrap">
              <button
                className={`report-tab-btn ${activeTab === "TRIP_SUMMARY" ? "active" : ""}`}
                onClick={() => setActiveTab("TRIP_SUMMARY")}
              >
                <FaSuitcase /> Trip Summary
              </button>
              <button
                className={`report-tab-btn ${activeTab === "BUDGET_SUMMARY" ? "active" : ""}`}
                onClick={() => setActiveTab("BUDGET_SUMMARY")}
              >
                <FaWallet /> Budget Summary
              </button>
              <button
                className={`report-tab-btn ${activeTab === "EXPENSE_SUMMARY" ? "active" : ""}`}
                onClick={() => setActiveTab("EXPENSE_SUMMARY")}
              >
                <FaReceipt /> Expense Summary
              </button>
              <button
                className={`report-tab-btn ${activeTab === "STATUS_SUMMARY" ? "active" : ""}`}
                onClick={() => setActiveTab("STATUS_SUMMARY")}
              >
                <FaChartPie /> Status Breakdown
              </button>
              <button
                className={`report-tab-btn ${activeTab === "ACTIVITY_SUMMARY" ? "active" : ""}`}
                onClick={() => setActiveTab("ACTIVITY_SUMMARY")}
              >
                <FaCalendarCheck /> Activity Summary
              </button>
            </div>

            {/* Tab Content Cards */}
            <div className="report-table-card">
              {loading ? (
                <div className="report-empty-state">
                  <div className="spinner-border text-primary mb-3" role="status"></div>
                  <h3>Loading report data...</h3>
                </div>
              ) : error ? (
                <div className="report-empty-state">
                  <FaExclamationTriangle style={{ color: "#EF4444" }} />
                  <h3>{error}</h3>
                </div>
              ) : (
                <div className="report-table-responsive">
                  {/* TAB 1: TRIP SUMMARY */}
                  {activeTab === "TRIP_SUMMARY" && (
                    reportData.tripSummary.length === 0 ? (
                      <div className="report-empty-state">
                        <FaInfoCircle />
                        <h3>No trips match the selected filter criteria</h3>
                        <p>Try resetting the filter toolbar or creating a new trip.</p>
                      </div>
                    ) : (
                      <table className="tripnest-report-table">
                        <thead>
                          <tr>
                            <th>Trip Name</th>
                            <th>Destination</th>
                            <th>Dates</th>
                            <th>Status</th>
                            <th>Travelers</th>
                            <th>Budget</th>
                            <th>Spent</th>
                            <th>Remaining</th>
                            <th>Activities</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.tripSummary.map((t) => (
                            <tr key={t.tripId}>
                              <td style={{ fontWeight: 600 }}>{t.tripName}</td>
                              <td>{t.destination}</td>
                              <td>{t.startDate || "N/A"} → {t.endDate || "N/A"}</td>
                              <td>
                                <span className={`report-badge ${(t.status || "upcoming").toLowerCase()}`}>
                                  {t.status || "UPCOMING"}
                                </span>
                              </td>
                              <td>{t.numberOfTravelers}</td>
                              <td style={{ fontWeight: 600 }}>${Number(t.budgetAllocated).toLocaleString()}</td>
                              <td style={{ color: "#DC2626", fontWeight: 600 }}>${Number(t.totalExpenses).toLocaleString()}</td>
                              <td style={{ color: "#16A34A", fontWeight: 600 }}>${Number(t.remainingBudget).toLocaleString()}</td>
                              <td>{t.activityCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  )}

                  {/* TAB 2: BUDGET SUMMARY */}
                  {activeTab === "BUDGET_SUMMARY" && (
                    reportData.budgetSummary.length === 0 ? (
                      <div className="report-empty-state">
                        <FaInfoCircle />
                        <h3>No budget data found</h3>
                        <p>Set a budget for your trips to review financial health reports.</p>
                      </div>
                    ) : (
                      <table className="tripnest-report-table">
                        <thead>
                          <tr>
                            <th>Trip</th>
                            <th>Total Budget</th>
                            <th>Actual Spent</th>
                            <th>Remaining Balance</th>
                            <th>Utilization</th>
                            <th>Financial Health</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.budgetSummary.map((b) => (
                            <tr key={b.tripId}>
                              <td style={{ fontWeight: 600 }}>{b.tripName}</td>
                              <td>${Number(b.totalBudget).toLocaleString()}</td>
                              <td style={{ color: "#DC2626", fontWeight: 600 }}>${Number(b.totalSpent).toLocaleString()}</td>
                              <td style={{ color: b.remainingBudget < 0 ? "#DC2626" : "#16A34A", fontWeight: 600 }}>
                                ${Number(b.remainingBudget).toLocaleString()}
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div style={{ flex: 1, height: "6px", background: "#E2E8F0", borderRadius: "3px", overflow: "hidden" }}>
                                    <div
                                      style={{
                                        width: `${Math.min(100, b.utilizationPercentage)}%`,
                                        height: "100%",
                                        background: b.healthStatus === "OVER_BUDGET" ? "#DC2626" : b.healthStatus === "WARNING" ? "#F59E0B" : "#10B981"
                                      }}
                                    ></div>
                                  </div>
                                  <span style={{ fontSize: "12px", fontWeight: 600 }}>{b.utilizationPercentage}%</span>
                                </div>
                              </td>
                              <td>
                                <span className={`report-badge ${(b.healthStatus || "on-track").toLowerCase().replace("_", "-")}`}>
                                  {b.healthStatus === "OVER_BUDGET" ? "Over Budget" : b.healthStatus === "WARNING" ? "Warning (80%+)" : "On Track"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  )}

                  {/* TAB 3: EXPENSE SUMMARY */}
                  {activeTab === "EXPENSE_SUMMARY" && (
                    reportData.expenseSummary.length === 0 ? (
                      <div className="report-empty-state">
                        <FaInfoCircle />
                        <h3>No expenses recorded</h3>
                        <p>Add expenses in the Expenses module to see the audit trail here.</p>
                      </div>
                    ) : (
                      <table className="tripnest-report-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Trip</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.expenseSummary.map((e) => (
                            <tr key={e.expenseId}>
                              <td>{e.date || "N/A"}</td>
                              <td style={{ fontWeight: 600 }}>{e.tripName}</td>
                              <td>
                                <span className="report-badge upcoming">{e.category}</span>
                              </td>
                              <td style={{ fontWeight: 500 }}>{e.title}</td>
                              <td style={{ fontWeight: 700, color: "#DC2626" }}>${Number(e.amount).toLocaleString()}</td>
                              <td style={{ color: "#64748B" }}>{e.notes || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  )}

                  {/* TAB 4: STATUS SUMMARY */}
                  {activeTab === "STATUS_SUMMARY" && (
                    reportData.statusSummary.length === 0 ? (
                      <div className="report-empty-state">
                        <FaInfoCircle />
                        <h3>No status data available</h3>
                      </div>
                    ) : (
                      <table className="tripnest-report-table">
                        <thead>
                          <tr>
                            <th>Trip Status</th>
                            <th>Count</th>
                            <th>Share of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.statusSummary.map((s) => (
                            <tr key={s.status}>
                              <td style={{ fontWeight: 600 }}>
                                <span className={`report-badge ${(s.status || "").toLowerCase()}`}>
                                  {s.status}
                                </span>
                              </td>
                              <td style={{ fontWeight: 600 }}>{s.count}</td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div style={{ width: "150px", height: "8px", background: "#E2E8F0", borderRadius: "4px", overflow: "hidden" }}>
                                    <div
                                      style={{
                                        width: `${s.percentage}%`,
                                        height: "100%",
                                        background: "#0284C7"
                                      }}
                                    ></div>
                                  </div>
                                  <span style={{ fontSize: "12px", fontWeight: 600 }}>{s.percentage}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  )}

                  {/* TAB 5: ACTIVITY SUMMARY */}
                  {activeTab === "ACTIVITY_SUMMARY" && (
                    reportData.activitySummary.length === 0 ? (
                      <div className="report-empty-state">
                        <FaInfoCircle />
                        <h3>No travel activities planned yet</h3>
                        <p>Add scheduled activities to itineraries to see them aggregated here.</p>
                      </div>
                    ) : (
                      <table className="tripnest-report-table">
                        <thead>
                          <tr>
                            <th>Activity Name</th>
                            <th>Associated Trip</th>
                            <th>Location</th>
                            <th>Scheduled Time</th>
                            <th>Estimated Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.activitySummary.map((a) => (
                            <tr key={a.activityId}>
                              <td style={{ fontWeight: 600 }}>{a.activityName}</td>
                              <td>{a.tripName}</td>
                              <td>{a.location || "N/A"}</td>
                              <td>{a.time ? a.time.substring(0, 5) : "Flexible"}</td>
                              <td style={{ fontWeight: 600 }}>
                                {a.cost && Number(a.cost) > 0 ? `$${Number(a.cost).toLocaleString()}` : "Free"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Reports;
