import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { FaChevronLeft, FaSave, FaCalendarPlus } from "react-icons/fa";
import "../styles/AppLayout.css";

function CreateItinerary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryTripId = searchParams.get("tripId") || "";

  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [formData, setFormData] = useState({
    tripId: queryTripId,
    dayNumber: 1,
    itineraryTitle: "",
    description: "",
  });

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await api.get("/trips");
        setTrips(response.data);
        if (!queryTripId && response.data.length > 0) {
          setFormData((prev) => ({ ...prev, tripId: response.data[0].tripId.toString() }));
        }
      } catch (err) {
        setAlert({ type: "danger", message: "Failed to load trips. Please try again." });
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchTrips();
  }, [queryTripId]);

  // Suggest next day number when tripId changes
  useEffect(() => {
    if (!formData.tripId) return;

    const fetchExistingItineraries = async () => {
      try {
        const response = await api.get(`/itineraries?tripId=${formData.tripId}`);
        const existing = response.data;
        if (existing.length > 0) {
          const maxDay = Math.max(...existing.map((i) => i.dayNumber || 0));
          setFormData((prev) => ({ ...prev, dayNumber: maxDay + 1 }));
        } else {
          setFormData((prev) => ({ ...prev, dayNumber: 1 }));
        }
      } catch (e) {
        // Ignore fallback
      }
    };

    fetchExistingItineraries();
  }, [formData.tripId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setAlert({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tripId) {
      setAlert({ type: "danger", message: "Please select a trip" });
      return;
    }

    if (!formData.dayNumber || parseInt(formData.dayNumber) < 1) {
      setAlert({ type: "danger", message: "Day number must be at least 1" });
      return;
    }

    if (!formData.itineraryTitle.trim()) {
      setAlert({ type: "danger", message: "Day Title / Goal is required" });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/itineraries", {
        dayNumber: parseInt(formData.dayNumber),
        itineraryTitle: formData.itineraryTitle,
        description: formData.description,
        trip: { tripId: parseInt(formData.tripId) },
      });

      setAlert({ type: "success", message: "Day itinerary created successfully! Redirecting..." });
      setTimeout(() => {
        navigate(`/itinerary?tripId=${formData.tripId}`);
      }, 1200);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create itinerary day.";
      setAlert({ type: "danger", message: errorMsg });
    } finally {
      setSubmitting(false);
    }
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
              <h1 className="app-page-title">Create Itinerary Day Plan</h1>
              <p className="app-page-subtitle">Define day-by-day objectives and travel goals for your trip.</p>
            </div>

            <Link to={formData.tripId ? `/itinerary?tripId=${formData.tripId}` : "/itinerary"} className="app-secondary-btn text-decoration-none">
              <FaChevronLeft /> Back to Timeline
            </Link>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="app-glass-card">
                {alert.message && (
                  <div className={`app-alert-banner app-alert-${alert.type}`} role="alert">
                    {alert.message}
                  </div>
                )}

                {loadingTrips ? (
                  <div className="app-loader-box">
                    <div className="spinner-border text-primary" role="status"></div>
                    <span>Loading your available trips...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Trip Selection */}
                    <div className="app-form-group">
                      <label htmlFor="tripId" className="app-form-label">
                        Select Trip
                      </label>
                      <select
                        id="tripId"
                        name="tripId"
                        value={formData.tripId}
                        onChange={handleChange}
                        className="app-form-select"
                        required
                        aria-label="Select trip for itinerary creation"
                      >
                        <option value="">-- Choose a Trip --</option>
                        {trips.map((t) => (
                          <option key={t.tripId} value={t.tripId}>
                            {t.tripName} ({t.destinationName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="row">
                      {/* Day Number */}
                      <div className="col-md-4 app-form-group">
                        <label htmlFor="dayNumber" className="app-form-label">
                          Day Number
                        </label>
                        <input
                          type="number"
                          id="dayNumber"
                          name="dayNumber"
                          value={formData.dayNumber}
                          onChange={handleChange}
                          className="app-form-input"
                          min="1"
                          required
                        />
                      </div>

                      {/* Day Title */}
                      <div className="col-md-8 app-form-group">
                        <label htmlFor="itineraryTitle" className="app-form-label">
                          Day Title / Main Objective
                        </label>
                        <input
                          type="text"
                          id="itineraryTitle"
                          name="itineraryTitle"
                          value={formData.itineraryTitle}
                          onChange={handleChange}
                          placeholder="e.g. Guided Louvre Visit & Seine River Cruise"
                          className="app-form-input"
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="app-form-group mb-4">
                      <label htmlFor="description" className="app-form-label">
                        Day Description & Notes (Optional)
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Add highlights, dress codes, ticket references or general guidance for this day..."
                        className="app-form-textarea"
                        rows="4"
                      ></textarea>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-end gap-3 mt-4">
                      <Link
                        to={formData.tripId ? `/itinerary?tripId=${formData.tripId}` : "/itinerary"}
                        className="app-secondary-btn text-decoration-none"
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        className="app-primary-btn"
                        disabled={submitting}
                        aria-busy={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating Day Plan...
                          </>
                        ) : (
                          <>
                            <FaSave /> Save Itinerary Day
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreateItinerary;
