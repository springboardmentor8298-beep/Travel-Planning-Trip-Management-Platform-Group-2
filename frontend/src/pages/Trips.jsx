import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TripCard from "../components/TripCard";
import api from "../services/api";
import {
  FaSearch,
  FaPlus,
  FaSuitcase,
  FaTrashAlt,
  FaEye,
  FaEdit,
  FaUserFriends,
  FaShareAlt,
  FaCopy,
  FaThLarge,
  FaList,
  FaSortAmountDown,
  FaCheck,
  FaCalendarAlt,
  FaChartLine,
} from "react-icons/fa";
import "../styles/AppLayout.css";

const CATEGORY_TABS = [
  { key: "UPCOMING", label: "Upcoming Trips" },
  { key: "ONGOING", label: "Current Trips" },
  { key: "COMPLETED", label: "Completed Trips" },
  { key: "CANCELLED", label: "Cancelled Trips" },
  { key: "PLANNING", label: "Planning" },
  { key: "ARCHIVED", label: "Archived" },
  { key: "ALL", label: "All Trips" },
];

function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Filter, Search, Sort states
  const [activeTab, setActiveTab] = useState("UPCOMING");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("startDate");
  const [viewMode, setViewMode] = useState("grid");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tripToDelete, setTripToDelete] = useState({ id: null, name: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  const [shareModalTrip, setShareModalTrip] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/trips?status=${activeTab}&search=${encodeURIComponent(searchTerm)}&sortBy=${sortBy}`
      );
      setTrips(response.data);
    } catch (err) {
      setError("Failed to fetch trips. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [activeTab, searchTerm, sortBy]);

  const handleDeleteClick = (id, name) => {
    setTripToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!tripToDelete.id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/trips/${tripToDelete.id}`);
      setAlert({ type: "success", message: `Trip "${tripToDelete.name}" deleted successfully.` });
      setTrips(trips.filter((t) => t.tripId !== tripToDelete.id));
      setShowDeleteModal(false);
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to delete trip. Please try again." });
    } finally {
      setIsDeleting(false);
      setTripToDelete({ id: null, name: "" });
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const handleDuplicate = async (tripId) => {
    try {
      const response = await api.post(`/trips/${tripId}/duplicate`);
      setAlert({ type: "success", message: `Trip duplicated as "${response.data.tripName}"!` });
      fetchTrips();
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to duplicate trip." });
    } finally {
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const handleArchive = async (tripId) => {
    try {
      const response = await api.patch(`/trips/${tripId}/archive`);
      setAlert({ type: "success", message: `Trip status updated to ${response.data.status}!` });
      fetchTrips();
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to update trip archive status." });
    } finally {
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const handleShareClick = (trip) => {
    setShareModalTrip(trip);
    setCopiedLink(false);
  };

  const copyShareLink = () => {
    if (!shareModalTrip) return;
    const shareUrl = `${window.location.origin}/trips/${shareModalTrip.tripId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrips = trips.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(trips.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Metrics for Hero Banner
  const totalTripsCount = trips.length;
  const upcomingCount = trips.filter((t) => t.status === "UPCOMING" || t.status === "PLANNING").length;
  const completedCount = trips.filter((t) => t.status === "COMPLETED").length;
  const totalBudgetAllocated = trips.reduce((acc, t) => acc + (t.budgetAllocated || 0), 0);

  return (
    <div className="app-dashboard-container">
      <Navbar />

      <div className="app-main-layout">
        <Sidebar />

        <main className="app-content-body">
          {/* Hero Banner Section */}
          <div className="app-hero-banner">
            <div>
              <span className="badge bg-primary px-3 py-1 mb-2" style={{ borderRadius: "8px", fontSize: "11px" }}>
                TRIPNEST PLATFORM
              </span>
              <h1 className="text-dark mb-1 h2 font-weight-bold">My Journeys & Itineraries</h1>
              <p className="app-page-subtitle mb-0">
                Track, plan, and organize your global travels with real-time budget and schedule controls.
              </p>
            </div>

            <div className="app-hero-stats-group d-none d-lg-flex">
              <div className="app-hero-stat-card">
                <span className="app-hero-stat-value">{totalTripsCount}</span>
                <span className="app-hero-stat-label">Total Trips</span>
              </div>
              <div className="app-hero-stat-card">
                <span className="app-hero-stat-value text-info">{upcomingCount}</span>
                <span className="app-hero-stat-label">Upcoming</span>
              </div>
              <div className="app-hero-stat-card">
                <span className="app-hero-stat-value text-success">{completedCount}</span>
                <span className="app-hero-stat-label">Completed</span>
              </div>
              <div className="app-hero-stat-card">
                <span className="app-hero-stat-value text-warning">${totalBudgetAllocated.toLocaleString()}</span>
                <span className="app-hero-stat-label">Total Budget</span>
              </div>
            </div>
          </div>

          {/* Page Header Bar */}
          <div className="app-page-header">
            <div className="app-page-title-wrap">
              <h2 className="h3 text-dark font-weight-bold mb-1">Trip Overview</h2>
              <p className="app-page-subtitle">Filter trips by status or search across all itineraries.</p>
            </div>

            <Link to="/trips/create" className="app-primary-btn text-decoration-none">
              <FaPlus /> Create Trip
            </Link>
          </div>

          {alert.message && (
            <div className={`app-alert-banner app-alert-${alert.type}`} role="alert">
              {alert.message}
            </div>
          )}

          {error && (
            <div className="app-alert-banner app-alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Animated Category Tabs */}
          <div className="app-category-tabs-bar">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`app-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                type="button"
              >
                {tab.label}
                {activeTab === tab.key && <div className="app-tab-active-indicator" />}
              </button>
            ))}
          </div>

          {/* Search, Sort & View Mode Bar */}
          <div className="app-glass-card p-3 mb-4">
            <div className="d-flex align-items-center gap-3 flex-wrap flex-md-nowrap w-100">
              {/* Search Bar */}
              <div className="flex-grow-1" style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search by trip name, destination, or description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="app-form-input ps-5"
                  aria-label="Search trips"
                />
                <FaSearch style={{ position: "absolute", left: "16px", top: "17px", color: "#64748B" }} />
              </div>

              {/* Sort Dropdown */}
              <div className="d-flex align-items-center gap-2" style={{ minWidth: "220px" }}>
                <FaSortAmountDown className="text-primary" />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="app-form-select"
                  aria-label="Sort Trips By"
                >
                  <option value="startDate">Sort by Start Date</option>
                  <option value="endDate">Sort by End Date</option>
                  <option value="budget">Sort by Budget</option>
                  <option value="name">Sort by Trip Name</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>

              {/* View Mode Toggle Buttons (Grid vs Table) */}
              <div className="btn-group" role="group" aria-label="View Mode">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-outline-secondary"}`}
                  title="Grid View"
                  style={{ borderRadius: "10px 0 0 10px", padding: "10px 16px" }}
                >
                  <FaThLarge />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`btn btn-sm ${viewMode === "table" ? "btn-primary" : "btn-outline-secondary"}`}
                  title="Table View"
                  style={{ borderRadius: "0 10px 10px 0", padding: "10px 16px" }}
                >
                  <FaList />
                </button>
              </div>
            </div>
          </div>

          {/* Content View */}
          {loading ? (
            <div className="row g-4 mb-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="col-12 col-md-6 col-lg-4">
                  <div className="app-glass-card p-4">
                    <div className="skeleton-loader mb-3" style={{ height: "180px", borderRadius: "12px" }} />
                    <div className="skeleton-loader mb-2" style={{ height: "24px", width: "70%" }} />
                    <div className="skeleton-loader mb-2" style={{ height: "16px", width: "40%" }} />
                    <div className="skeleton-loader" style={{ height: "16px", width: "90%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : currentTrips.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === "grid" ? (
                /* GRID CARD VIEW */
                <div className="row g-4 mb-4">
                  {currentTrips.map((trip) => (
                    <div key={trip.tripId} className="col-12 col-md-6 col-lg-4">
                      <TripCard
                        trip={trip}
                        onDeleteClick={handleDeleteClick}
                        onShareClick={handleShareClick}
                        onDuplicateClick={handleDuplicate}
                        onArchiveClick={handleArchive}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* TABLE VIEW */
                <div className="app-table-wrapper mb-4">
                  <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>TRIP NAME</th>
                          <th>DESTINATION</th>
                          <th>DATES</th>
                          <th>TRAVELERS</th>
                          <th>BUDGET</th>
                          <th>PROGRESS</th>
                          <th>STATUS</th>
                          <th className="text-end">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTrips.map((trip) => (
                          <tr key={trip.tripId}>
                            <td>
                              <strong className="text-white" style={{ fontSize: "15px" }}>{trip.tripName}</strong>
                            </td>
                            <td>
                              {trip.destinationId ? (
                                <Link to={`/destinations/${trip.destinationId}`} className="text-info text-decoration-none font-weight-bold">
                                  {trip.destinationName}
                                </Link>
                              ) : (
                                <span className="text-muted">Not specified</span>
                              )}
                            </td>
                            <td style={{ fontSize: "14px", color: "#CBD5E1" }}>
                              {trip.startDate} to {trip.endDate}
                            </td>
                            <td>
                              <span className="d-flex align-items-center gap-2 text-white">
                                <FaUserFriends className="text-info" /> {trip.numberOfTravelers}
                              </span>
                            </td>
                            <td>
                              <strong className="text-white" style={{ fontSize: "16px" }}>
                                ${trip.budgetAllocated}
                              </strong>
                            </td>
                            <td>
                              <div style={{ width: "90px" }}>
                                <div className="progress" style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.08)" }}>
                                  <div
                                    className="progress-bar bg-primary"
                                    style={{ width: `${trip.progressPercentage || 0}%` }}
                                  />
                                </div>
                                <span style={{ fontSize: "11px", color: "#94A3B8" }}>{trip.progressPercentage || 0}%</span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge px-3 py-2 ${
                                  trip.status === "COMPLETED" ? "bg-success" :
                                  trip.status === "CANCELLED" ? "bg-danger" :
                                  trip.status === "ACTIVE" || trip.status === "ONGOING" ? "bg-primary" :
                                  trip.status === "ARCHIVED" ? "bg-secondary" :
                                  trip.status === "PLANNING" ? "bg-info" : "bg-warning text-dark"
                                }`}
                                style={{ borderRadius: "10px", fontSize: "12px" }}
                              >
                                {trip.status || "UPCOMING"}
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="d-inline-flex gap-1">
                                <Link
                                  to={`/trips/${trip.tripId}`}
                                  className="btn btn-sm btn-outline-info"
                                  style={{ borderRadius: "8px", padding: "6px 10px" }}
                                  title="View Details"
                                >
                                  <FaEye />
                                </Link>
                                <Link
                                  to={`/trips/edit/${trip.tripId}`}
                                  className="btn btn-sm btn-outline-warning"
                                  style={{ borderRadius: "8px", padding: "6px 10px" }}
                                  title="Edit Trip"
                                >
                                  <FaEdit />
                                </Link>
                                <button
                                  onClick={() => handleShareClick(trip)}
                                  className="btn btn-sm btn-outline-info"
                                  style={{ borderRadius: "8px", padding: "6px 10px" }}
                                  type="button"
                                  title="Share Trip"
                                >
                                  <FaShareAlt />
                                </button>
                                <button
                                  onClick={() => handleDuplicate(trip.tripId)}
                                  className="btn btn-sm btn-outline-secondary"
                                  style={{ borderRadius: "8px", padding: "6px 10px" }}
                                  type="button"
                                  title="Duplicate Trip"
                                >
                                  <FaCopy />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(trip.tripId, trip.tripName)}
                                  className="btn btn-sm btn-outline-danger"
                                  style={{ borderRadius: "8px", padding: "6px 10px" }}
                                  type="button"
                                  title="Delete Trip"
                                >
                                  <FaTrashAlt />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="d-flex justify-content-center mt-4">
                  <ul className="pagination gap-2 border-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="page-link bg-dark text-white border-0"
                        style={{ height: "44px", borderRadius: "10px" }}
                        type="button"
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => (
                      <li key={index + 1} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                        <button
                          onClick={() => handlePageChange(index + 1)}
                          className={`page-link border-0 ${currentPage === index + 1 ? "bg-primary text-white" : "bg-dark text-white"}`}
                          style={{ height: "44px", width: "44px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          type="button"
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="page-link bg-dark text-white border-0"
                        style={{ height: "44px", borderRadius: "10px" }}
                        type="button"
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </motion.div>
          ) : (
            <div className="app-glass-card text-center p-5">
              <FaSuitcase className="text-muted mb-3" style={{ fontSize: "3.5rem" }} />
              <h2 className="h3 text-dark font-weight-bold">No Trips Found</h2>
              <p className="text-secondary-text mb-4" style={{ fontSize: "16px" }}>
                {searchTerm || activeTab !== "ALL"
                  ? "No trips match your current tab category or search query."
                  : "You haven't planned any trips yet. Create your first adventure now!"}
              </p>
              <Link to="/trips/create" className="app-primary-btn text-decoration-none">
                <FaPlus /> Plan New Trip
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* Delete Modal Dialog */}
      {showDeleteModal && (
        <div className="app-modal-overlay" role="dialog" aria-modal="true">
          <motion.div
            className="app-modal-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <header className="app-modal-header">
              <h2 className="app-modal-title text-dark">Delete Trip</h2>
            </header>
            <div className="app-modal-body">
              Are you sure you want to delete <strong>{tripToDelete.name}</strong>? This action cannot be undone.
            </div>
            <footer className="app-modal-footer">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="app-secondary-btn"
                type="button"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-danger"
                style={{ height: "50px", borderRadius: "12px", padding: "0 24px", fontWeight: "600" }}
                type="button"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </footer>
          </motion.div>
        </div>
      )}

      {/* Share Modal Dialog */}
      {shareModalTrip && (
        <div className="app-modal-overlay" role="dialog" aria-modal="true">
          <motion.div
            className="app-modal-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <header className="app-modal-header">
              <h2 className="app-modal-title text-dark">Share Trip</h2>
            </header>
            <div className="app-modal-body">
              <p className="text-dark mb-2" style={{ fontWeight: "700" }}>{shareModalTrip.tripName}</p>
              <p className="text-muted mb-3" style={{ fontSize: "14px" }}>
                Destination: {shareModalTrip.destinationName} ({shareModalTrip.startDate} to {shareModalTrip.endDate})
              </p>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/trips/${shareModalTrip.tripId}`}
                  className="app-form-input text-secondary-text"
                  style={{ fontSize: "13px" }}
                />
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="btn btn-primary text-nowrap d-flex align-items-center gap-2"
                  style={{ borderRadius: "10px", padding: "0 18px" }}
                >
                  {copiedLink ? <FaCheck /> : <FaCopy />}
                  {copiedLink ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
            <footer className="app-modal-footer">
              <button
                onClick={() => setShareModalTrip(null)}
                className="app-secondary-btn"
                type="button"
              >
                Close
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Trips;