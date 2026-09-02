import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSave,
  FaPlane,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserFriends,
  FaDollarSign,
  FaCheck,
  FaInfoCircle,
} from "react-icons/fa";
import "../styles/AppLayout.css";

const BUDGET_PRESETS = [
  { label: "$1,000 (Budget)", value: 1000 },
  { label: "$2,500 (Standard)", value: 2500 },
  { label: "$5,000 (Comfort)", value: 5000 },
  { label: "$10,000 (Luxury)", value: 10000 },
];

const TRAVELER_PRESETS = [
  { label: "Solo (1)", value: 1 },
  { label: "Couple (2)", value: 2 },
  { label: "Family (4)", value: 4 },
  { label: "Group (6+)", value: 6 },
];

function CreateTrip() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Wizard Step State (1: Destination & Name, 2: Dates & Travelers, 3: Budget & Details)
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    tripName: "",
    destinationId: "",
    startDate: "",
    endDate: "",
    numberOfTravelers: 1,
    budgetAllocated: "2500",
    description: "",
    coverImage: "",
    status: "UPCOMING",
  });

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await api.get("/destinations");
        setDestinations(response.data);
      } catch (err) {
        setAlert({ type: "danger", message: "Failed to load destinations. Please reload the page." });
      } finally {
        setLoadingDestinations(false);
      }
    };
    fetchDestinations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setAlert({ type: "", message: "" });
  };

  const selectedDestinationObj = destinations.find(
    (d) => d.destinationId.toString() === formData.destinationId.toString()
  );

  const validateStep1 = () => {
    if (!formData.tripName.trim()) {
      setAlert({ type: "danger", message: "Please enter a valid trip name." });
      return false;
    }
    if (!formData.destinationId) {
      setAlert({ type: "danger", message: "Please select a trip destination." });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.startDate) {
      setAlert({ type: "danger", message: "Start date is required." });
      return false;
    }
    if (!formData.endDate) {
      setAlert({ type: "danger", message: "End date is required." });
      return false;
    }
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) {
      setAlert({ type: "danger", message: "End Date must be greater than or equal to Start Date." });
      return false;
    }
    if (formData.numberOfTravelers < 1) {
      setAlert({ type: "danger", message: "Number of travelers must be at least 1." });
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setAlert({ type: "", message: "" });
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setAlert({ type: "", message: "" });
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;

    const budget = parseFloat(formData.budgetAllocated);
    if (isNaN(budget) || budget < 0) {
      setAlert({ type: "danger", message: "Budget cannot be negative." });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/trips", {
        tripName: formData.tripName,
        destinationId: parseInt(formData.destinationId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfTravelers: parseInt(formData.numberOfTravelers),
        budgetAllocated: budget,
        description: formData.description,
        coverImage: formData.coverImage,
        status: formData.status,
      });

      setAlert({ type: "success", message: "Trip planned successfully! Redirecting to trips..." });
      setTimeout(() => navigate("/trips"), 1200);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create trip. Please check your entries.";
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
              <h1 className="app-page-title">Plan a New Journey</h1>
              <p className="app-page-subtitle">Configure your travel destination, dates, and budget in 3 quick steps.</p>
            </div>

            <Link to="/trips" className="app-secondary-btn text-decoration-none">
              <FaChevronLeft /> Back to Trips
            </Link>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-9">
              {/* Multi-Step Progress Bar */}
              <div className="wizard-progress-bar-wrap mb-4">
                <div className="wizard-progress-line">
                  <div
                    className="wizard-progress-line-fill"
                    style={{ width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%" }}
                  />
                </div>

                <div className={`wizard-step-node ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}>
                  <div className="wizard-step-circle">{currentStep > 1 ? <FaCheck /> : "1"}</div>
                  <span className="wizard-step-title">Destination & Name</span>
                </div>

                <div className={`wizard-step-node ${currentStep >= 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}>
                  <div className="wizard-step-circle">{currentStep > 2 ? <FaCheck /> : "2"}</div>
                  <span className="wizard-step-title">Dates & Travelers</span>
                </div>

                <div className={`wizard-step-node ${currentStep === 3 ? "active" : ""}`}>
                  <div className="wizard-step-circle">3</div>
                  <span className="wizard-step-title">Budget & Review</span>
                </div>
              </div>

              {alert.message && (
                <div className={`app-alert-banner app-alert-${alert.type}`} role="alert">
                  {alert.message}
                </div>
              )}

              {/* Form Container */}
              <div className="app-glass-card p-4 p-md-5">
                <form onSubmit={handleSubmit} noValidate>
                  <AnimatePresence mode="wait">
                    {/* STEP 1: Destination & Name */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                      >
                        <h3 className="h4 text-dark font-weight-bold mb-3 d-flex align-items-center gap-2">
                          <FaMapMarkerAlt className="text-primary" /> Step 1: Trip Identity & Destination
                        </h3>

                        {/* Trip Name */}
                        <div className="app-form-group mb-4">
                          <label htmlFor="tripName" className="app-form-label">Trip Name</label>
                          <input
                            type="text"
                            id="tripName"
                            name="tripName"
                            value={formData.tripName}
                            onChange={handleChange}
                            placeholder="e.g. Summer Vacation in Kondaveedu Fort"
                            className="app-form-input"
                            required
                          />
                        </div>

                        {/* Destination Select */}
                        <div className="app-form-group mb-4">
                          <label htmlFor="destinationId" className="app-form-label">Select Destination</label>
                          {loadingDestinations ? (
                            <div className="app-form-input d-flex align-items-center text-muted">
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Loading tourism catalog...
                            </div>
                          ) : (
                            <select
                              id="destinationId"
                              name="destinationId"
                              value={formData.destinationId}
                              onChange={handleChange}
                              className="app-form-select"
                              required
                            >
                              <option value="">-- Choose a Destination --</option>
                              {destinations.map((d) => (
                                <option key={d.destinationId} value={d.destinationId}>
                                  {d.destinationName} ({d.city}, {d.country || "India"})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Destination Preview Card if selected */}
                        {selectedDestinationObj && (
                          <div className="p-3 rounded-3 mb-4" style={{ background: "rgba(15,23,42,0.8)", border: "1px solid #334155" }}>
                            <div className="d-flex align-items-center gap-3">
                              {selectedDestinationObj.heroImage && (
                                <img
                                  src={selectedDestinationObj.heroImage}
                                  alt={selectedDestinationObj.destinationName}
                                  style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "10px" }}
                                />
                              )}
                              <div>
                                <h4 className="h5 text-dark mb-1 font-weight-bold">{selectedDestinationObj.destinationName}</h4>
                                <p className="text-secondary-text mb-0" style={{ fontSize: "13px" }}>
                                  {selectedDestinationObj.city}, {selectedDestinationObj.state || selectedDestinationObj.country}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* STEP 2: Dates & Travelers */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                      >
                        <h3 className="h4 text-dark font-weight-bold mb-3 d-flex align-items-center gap-2">
                          <FaCalendarAlt className="text-info" /> Step 2: Travel Dates & Travelers
                        </h3>

                        <div className="row">
                          <div className="col-md-6 app-form-group">
                            <label htmlFor="startDate" className="app-form-label">Start Date</label>
                            <input
                              type="date"
                              id="startDate"
                              name="startDate"
                              value={formData.startDate}
                              onChange={handleChange}
                              className="app-form-input text-dark"
                              style={{ colorScheme: "light" }}
                              required
                            />
                          </div>

                          <div className="col-md-6 app-form-group">
                            <label htmlFor="endDate" className="app-form-label">End Date</label>
                            <input
                              type="date"
                              id="endDate"
                              name="endDate"
                              value={formData.endDate}
                              onChange={handleChange}
                              className="app-form-input text-dark"
                              style={{ colorScheme: "light" }}
                              required
                            />
                          </div>
                        </div>

                        {/* Number of Travelers & Presets */}
                        <div className="app-form-group mb-4">
                          <label htmlFor="numberOfTravelers" className="app-form-label">Number of Travelers</label>
                          <input
                            type="number"
                            id="numberOfTravelers"
                            name="numberOfTravelers"
                            value={formData.numberOfTravelers}
                            onChange={handleChange}
                            className="app-form-input mb-2"
                            min="1"
                            required
                          />

                          <div className="preset-chip-group">
                            {TRAVELER_PRESETS.map((p) => (
                              <button
                                key={p.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, numberOfTravelers: p.value })}
                                className={`preset-chip-btn ${formData.numberOfTravelers === p.value ? "active" : ""}`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: Budget & Details */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                      >
                        <h3 className="h4 text-dark font-weight-bold mb-3 d-flex align-items-center gap-2">
                          <FaDollarSign className="text-success" /> Step 3: Budget & Final Details
                        </h3>

                        {/* Budget & Presets */}
                        <div className="app-form-group mb-4">
                          <label htmlFor="budgetAllocated" className="app-form-label">Allocated Budget ($)</label>
                          <input
                            type="number"
                            id="budgetAllocated"
                            name="budgetAllocated"
                            value={formData.budgetAllocated}
                            onChange={handleChange}
                            placeholder="e.g. 2500"
                            className="app-form-input mb-2"
                            min="0"
                            step="0.01"
                            required
                          />

                          <div className="preset-chip-group">
                            {BUDGET_PRESETS.map((b) => (
                              <button
                                key={b.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, budgetAllocated: b.value.toString() })}
                                className={`preset-chip-btn ${formData.budgetAllocated === b.value.toString() ? "active" : ""}`}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Cover Image & Status */}
                        <div className="row">
                          <div className="col-md-7 app-form-group">
                            <label htmlFor="coverImage" className="app-form-label">Cover Image URL (Optional)</label>
                            <input
                              type="url"
                              id="coverImage"
                              name="coverImage"
                              value={formData.coverImage}
                              onChange={handleChange}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="app-form-input"
                            />
                          </div>

                          <div className="col-md-5 app-form-group">
                            <label htmlFor="status" className="app-form-label">Initial Trip Status</label>
                            <select
                              id="status"
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              className="app-form-select"
                            >
                              <option value="PLANNING">Planning</option>
                              <option value="UPCOMING">Upcoming</option>
                              <option value="ONGOING">Ongoing</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        {/* Trip Description */}
                        <div className="app-form-group mb-4">
                          <label htmlFor="description" className="app-form-label">Trip Description & Notes</label>
                          <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Add highlights, packing lists, or special travel plans..."
                            className="app-form-textarea"
                            rows="3"
                          ></textarea>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-secondary">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="app-secondary-btn"
                        disabled={submitting}
                      >
                        <FaChevronLeft /> Previous
                      </button>
                    ) : (
                      <Link to="/trips" className="app-secondary-btn text-decoration-none">
                        Cancel
                      </Link>
                    )}

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="app-primary-btn"
                      >
                        Next Step <FaChevronRight />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="app-primary-btn"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving Trip...
                          </>
                        ) : (
                          <>
                            <FaSave /> Confirm & Save Trip
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreateTrip;
