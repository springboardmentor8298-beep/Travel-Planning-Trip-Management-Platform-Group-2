import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    startDate: "",
    endDate: "",
    numberOfTravelers: 1,
    budget: "",
    status: "PLANNING",
  });

  const [editId, setEditId] = useState(null);

  // =========================
  // SEARCH & FILTERS
  // =========================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DEFAULT");

  const navigate = useNavigate();

  // =========================
  // FETCH TRIPS
  // =========================

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);

      const res = await api.get("/trips");
      setTrips(res.data);
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const handleSubmit = async () => {
    try {
      if (editId) {
        await api.put(`/trips/${editId}`, formData);
      } else {
        await api.post("/trips", formData);
      }

      setShowForm(false);
      setEditId(null);
      resetForm();
      fetchTrips();
    } catch (err) {
      console.error("Error saving trip:", err);
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (trip) => {
    setFormData({
      title: trip.title,
      description: trip.description || "",
      destination: trip.destination,
      startDate: trip.startDate || "",
      endDate: trip.endDate || "",
      numberOfTravelers: trip.numberOfTravelers || 1,
      budget: trip.budget || "",
      status: trip.status,
    });

    setEditId(trip.id);
    setShowForm(true);
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    if (window.confirm("Delete this trip?")) {
      try {
        await api.delete(`/trips/${id}`);
        fetchTrips();
      } catch (err) {
        console.error("Error deleting trip:", err);
      }
    }
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      destination: "",
      startDate: "",
      endDate: "",
      numberOfTravelers: 1,
      budget: "",
      status: "PLANNING",
    });
  };

  // =========================
  // FILTER TRIPS
  // =========================

  const getFilteredTrips = () => {
    let result = [...trips];

    // Search
    if (search.trim() !== "") {
      const searchValue = search.toLowerCase();

      result = result.filter((trip) =>
        trip.title?.toLowerCase().includes(searchValue) ||
        trip.destination?.toLowerCase().includes(searchValue) ||
        trip.description?.toLowerCase().includes(searchValue)
      );
    }

    // Status
    if (statusFilter !== "ALL") {
      result = result.filter(
        (trip) => trip.status === statusFilter
      );
    }

    // Date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === "UPCOMING") {
      result = result.filter((trip) => {
        if (!trip.startDate) return false;

        const startDate = new Date(trip.startDate);
        return startDate >= today;
      });
    }

    if (dateFilter === "PAST") {
      result = result.filter((trip) => {
        if (!trip.endDate) return false;

        const endDate = new Date(trip.endDate);
        return endDate < today;
      });
    }

    if (dateFilter === "TODAY") {
      result = result.filter((trip) => {
        if (!trip.startDate) return false;

        const startDate = new Date(trip.startDate);
        return (
          startDate.toDateString() ===
          today.toDateString()
        );
      });
    }

    // Sort
    if (sortBy === "BUDGET_LOW") {
      result.sort(
        (a, b) =>
          Number(a.budget || 0) -
          Number(b.budget || 0)
      );
    }

    if (sortBy === "BUDGET_HIGH") {
      result.sort(
        (a, b) =>
          Number(b.budget || 0) -
          Number(a.budget || 0)
      );
    }

    if (sortBy === "DATE_ASC") {
      result.sort((a, b) => {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;

        return (
          new Date(a.startDate) -
          new Date(b.startDate)
        );
      });
    }

    if (sortBy === "DATE_DESC") {
      result.sort((a, b) => {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;

        return (
          new Date(b.startDate) -
          new Date(a.startDate)
        );
      });
    }

    return result;
  };

  const filteredTrips = getFilteredTrips();

  // =========================
  // CLEAR FILTERS
  // =========================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDateFilter("ALL");
    setSortBy("DEFAULT");
  };

  const hasFilters =
    search !== "" ||
    statusFilter !== "ALL" ||
    dateFilter !== "ALL" ||
    sortBy !== "DEFAULT";

  // =========================
  // RETURN
  // =========================

  return (
    <div style={styles.container}>
      <Sidebar />

      <main style={styles.main}>

        {/* HEADER */}

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              My Trips ✈️
            </h1>

            <p style={styles.subtitle}>
              {filteredTrips.length} of{" "}
              {trips.length} trips
            </p>
          </div>

          <button
            className="btn-aurora"
            onClick={() => {
              resetForm();
              setEditId(null);
              setShowForm(true);
            }}
          >
            + New Trip
          </button>
        </div>

        {/* =========================
            SEARCH & FILTER BAR
        ========================= */}

        <div
          className="glass-card"
          style={styles.filterCard}
        >

          {/* Search */}

          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>
              🔍
            </span>

            <input
              className="aurora-input"
              style={styles.searchInput}
              placeholder="Search trips or destinations..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          {/* Status */}

          <select
            className="aurora-input"
            style={styles.filterSelect}
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option
              value="ALL"
              style={{ background: "#0d1529" }}
            >
              All Status
            </option>

            {[
              "PLANNING",
              "UPCOMING",
              "ONGOING",
              "COMPLETED",
              "CANCELLED",
            ].map((status) => (
              <option
                key={status}
                value={status}
                style={{ background: "#0d1529" }}
              >
                {status}
              </option>
            ))}
          </select>

          {/* Date */}

          <select
            className="aurora-input"
            style={styles.filterSelect}
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value)
            }
          >
            <option
              value="ALL"
              style={{ background: "#0d1529" }}
            >
              All Dates
            </option>

            <option
              value="UPCOMING"
              style={{ background: "#0d1529" }}
            >
              Upcoming
            </option>

            <option
              value="TODAY"
              style={{ background: "#0d1529" }}
            >
              Today
            </option>

            <option
              value="PAST"
              style={{ background: "#0d1529" }}
            >
              Past
            </option>
          </select>

          {/* Sort */}

          <select
            className="aurora-input"
            style={styles.filterSelect}
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
          >
            <option
              value="DEFAULT"
              style={{ background: "#0d1529" }}
            >
              Sort By
            </option>

            <option
              value="DATE_ASC"
              style={{ background: "#0d1529" }}
            >
              Start Date ↑
            </option>

            <option
              value="DATE_DESC"
              style={{ background: "#0d1529" }}
            >
              Start Date ↓
            </option>

            <option
              value="BUDGET_LOW"
              style={{ background: "#0d1529" }}
            >
              Budget: Low → High
            </option>

            <option
              value="BUDGET_HIGH"
              style={{ background: "#0d1529" }}
            >
              Budget: High → Low
            </option>
          </select>

          {/* Clear */}

          {hasFilters && (
            <button
              className="btn-ghost"
              onClick={clearFilters}
              style={styles.clearButton}
            >
              ✕ Clear
            </button>
          )}

        </div>

        {/* =========================
            FORM MODAL
        ========================= */}

        {showForm && (
          <div style={styles.modal}>

            <div
              style={styles.modalCard}
              className="glass-card"
            >

              <h2 style={styles.modalTitle}>
                {editId
                  ? "Edit Trip"
                  : "Plan New Trip"}
              </h2>

              <div style={styles.formGrid}>

                {[
                  {
                    key: "title",
                    label: "Trip Title",
                    placeholder:
                      "e.g. Goa Adventure",
                  },
                  {
                    key: "destination",
                    label: "Destination",
                    placeholder:
                      "e.g. Goa, India",
                  },
                ].map(
                  ({
                    key,
                    label,
                    placeholder,
                  }) => (
                    <div
                      key={key}
                      style={styles.inputGroup}
                    >
                      <label style={styles.label}>
                        {label}
                      </label>

                      <input
                        className="aurora-input"
                        placeholder={placeholder}
                        value={formData[key]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [key]: e.target.value,
                          })
                        }
                      />
                    </div>
                  )
                )}

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Start Date
                  </label>

                  <input
                    className="aurora-input"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startDate:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    End Date
                  </label>

                  <input
                    className="aurora-input"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endDate:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Travelers
                  </label>

                  <input
                    className="aurora-input"
                    type="number"
                    min="1"
                    value={
                      formData.numberOfTravelers
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfTravelers:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Budget (₹)
                  </label>

                  <input
                    className="aurora-input"
                    type="number"
                    placeholder="e.g. 25000"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Status
                  </label>

                  <select
                    className="aurora-input"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status:
                          e.target.value,
                      })
                    }
                  >
                    {[
                      "PLANNING",
                      "UPCOMING",
                      "ONGOING",
                      "COMPLETED",
                      "CANCELLED",
                    ].map((status) => (
                      <option
                        key={status}
                        value={status}
                        style={{
                          background:
                            "#0d1529",
                        }}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    ...styles.inputGroup,
                    gridColumn: "1 / -1",
                  }}
                >
                  <label style={styles.label}>
                    Description
                  </label>

                  <textarea
                    className="aurora-input"
                    placeholder="Trip description..."
                    rows={3}
                    value={
                      formData.description
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description:
                          e.target.value,
                      })
                    }
                    style={{
                      resize: "vertical",
                    }}
                  />
                </div>

              </div>

              <div style={styles.modalActions}>

                <button
                  className="btn-ghost"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="btn-aurora"
                  onClick={handleSubmit}
                >
                  {editId
                    ? "Update Trip"
                    : "Create Trip"}
                </button>

              </div>

            </div>
          </div>
        )}

        {/* =========================
            TRIPS
        ========================= */}

        {loading ? (

          <p style={{ color: "#94a3b8" }}>
            Loading trips...
          </p>

        ) : trips.length === 0 ? (

          <div
            style={styles.emptyState}
            className="glass-card"
          >
            <span
              style={{ fontSize: "48px" }}
            >
              ✈️
            </span>

            <h3
              style={{
                color: "#f1f5f9",
              }}
            >
              No trips yet!
            </h3>

            <p
              style={{
                color: "#94a3b8",
              }}
            >
              Start planning your first
              adventure
            </p>

            <button
              className="btn-aurora"
              onClick={() => {
                resetForm();
                setEditId(null);
                setShowForm(true);
              }}
              style={{
                marginTop: "16px",
              }}
            >
              Plan a Trip
            </button>
          </div>

        ) : filteredTrips.length === 0 ? (

          <div
            style={styles.emptyState}
            className="glass-card"
          >

            <span
              style={{ fontSize: "48px" }}
            >
              🔍
            </span>

            <h3
              style={{
                color: "#f1f5f9",
              }}
            >
              No matching trips
            </h3>

            <p
              style={{
                color: "#94a3b8",
              }}
            >
              Try changing your search or
              filters.
            </p>

            <button
              className="btn-aurora"
              onClick={clearFilters}
              style={{
                marginTop: "16px",
              }}
            >
              Clear Filters
            </button>

          </div>

        ) : (

          <div style={styles.tripsGrid}>

            {filteredTrips.map((trip) => (

              <div
                key={trip.id}
                style={styles.tripCard}
                className="glass-card"
              >

                <div
                  style={styles.tripCardHeader}
                >

                  <span
                    style={{
                      fontSize: "28px",
                    }}
                  >
                    🌍
                  </span>

                  <span
                    className={`badge badge-${trip.status.toLowerCase()}`}
                  >
                    {trip.status}
                  </span>

                </div>

                <h3
                  style={styles.tripTitle}
                >
                  {trip.title}
                </h3>

                <p
                  style={styles.tripDest}
                >
                  📍 {trip.destination}
                </p>

                {trip.description && (
                  <p
                    style={styles.tripDesc}
                  >
                    {trip.description}
                  </p>
                )}

                <div
                  style={styles.tripMeta}
                >

                  {trip.startDate && (
                    <span
                      style={styles.metaItem}
                    >
                      📅 {trip.startDate}
                    </span>
                  )}

                  <span
                    style={styles.metaItem}
                  >
                    👥{" "}
                    {trip.numberOfTravelers}
                  </span>

                  {trip.budget && (
                    <span
                      style={styles.metaItem}
                    >
                      💰 ₹
                      {Number(
                        trip.budget
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  )}

                </div>

                <div
                  style={styles.tripActions}
                >

                  <button
                    className="btn-ghost"
                    onClick={() =>
                      navigate(
                        `/trips/${trip.id}`
                      )
                    }
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      padding: "8px",
                    }}
                  >
                    View
                  </button>

                  <button
                    className="btn-ghost"
                    onClick={() =>
                      handleEdit(trip)
                    }
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      padding: "8px",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(trip.id)
                    }
                    style={{
                      ...styles.deleteBtn,
                      flex: 1,
                    }}
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>
    </div>
  );
};

// =========================
// STYLES
// =========================

const styles = {

  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#0a0f1e",
  },

  main: {
    marginLeft: "260px",
    flex: 1,
    padding: "32px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#f1f5f9",
    fontFamily:
      "'Space Grotesk', sans-serif",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    marginTop: "4px",
  },

  // =========================
  // FILTERS
  // =========================

  filterCard: {
    padding: "16px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  searchBox: {
    flex: 1,
    minWidth: "240px",
    position: "relative",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1,
    fontSize: "15px",
  },

  searchInput: {
    width: "100%",
    paddingLeft: "38px",
  },

  filterSelect: {
    width: "180px",
    cursor: "pointer",
  },

  clearButton: {
    whiteSpace: "nowrap",
    padding: "9px 14px",
  },

  // =========================
  // MODAL
  // =========================

  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },

  modalCard: {
    width: "600px",
    maxWidth: "90vw",
    padding: "32px",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  modalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#f1f5f9",
    fontFamily:
      "'Space Grotesk', sans-serif",
    marginBottom: "24px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "16px",
    marginBottom: "24px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "500",
  },

  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },

  // =========================
  // TRIPS
  // =========================

  tripsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "16px",
  },

  tripCard: {
    padding: "20px",
  },

  tripCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  tripTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f1f5f9",
    fontFamily:
      "'Space Grotesk', sans-serif",
    marginBottom: "6px",
  },

  tripDest: {
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "8px",
  },

  tripDesc: {
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "12px",
    lineHeight: "1.5",
  },

  tripMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "16px",
  },

  metaItem: {
    color: "#64748b",
    fontSize: "12px",
    background:
      "rgba(255,255,255,0.05)",
    padding: "4px 8px",
    borderRadius: "6px",
  },

  tripActions: {
    display: "flex",
    gap: "8px",
  },

  deleteBtn: {
    background:
      "rgba(239,68,68,0.1)",
    border:
      "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    padding: "8px",
    transition: "all 0.2s",
  },

  emptyState: {
    padding: "48px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
};

export default Trips;