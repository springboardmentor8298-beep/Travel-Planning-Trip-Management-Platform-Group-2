import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaClock,
  FaMapMarkerAlt,
  FaCalendarPlus,
  FaWalking,
  FaUtensils,
  FaPlane,
  FaHotel,
  FaExclamationTriangle,
  FaSun,
  FaCloudSun,
  FaMoon,
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowUp,
  FaArrowDown,
  FaShoppingBag,
  FaTheaterMasks,
  FaCampground,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "../styles/AppLayout.css";

const ACTIVITY_CATEGORIES = [
  { value: "SIGHTSEEING", label: "Sightseeing", icon: <FaWalking /> },
  { value: "ADVENTURE", label: "Adventure", icon: <FaCampground /> },
  { value: "TRANSPORTATION", label: "Transportation", icon: <FaPlane /> },
  { value: "ACCOMMODATION", label: "Accommodation", icon: <FaHotel /> },
  { value: "FOOD", label: "Food & Dining", icon: <FaUtensils /> },
  { value: "SHOPPING", label: "Shopping", icon: <FaShoppingBag /> },
  { value: "ENTERTAINMENT", label: "Entertainment", icon: <FaTheaterMasks /> }
];

function Itinerary() {
  const [searchParams] = useSearchParams();
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [tripDetails, setTripDetails] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [activitiesByDay, setActivitiesByDay] = useState({});
  const [expandedDays, setExpandedDays] = useState({});

  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Day Modal State
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [itineraryForm, setItineraryForm] = useState({ id: null, dayNumber: "", itineraryTitle: "", description: "" });

  // Activity Modal State
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedItineraryId, setSelectedItineraryId] = useState(null);
  const [activityForm, setActivityForm] = useState({
    id: null,
    activityName: "",
    activityType: "SIGHTSEEING",
    placeName: "",
    activityTime: "09:00",
    endTime: "10:30",
    timeSlot: "MORNING",
    estimatedCost: "",
    status: "PENDING",
    description: "",
    notes: "",
    reminder: false
  });

  // Load Trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await api.get("/trips");
        setTrips(response.data);

        const queryTripId = searchParams.get("tripId");
        if (queryTripId) {
          setSelectedTripId(queryTripId);
        } else if (response.data.length > 0) {
          setSelectedTripId(response.data[0].tripId.toString());
        }
      } catch (err) {
        setAlert({ type: "danger", message: "Failed to fetch trips." });
      } finally {
        setLoadingTrips(false);
      }
    };
    fetchTrips();
  }, [searchParams]);

  // Load Itineraries & Activities for Selected Trip
  useEffect(() => {
    if (!selectedTripId) {
      setTripDetails(null);
      setItineraries([]);
      return;
    }

    const loadItineraryData = async () => {
      setLoadingItinerary(true);
      try {
        const foundTrip = trips.find(t => t.tripId.toString() === selectedTripId);
        if (foundTrip) setTripDetails(foundTrip);

        const response = await api.get(`/itineraries?tripId=${selectedTripId}`);
        const days = response.data;
        setItineraries(days);

        const expandMap = {};
        const activitiesMap = {};
        for (const day of days) {
          expandMap[day.itineraryId] = true;
          try {
            const actResp = await api.get(`/activities?itineraryId=${day.itineraryId}`);
            activitiesMap[day.itineraryId] = actResp.data;
          } catch (e) {
            console.error("Error loading activities for day: " + day.itineraryId, e);
          }
        }
        setExpandedDays(expandMap);
        setActivitiesByDay(activitiesMap);
      } catch (err) {
        setAlert({ type: "danger", message: "Failed to load itinerary details." });
      } finally {
        setLoadingItinerary(false);
      }
    };

    loadItineraryData();
  }, [selectedTripId, trips]);

  const handleTripChange = (e) => {
    setSelectedTripId(e.target.value);
    setAlert({ type: "", message: "" });
  };

  const toggleDayExpanded = (dayId) => {
    setExpandedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  const openItineraryModal = (day = null) => {
    if (day) {
      setItineraryForm({
        id: day.itineraryId,
        dayNumber: day.dayNumber,
        itineraryTitle: day.itineraryTitle,
        description: day.description || ""
      });
    } else {
      const nextDay = itineraries.length > 0 ? Math.max(...itineraries.map(i => i.dayNumber)) + 1 : 1;
      setItineraryForm({ id: null, dayNumber: nextDay, itineraryTitle: "", description: "" });
    }
    setShowItineraryModal(true);
  };

  const handleItinerarySubmit = async (e) => {
    e.preventDefault();
    if (!itineraryForm.dayNumber || !itineraryForm.itineraryTitle.trim()) {
      setAlert({ type: "danger", message: "Day Number and Title are required." });
      return;
    }

    try {
      const payload = {
        dayNumber: parseInt(itineraryForm.dayNumber),
        itineraryTitle: itineraryForm.itineraryTitle,
        description: itineraryForm.description,
        trip: { tripId: parseInt(selectedTripId) }
      };

      if (itineraryForm.id) {
        const response = await api.put(`/itineraries/${itineraryForm.id}`, payload);
        setItineraries(itineraries.map(i => i.itineraryId === itineraryForm.id ? response.data : i));
        setAlert({ type: "success", message: "Day itinerary updated successfully." });
      } else {
        const response = await api.post("/itineraries", payload);
        const newDays = [...itineraries, response.data].sort((a, b) => a.dayNumber - b.dayNumber);
        setItineraries(newDays);
        setExpandedDays(prev => ({ ...prev, [response.data.itineraryId]: true }));
        setActivitiesByDay({ ...activitiesByDay, [response.data.itineraryId]: [] });
        setAlert({ type: "success", message: "New day plan created successfully!" });
      }
      setShowItineraryModal(false);
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to save itinerary day." });
    } finally {
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const handleDeleteItinerary = async (dayId) => {
    if (!window.confirm("Are you sure you want to delete this day?")) return;

    try {
      await api.delete(`/itineraries/${dayId}`);
      setItineraries(itineraries.filter(i => i.itineraryId !== dayId));
      setAlert({ type: "success", message: "Day deleted successfully." });
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to delete itinerary day." });
    } finally {
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const openActivityModal = (itineraryId, slot = "MORNING", activity = null) => {
    setSelectedItineraryId(itineraryId);
    if (activity) {
      setActivityForm({
        id: activity.activityId,
        activityName: activity.activityName,
        activityType: activity.activityType || "SIGHTSEEING",
        placeName: activity.placeName || "",
        activityTime: activity.activityTime ? activity.activityTime.substring(0, 5) : "09:00",
        endTime: activity.endTime ? activity.endTime.substring(0, 5) : "10:30",
        timeSlot: activity.timeSlot || slot,
        estimatedCost: activity.estimatedCost !== undefined && activity.estimatedCost !== null ? activity.estimatedCost.toString() : "",
        status: activity.status || "PENDING",
        description: activity.description || "",
        notes: activity.notes || "",
        reminder: activity.reminder || false
      });
    } else {
      setActivityForm({
        id: null,
        activityName: "",
        activityType: "SIGHTSEEING",
        placeName: "",
        activityTime: slot === "MORNING" ? "09:00" : slot === "AFTERNOON" ? "14:00" : "19:00",
        endTime: slot === "MORNING" ? "11:00" : slot === "AFTERNOON" ? "16:00" : "21:00",
        timeSlot: slot,
        estimatedCost: "",
        status: "PENDING",
        description: "",
        notes: "",
        reminder: false
      });
    }
    setShowActivityModal(true);
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    if (!activityForm.activityName.trim() || !activityForm.activityTime) {
      setAlert({ type: "danger", message: "Activity Name and Start Time are required." });
      return;
    }

    try {
      const startTimeStr = activityForm.activityTime.length === 5 ? `${activityForm.activityTime}:00` : activityForm.activityTime;
      const endTimeStr = activityForm.endTime ? (activityForm.endTime.length === 5 ? `${activityForm.endTime}:00` : activityForm.endTime) : null;
      
      const payload = {
        activityName: activityForm.activityName,
        activityType: activityForm.activityType,
        placeName: activityForm.placeName,
        activityTime: startTimeStr,
        endTime: endTimeStr,
        timeSlot: activityForm.timeSlot,
        estimatedCost: activityForm.estimatedCost !== "" ? parseFloat(activityForm.estimatedCost) : 0,
        status: activityForm.status,
        description: activityForm.description,
        notes: activityForm.notes,
        reminder: activityForm.reminder,
        itinerary: { itineraryId: selectedItineraryId }
      };

      if (activityForm.id) {
        const response = await api.put(`/activities/${activityForm.id}`, payload);
        const dayActivities = activitiesByDay[selectedItineraryId] || [];
        const updatedList = dayActivities.map(a => a.activityId === activityForm.id ? response.data : a);
        setActivitiesByDay({ ...activitiesByDay, [selectedItineraryId]: updatedList });
        setAlert({ type: "success", message: "Activity updated successfully." });
      } else {
        const response = await api.post("/activities", payload);
        const dayActivities = activitiesByDay[selectedItineraryId] || [];
        const updatedList = [...dayActivities, response.data];
        setActivitiesByDay({ ...activitiesByDay, [selectedItineraryId]: updatedList });
        setAlert({ type: "success", message: "Activity scheduled successfully." });
      }
      setShowActivityModal(false);
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to save activity." });
    } finally {
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const handleDeleteActivity = async (itineraryId, activityId) => {
    if (!window.confirm("Delete this activity?")) return;

    try {
      await api.delete(`/activities/${activityId}`);
      const dayActivities = activitiesByDay[itineraryId] || [];
      setActivitiesByDay({
        ...activitiesByDay,
        [itineraryId]: dayActivities.filter(a => a.activityId !== activityId)
      });
      setAlert({ type: "success", message: "Activity removed." });
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to remove activity." });
    } finally {
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const handleToggleActivityStatus = async (itineraryId, activityId, currentStatus) => {
    const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : currentStatus === "PENDING" ? "COMPLETED" : "PENDING";
    try {
      const response = await api.patch(`/activities/${activityId}/status?status=${nextStatus}`);
      const dayActivities = activitiesByDay[itineraryId] || [];
      setActivitiesByDay({
        ...activitiesByDay,
        [itineraryId]: dayActivities.map(a => a.activityId === activityId ? response.data : a)
      });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleMoveActivityOrder = async (itineraryId, activityId, direction) => {
    const list = [...(activitiesByDay[itineraryId] || [])];
    const index = list.findIndex(a => a.activityId === activityId);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setActivitiesByDay({ ...activitiesByDay, [itineraryId]: list });

    try {
      await api.put("/activities/reorder", list.map(a => a.activityId));
    } catch (err) {
      console.error("Failed to save reordered activities", err);
    }
  };

  const getActivityTypeIcon = (type) => {
    const config = ACTIVITY_CATEGORIES.find(a => a.value === type);
    return config ? config.icon : <FaClock />;
  };

  const formatActivityTime = (time) => {
    if (!time) return "";
    const parts = time.split(":");
    const hours = parseInt(parts[0]);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${parts[1]} ${ampm}`;
  };

  const filterSlotActivities = (activities, slotName) => {
    return activities.filter(act => {
      if (act.timeSlot && act.timeSlot.toUpperCase() === slotName) return true;
      if (!act.activityTime) return slotName === "MORNING";
      const hour = parseInt(act.activityTime.split(":")[0]);
      if (slotName === "MORNING") return hour >= 5 && hour < 12;
      if (slotName === "AFTERNOON") return hour >= 12 && hour < 17;
      if (slotName === "EVENING") return hour >= 17 || hour < 5;
      return false;
    });
  };

  return (
    <div className="app-dashboard-container">
      <Navbar />

      <div className="app-main-layout">
        <Sidebar />

        <main className="app-content-body">
          {/* Header */}
          <div className="app-page-header">
            <div className="app-page-title-wrap">
              <h1 className="app-page-title">Trip Itineraries & Timelines</h1>
              <p className="app-page-subtitle">Organize daily morning, afternoon, and evening activity schedules.</p>
            </div>

            {selectedTripId && (
              <button onClick={() => openItineraryModal()} className="app-primary-btn" type="button">
                <FaCalendarPlus /> Add Day Plan
              </button>
            )}
          </div>

          {alert.message && (
            <div className={`app-alert-banner app-alert-${alert.type}`} role="alert">
              {alert.message}
            </div>
          )}

          {/* Active Trip Selector Bar */}
          <div className="app-glass-card p-3 mb-4">
            <div className="d-flex align-items-center gap-3 flex-wrap flex-md-nowrap w-100">
              <span className="text-white font-weight-bold text-nowrap">Choose Active Trip:</span>
              <div className="flex-grow-1" style={{ maxWidth: "420px" }}>
                {loadingTrips ? (
                  <span className="text-muted">Loading your trip list...</span>
                ) : (
                  <select
                    value={selectedTripId}
                    onChange={handleTripChange}
                    className="app-form-select"
                    aria-label="Choose Active Trip"
                  >
                    <option value="">-- Select a Trip --</option>
                    {trips.map(t => (
                      <option key={t.tripId} value={t.tripId}>
                        {t.tripName} ({t.destinationName})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {tripDetails && (
                <div className="ms-auto text-secondary-text" style={{ fontSize: "14px" }}>
                  Dates: <strong className="text-white">{tripDetails.startDate}</strong> to <strong className="text-white">{tripDetails.endDate}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Days Timeline Section */}
          {loadingItinerary ? (
            <div className="app-loader-box">
              <div className="spinner-border text-primary" role="status"></div>
              <span>Assembling day-wise itinerary timeline...</span>
            </div>
          ) : selectedTripId ? (
            itineraries.length > 0 ? (
              <motion.div
                className="d-flex flex-column gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {itineraries.map((day) => {
                  const dayActivities = activitiesByDay[day.itineraryId] || [];
                  const morningActs = filterSlotActivities(dayActivities, "MORNING");
                  const afternoonActs = filterSlotActivities(dayActivities, "AFTERNOON");
                  const eveningActs = filterSlotActivities(dayActivities, "EVENING");
                  const isExpanded = Boolean(expandedDays[day.itineraryId]);

                  const renderSlotSection = (slotName, slotTitle, slotIcon, actsList) => (
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2 pb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="d-flex align-items-center gap-2 text-white font-weight-bold" style={{ fontSize: "15px" }}>
                          {slotIcon}
                          <span>{slotTitle}</span>
                          <span className="badge bg-dark text-muted font-weight-normal">{actsList.length}</span>
                        </div>

                        <button
                          onClick={() => openActivityModal(day.itineraryId, slotName)}
                          className="btn btn-sm btn-link text-info text-decoration-none p-0 d-flex align-items-center gap-1"
                          type="button"
                          style={{ fontSize: "13px" }}
                        >
                          <FaPlus /> Add Activity
                        </button>
                      </div>

                      {actsList.length > 0 ? (
                        <div className="d-flex flex-column gap-2">
                          {actsList.map((act) => (
                            <div
                              key={act.activityId}
                              className="d-flex justify-content-between align-items-center p-3 rounded-3"
                              style={{ background: "#0F172A", border: "1px solid #334155" }}
                            >
                              <div className="d-flex align-items-center gap-3">
                                {/* Toggle Checkbox */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleActivityStatus(day.itineraryId, act.activityId, act.status)}
                                  className="btn btn-link p-0 text-decoration-none"
                                  title="Toggle Status"
                                  style={{ fontSize: "1.2rem" }}
                                >
                                  {act.status === "COMPLETED" ? (
                                    <FaCheckCircle className="text-success" />
                                  ) : act.status === "CANCELLED" ? (
                                    <FaTimesCircle className="text-danger" />
                                  ) : (
                                    <div className="rounded-circle border border-secondary" style={{ width: "20px", height: "20px" }} />
                                  )}
                                </button>

                                <div className="p-2 bg-dark rounded-3 text-primary d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px" }}>
                                  {getActivityTypeIcon(act.activityType)}
                                </div>

                                <div>
                                  <div className="d-flex align-items-center gap-2">
                                    <span className={`text-white font-weight-bold ${act.status === "COMPLETED" ? "text-decoration-line-through text-muted" : ""}`} style={{ fontSize: "15px" }}>
                                      {act.activityName}
                                    </span>
                                    {act.activityType && (
                                      <span className="badge bg-dark border border-secondary text-info" style={{ fontSize: "11px" }}>
                                        {act.activityType}
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-secondary-text d-flex align-items-center gap-3 flex-wrap" style={{ fontSize: "13px" }}>
                                    <span className="d-flex align-items-center gap-1">
                                      <FaClock className="text-info" /> {formatActivityTime(act.activityTime)} {act.endTime ? `- ${formatActivityTime(act.endTime)}` : ""}
                                    </span>
                                    {act.placeName && (
                                      <span className="d-flex align-items-center gap-1">
                                        <FaMapMarkerAlt className="text-danger" /> {act.placeName}
                                      </span>
                                    )}
                                    {act.estimatedCost > 0 && (
                                      <span className="d-flex align-items-center gap-1 text-success fw-bold">
                                        <FaDollarSign /> ${act.estimatedCost}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Ordering & Actions */}
                              <div className="d-flex align-items-center gap-2">
                                <div className="d-flex flex-column gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveActivityOrder(day.itineraryId, act.activityId, "up")}
                                    className="btn btn-sm btn-dark p-1"
                                    style={{ fontSize: "10px", lineHeight: "1" }}
                                    title="Move Up"
                                  >
                                    <FaArrowUp />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveActivityOrder(day.itineraryId, act.activityId, "down")}
                                    className="btn btn-sm btn-dark p-1"
                                    style={{ fontSize: "10px", lineHeight: "1" }}
                                    title="Move Down"
                                  >
                                    <FaArrowDown />
                                  </button>
                                </div>

                                <button
                                  onClick={() => openActivityModal(day.itineraryId, slotName, act)}
                                  className="btn btn-sm text-secondary-text btn-link p-1"
                                  title="Edit Activity"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteActivity(day.itineraryId, act.activityId)}
                                  className="btn btn-sm text-danger btn-link p-1"
                                  title="Delete Activity"
                                >
                                  <FaTrashAlt />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-muted text-center rounded-3" style={{ background: "rgba(15,23,42,0.4)", border: "1px dashed #334155", fontSize: "13px" }}>
                          No {slotTitle.toLowerCase()} activities scheduled yet.
                        </div>
                      )}
                    </div>
                  );

                  return (
                    <motion.div
                      key={day.itineraryId}
                      className="app-glass-card p-4"
                    >
                      {/* Day Header Bar */}
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleDayExpanded(day.itineraryId)}
                            className="btn btn-dark p-2 rounded-circle"
                            style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </button>

                          <div>
                            <span className="badge bg-primary px-3 py-1 mb-1" style={{ borderRadius: "8px" }}>DAY {day.dayNumber}</span>
                            <h3 className="h5 text-white font-weight-bold mb-0">{day.itineraryTitle}</h3>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            onClick={() => openItineraryModal(day)}
                            className="btn btn-outline-info btn-sm"
                            style={{ borderRadius: "8px", padding: "6px 12px" }}
                            title="Edit Day Plan"
                          >
                            <FaEdit /> Edit Day
                          </button>
                          <button
                            onClick={() => handleDeleteItinerary(day.itineraryId)}
                            className="btn btn-outline-danger btn-sm"
                            style={{ borderRadius: "8px", padding: "6px 12px" }}
                            title="Delete Day Plan"
                          >
                            <FaTrashAlt /> Delete Day
                          </button>
                        </div>
                      </div>

                      {/* Expandable Activity Timeline Slots */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-3 border-top border-secondary"
                          >
                            {day.description && <p className="text-secondary-text mb-4" style={{ fontSize: "14px" }}>{day.description}</p>}

                            {renderSlotSection("MORNING", "Morning Schedule", <FaSun className="text-warning" />, morningActs)}
                            {renderSlotSection("AFTERNOON", "Afternoon Schedule", <FaCloudSun className="text-info" />, afternoonActs)}
                            {renderSlotSection("EVENING", "Evening Schedule", <FaMoon className="text-primary" />, eveningActs)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="app-glass-card text-center p-5">
                <FaExclamationTriangle className="text-warning mb-3" style={{ fontSize: "3.5rem" }} />
                <h2 className="h3 text-dark font-weight-bold">No Days Planned Yet</h2>
                <p className="text-muted mb-4" style={{ fontSize: "16px" }}>Draft your day-by-day itinerary of places to visit and scheduled activities.</p>
                <button onClick={() => openItineraryModal()} className="app-primary-btn" type="button">
                  <FaPlus /> Plan Day 1
                </button>
              </div>
            )
          ) : (
            <div className="app-glass-card text-center p-5">
              <h2 className="h3 text-dark font-weight-bold">No Active Trip Selected</h2>
              <p className="text-muted mb-4">Please select a trip from the dropdown above to manage itineraries.</p>
            </div>
          )}
        </main>
      </div>

      {/* Day Modal */}
      {showItineraryModal && (
        <div className="app-modal-overlay" role="dialog" aria-modal="true">
          <motion.div
            className="app-modal-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <header className="app-modal-header">
              <h2 className="app-modal-title text-dark">{itineraryForm.id ? "Edit Day Plan" : "Add Day Plan"}</h2>
            </header>
            <form onSubmit={handleItinerarySubmit}>
              <div className="app-modal-body">
                <div className="app-form-group">
                  <label htmlFor="dayNumber" className="app-form-label">Day Number</label>
                  <input
                    type="number"
                    id="dayNumber"
                    value={itineraryForm.dayNumber}
                    onChange={(e) => setItineraryForm({ ...itineraryForm, dayNumber: e.target.value })}
                    className="app-form-input"
                    required
                    min="1"
                  />
                </div>
                <div className="app-form-group">
                  <label htmlFor="itineraryTitle" className="app-form-label">Day Title / Main Objective</label>
                  <input
                    type="text"
                    id="itineraryTitle"
                    value={itineraryForm.itineraryTitle}
                    onChange={(e) => setItineraryForm({ ...itineraryForm, itineraryTitle: e.target.value })}
                    placeholder="e.g. Kondaveedu Fort Exploration & Trekking"
                    className="app-form-input"
                    required
                  />
                </div>
                <div className="app-form-group">
                  <label htmlFor="dayDescription" className="app-form-label">Day Description (Optional)</label>
                  <textarea
                    id="dayDescription"
                    value={itineraryForm.description}
                    onChange={(e) => setItineraryForm({ ...itineraryForm, description: e.target.value })}
                    placeholder="Overview details for the day..."
                    className="app-form-textarea"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <footer className="app-modal-footer">
                <button
                  onClick={() => setShowItineraryModal(false)}
                  className="app-secondary-btn"
                  type="button"
                >
                  Cancel
                </button>
                <button type="submit" className="app-primary-btn">
                  Save Day
                </button>
              </footer>
            </form>
          </motion.div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="app-modal-overlay" role="dialog" aria-modal="true">
          <motion.div
            className="app-modal-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ maxWidth: "600px" }}
          >
            <header className="app-modal-header text-white">
              <h2 className="app-modal-title">{activityForm.id ? "Edit Activity" : "Schedule Activity"}</h2>
            </header>
            <form onSubmit={handleActivitySubmit}>
              <div className="app-modal-body">
                <div className="app-form-group">
                  <label htmlFor="activityName" className="app-form-label">Activity Name</label>
                  <input
                    type="text"
                    id="activityName"
                    value={activityForm.activityName}
                    onChange={(e) => setActivityForm({ ...activityForm, activityName: e.target.value })}
                    placeholder="e.g. Fort Viewpoint Photography Session"
                    className="app-form-input"
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 app-form-group">
                    <label htmlFor="activityType" className="app-form-label">Category</label>
                    <select
                      id="activityType"
                      value={activityForm.activityType}
                      onChange={(e) => setActivityForm({ ...activityForm, activityType: e.target.value })}
                      className="app-form-select"
                    >
                      {ACTIVITY_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 app-form-group">
                    <label htmlFor="timeSlot" className="app-form-label">Time Slot</label>
                    <select
                      id="timeSlot"
                      value={activityForm.timeSlot}
                      onChange={(e) => setActivityForm({ ...activityForm, timeSlot: e.target.value })}
                      className="app-form-select"
                    >
                      <option value="MORNING">Morning Activity</option>
                      <option value="AFTERNOON">Afternoon Activity</option>
                      <option value="EVENING">Evening Activity</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 app-form-group">
                    <label htmlFor="activityTime" className="app-form-label">Start Time</label>
                    <input
                      type="time"
                      id="activityTime"
                      value={activityForm.activityTime}
                      onChange={(e) => setActivityForm({ ...activityForm, activityTime: e.target.value })}
                      className="app-form-input text-white"
                      style={{ colorScheme: "dark" }}
                      required
                    />
                  </div>

                  <div className="col-md-6 app-form-group">
                    <label htmlFor="endTime" className="app-form-label">End Time</label>
                    <input
                      type="time"
                      id="endTime"
                      value={activityForm.endTime}
                      onChange={(e) => setActivityForm({ ...activityForm, endTime: e.target.value })}
                      className="app-form-input text-white"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>

                <div className="app-form-group">
                  <label htmlFor="placeName" className="app-form-label">Location / Place Name</label>
                  <input
                    type="text"
                    id="placeName"
                    value={activityForm.placeName}
                    onChange={(e) => setActivityForm({ ...activityForm, placeName: e.target.value })}
                    placeholder="e.g. Kondaveedu Top Fort Gate"
                    className="app-form-input"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 app-form-group">
                    <label htmlFor="estimatedCost" className="app-form-label">Estimated Cost ($)</label>
                    <input
                      type="number"
                      id="estimatedCost"
                      value={activityForm.estimatedCost}
                      onChange={(e) => setActivityForm({ ...activityForm, estimatedCost: e.target.value })}
                      placeholder="0.00"
                      className="app-form-input"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="col-md-6 app-form-group">
                    <label htmlFor="status" className="app-form-label">Status</label>
                    <select
                      id="status"
                      value={activityForm.status}
                      onChange={(e) => setActivityForm({ ...activityForm, status: e.target.value })}
                      className="app-form-select"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
              <footer className="app-modal-footer">
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="app-secondary-btn"
                  type="button"
                >
                  Cancel
                </button>
                <button type="submit" className="app-primary-btn">
                  Save Activity
                </button>
              </footer>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Itinerary;