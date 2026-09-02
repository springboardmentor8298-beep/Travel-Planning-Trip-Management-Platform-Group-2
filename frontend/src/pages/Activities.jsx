import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  FaClock,
  FaMapMarkerAlt,
  FaBell,
  FaSearch,
  FaWalking,
  FaUtensils,
  FaPlane,
  FaHotel,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaSuitcase,
  FaShoppingBag,
  FaTheaterMasks,
  FaCampground,
  FaCheckCircle,
  FaTimesCircle,
  FaDollarSign
} from "react-icons/fa";
import "../styles/AppLayout.css";

const ACTIVITY_CATEGORIES = [
  { value: "ALL", label: "All Categories", icon: <FaClock /> },
  { value: "SIGHTSEEING", label: "Sightseeing", icon: <FaWalking /> },
  { value: "ADVENTURE", label: "Adventure", icon: <FaCampground /> },
  { value: "TRANSPORTATION", label: "Transportation", icon: <FaPlane /> },
  { value: "ACCOMMODATION", label: "Accommodation", icon: <FaHotel /> },
  { value: "FOOD", label: "Food & Dining", icon: <FaUtensils /> },
  { value: "SHOPPING", label: "Shopping", icon: <FaShoppingBag /> },
  { value: "ENTERTAINMENT", label: "Entertainment", icon: <FaTheaterMasks /> }
];

function Activities() {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("ALL");
  const [allActivities, setAllActivities] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [alert, setAlert] = useState("");

  // Load Trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await api.get("/trips");
        setTrips(response.data);
      } catch (err) {
        setAlert("Failed to fetch user trips.");
      } finally {
        setLoadingTrips(false);
      }
    };
    fetchTrips();
  }, []);

  // Fetch activities for selected trip or all trips
  useEffect(() => {
    const loadMasterActivities = async () => {
      setLoadingActivities(true);
      try {
        let tripsToLoad = trips;
        if (selectedTripId !== "ALL") {
          tripsToLoad = trips.filter(t => t.tripId.toString() === selectedTripId);
        }

        const masterList = [];
        for (const trip of tripsToLoad) {
          try {
            const itinResp = await api.get(`/itineraries?tripId=${trip.tripId}`);
            for (const day of itinResp.data) {
              try {
                const actResp = await api.get(`/activities?itineraryId=${day.itineraryId}`);
                const acts = actResp.data.map(act => ({
                  ...act,
                  tripId: trip.tripId,
                  tripName: trip.tripName,
                  dayNumber: day.dayNumber,
                  itineraryTitle: day.itineraryTitle
                }));
                masterList.push(...acts);
              } catch (e) {
                console.error("Error loading activities for day", e);
              }
            }
          } catch (e) {
            console.error("Error loading itineraries for trip", e);
          }
        }

        masterList.sort((a, b) => {
          if (a.tripName !== b.tripName) return a.tripName.localeCompare(b.tripName);
          if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
          return (a.activityTime || "").localeCompare(b.activityTime || "");
        });

        setAllActivities(masterList);
      } catch (err) {
        setAlert("Failed to load master activities.");
      } finally {
        setLoadingActivities(false);
      }
    };

    if (trips.length >= 0) {
      loadMasterActivities();
    }
  }, [selectedTripId, trips]);

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      await api.delete(`/activities/${activityId}`);
      setAllActivities(allActivities.filter(a => a.activityId !== activityId));
    } catch (err) {
      setAlert("Failed to delete activity.");
    }
  };

  const handleStatusToggle = async (activityId, currentStatus) => {
    const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      const response = await api.patch(`/activities/${activityId}/status?status=${nextStatus}`);
      setAllActivities(allActivities.map(a => a.activityId === activityId ? { ...a, status: response.data.status } : a));
    } catch (err) {
      console.error("Failed to toggle activity status", err);
    }
  };

  const getActivityTypeIcon = (type) => {
    const config = ACTIVITY_CATEGORIES.find(a => a.value === type);
    return config ? config.icon : <FaClock />;
  };

  const formatActivityTime = (time) => {
    if (!time) return "Flexible";
    const parts = time.split(":");
    const hours = parseInt(parts[0]);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${parts[1]} ${ampm}`;
  };

  const filteredActivities = allActivities.filter(act => {
    const matchesSearch =
      act.activityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.placeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.tripName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || act.activityType === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || (act.status || "PENDING") === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
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
              <h1 className="app-page-title">Activities Schedule</h1>
              <p className="app-page-subtitle">A consolidated master view of all your planned activities and events.</p>
            </div>
          </div>

          {alert && (
            <div className="app-alert-banner app-alert-danger" role="alert">
              {alert}
            </div>
          )}

          {/* FILTERS ROW */}
          <div className="app-glass-card p-3 mb-4">
            <div className="row g-3 align-items-center">
              {/* Trip Select */}
              <div className="col-12 col-md-3">
                <label className="text-muted small mb-1">Filter by Trip</label>
                {loadingTrips ? (
                  <div className="text-muted">Loading trips...</div>
                ) : (
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="app-form-select"
                  >
                    <option value="ALL">All Trips</option>
                    {trips.map(t => (
                      <option key={t.tripId} value={t.tripId.toString()}>
                        {t.tripName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Category Filter */}
              <div className="col-12 col-md-3">
                <label className="text-muted small mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="app-form-select"
                >
                  {ACTIVITY_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="col-12 col-md-3">
                <label className="text-muted small mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="app-form-select"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="col-12 col-md-3">
                <label className="text-muted small mb-1">Search</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Search activity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="app-form-input ps-5"
                  />
                  <FaSearch style={{ position: "absolute", left: "14px", top: "16px", color: "#64748B" }} />
                </div>
              </div>
            </div>
          </div>

          {/* MASTER ACTIVITY CARDS */}
          {loadingActivities ? (
            <div className="app-loader-box">
              <div className="spinner-border text-primary" role="status"></div>
              <span>Consolidating master activity schedule...</span>
            </div>
          ) : filteredActivities.length > 0 ? (
            <motion.div
              className="row g-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence>
                {filteredActivities.map((act) => (
                  <div key={act.activityId} className="col-12 col-md-6 col-lg-4">
                    <motion.div
                      className="app-glass-card h-100 d-flex flex-column justify-content-between"
                      whileHover={{ y: -6, boxShadow: "0 20px 40px -15px rgba(37, 99, 235, 0.35)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div>
                        {/* Day, Trip & Time badges */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <span className="badge bg-primary me-2 px-2 py-1" style={{ borderRadius: "8px", fontSize: "0.75rem" }}>
                              DAY {act.dayNumber}
                            </span>
                            <span className="badge bg-dark border border-secondary text-light px-2 py-1" style={{ borderRadius: "8px", fontSize: "0.75rem" }}>
                              {act.tripName}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(act.activityId, act.status)}
                            className={`badge border text-uppercase px-2 py-1 btn btn-sm text-decoration-none ${
                              act.status === "COMPLETED"
                                ? "bg-success-subtle text-success border-success"
                                : act.status === "CANCELLED"
                                ? "bg-danger-subtle text-danger border-danger"
                                : "bg-warning-subtle text-warning border-warning"
                            }`}
                            style={{ borderRadius: "8px", fontSize: "0.75rem" }}
                          >
                            {act.status || "PENDING"}
                          </button>
                        </div>

                        {/* Activity Name & Details */}
                        <div className="d-flex gap-3 align-items-start mb-3">
                          <div
                            className="p-3 bg-dark rounded-3 text-primary d-flex align-items-center justify-content-center"
                            style={{ fontSize: "1.3rem", width: "48px", height: "48px", flexShrink: 0, border: "1px solid #334155" }}
                          >
                            {getActivityTypeIcon(act.activityType)}
                          </div>
                          <div>
                            <h3 className={`h5 text-white mb-1 ${act.status === "COMPLETED" ? "text-decoration-line-through text-muted" : ""}`} style={{ fontWeight: "700" }}>
                              {act.activityName}
                            </h3>
                            <span className="text-muted d-block" style={{ fontSize: "0.85rem" }}>{act.itineraryTitle}</span>
                          </div>
                        </div>

                        {/* Time & Location */}
                        <div className="d-flex flex-column gap-2 text-secondary-text mb-3" style={{ fontSize: "0.9rem" }}>
                          <div className="d-flex align-items-center gap-2">
                            <FaClock className="text-info" />
                            <span>{formatActivityTime(act.activityTime)} {act.endTime ? `- ${formatActivityTime(act.endTime)}` : ""}</span>
                          </div>
                          {act.placeName && (
                            <div className="d-flex align-items-center gap-2">
                              <FaMapMarkerAlt className="text-danger flex-shrink-0" />
                              <span>{act.placeName}</span>
                            </div>
                          )}
                          {act.estimatedCost > 0 && (
                            <div className="d-flex align-items-center gap-2 text-success fw-bold">
                              <FaDollarSign />
                              <span>${act.estimatedCost}</span>
                            </div>
                          )}
                        </div>

                        {/* Category & Reminder Badges */}
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                          <span className="badge bg-dark border border-secondary text-info px-2 py-1" style={{ borderRadius: "8px", fontSize: "0.75rem" }}>
                            {act.activityType || "GENERAL"}
                          </span>
                          {act.reminder && (
                            <span className="badge bg-warning-subtle text-warning border border-warning px-2 py-1 d-inline-flex align-items-center gap-1" style={{ borderRadius: "8px", fontSize: "0.75rem" }}>
                              <FaBell /> Reminder
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(act.activityId, act.status)}
                          className="btn btn-sm btn-link text-decoration-none p-0 text-info"
                          style={{ fontSize: "13px" }}
                        >
                          {act.status === "COMPLETED" ? <><FaTimesCircle /> Mark Pending</> : <><FaCheckCircle /> Mark Done</>}
                        </button>

                        <div className="d-flex gap-2">
                          <Link
                            to={`/itinerary?tripId=${act.tripId}`}
                            className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                            style={{ borderRadius: "8px", padding: "4px 10px", fontSize: "13px" }}
                            title="Edit Activity"
                          >
                            <FaEdit /> Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteActivity(act.activityId)}
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                            style={{ borderRadius: "8px", padding: "4px 10px", fontSize: "13px" }}
                            type="button"
                            title="Delete Activity"
                          >
                            <FaTrashAlt /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* EMPTY STATE */
            <div className="app-glass-card text-center p-5">
              <FaSuitcase className="text-muted mb-3" style={{ fontSize: "3rem" }} />
              <h2 className="h3 text-dark mb-2" style={{ fontWeight: "700" }}>No Activities Found</h2>
              <p className="text-muted mb-4" style={{ fontSize: "16px" }}>
                No activities match your current search filters or trip selection.
              </p>
              {selectedTripId !== "ALL" && (
                <Link to={`/itinerary?tripId=${selectedTripId}`} className="app-primary-btn text-decoration-none">
                  <FaPlus /> Schedule Activity
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Activities;