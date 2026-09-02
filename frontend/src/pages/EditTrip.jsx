import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { FaChevronLeft, FaSave } from "react-icons/fa";
import "../styles/AppLayout.css";

function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [formData, setFormData] = useState({
    tripName: "",
    destinationId: "",
    startDate: "",
    endDate: "",
    numberOfTravelers: 1,
    budgetAllocated: "",
    description: "",
    status: "UPCOMING",
  });

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const destResponse = await api.get("/destinations");
        setDestinations(destResponse.data);

        const tripResponse = await api.get(`/trips/${id}`);
        const trip = tripResponse.data;
        
        setFormData({
          tripName: trip.tripName || "",
          destinationId: trip.destinationId || "",
          startDate: trip.startDate || "",
          endDate: trip.endDate || "",
          numberOfTravelers: trip.numberOfTravelers || 1,
          budgetAllocated: trip.budgetAllocated !== undefined ? trip.budgetAllocated.toString() : "",
          description: trip.description || "",
          coverImage: trip.coverImage || "",
          status: trip.status || "UPCOMING",
        });
      } catch (err) {
        setAlert({ type: "danger", message: "Failed to retrieve details. Please verify the link." });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setAlert({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.tripName.trim()) {
      setAlert({ type: "danger", message: "Trip name cannot be empty" });
      return;
    }
    if (!formData.destinationId) {
      setAlert({ type: "danger", message: "Please select a destination" });
      return;
    }
    if (!formData.startDate) {
      setAlert({ type: "danger", message: "Start date is required" });
      return;
    }
    if (!formData.endDate) {
      setAlert({ type: "danger", message: "End date is required" });
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) {
      setAlert({ type: "danger", message: "End Date must be greater than or equal to Start Date" });
      return;
    }

    if (formData.numberOfTravelers < 1) {
      setAlert({ type: "danger", message: "Travelers minimum 1" });
      return;
    }

    const budget = parseFloat(formData.budgetAllocated);
    if (isNaN(budget) || budget < 0) {
      setAlert({ type: "danger", message: "Budget cannot be negative" });
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/trips/${id}`, {
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

      setAlert({ type: "success", message: "Trip changes saved successfully! Redirecting..." });
      setTimeout(() => navigate("/trips"), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save trip. Please verify inputs.";
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
              <h1 className="app-page-title">Edit Trip Details</h1>
              <p className="app-page-subtitle">Modify parameters or update status for your journey.</p>
            </div>
            
            <Link to="/trips" className="app-secondary-btn text-decoration-none">
              <FaChevronLeft /> Back to Trips
            </Link>
          </div>

          {/* Form Container */}
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="app-glass-card">
                {alert.message && (
                  <div className={`app-alert-banner app-alert-${alert.type}`} role="alert">
                    {alert.message}
                  </div>
                )}

                {loadingData ? (
                  <div className="app-loader-box">
                    <div className="spinner-border text-primary" role="status"></div>
                    <span>Loading trip details...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row">
                      {/* Trip Name */}
                      <div className="col-md-6 app-form-group">
                        <label htmlFor="tripName" className="app-form-label">Trip Name</label>
                        <input
                          type="text"
                          id="tripName"
                          name="tripName"
                          value={formData.tripName}
                          onChange={handleChange}
                          className="app-form-input"
                          required
                        />
                      </div>

                      {/* Destination Select */}
                      <div className="col-md-6 app-form-group">
                        <label htmlFor="destinationId" className="app-form-label">Destination</label>
                        <select
                          id="destinationId"
                          name="destinationId"
                          value={formData.destinationId}
                          onChange={handleChange}
                          className="app-form-select"
                          required
                          aria-label="Select trip destination"
                        >
                          <option value="">-- Choose a Destination --</option>
                          {destinations.map((d) => (
                            <option key={d.destinationId} value={d.destinationId}>
                              {d.destinationName} ({d.city}, {d.country})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      {/* Start Date */}
                      <div className="col-md-6 app-form-group">
                        <label htmlFor="startDate" className="app-form-label">Start Date</label>
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className="app-form-input text-dark"
                          required
                          style={{ colorScheme: 'light' }}
                        />
                      </div>

                      {/* End Date */}
                      <div className="col-md-6 app-form-group">
                        <label htmlFor="endDate" className="app-form-label">End Date</label>
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          className="app-form-input text-dark"
                          required
                          style={{ colorScheme: 'light' }}
                        />
                      </div>
                    </div>

                    <div className="row">
                      {/* Budget */}
                      <div className="col-md-4 app-form-group">
                        <label htmlFor="budgetAllocated" className="app-form-label">Allocated Budget ($)</label>
                        <input
                          type="number"
                          id="budgetAllocated"
                          name="budgetAllocated"
                          value={formData.budgetAllocated}
                          onChange={handleChange}
                          className="app-form-input"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      {/* Number of Travelers */}
                      <div className="col-md-4 app-form-group">
                        <label htmlFor="numberOfTravelers" className="app-form-label">Number of Travelers</label>
                        <input
                          type="number"
                          id="numberOfTravelers"
                          name="numberOfTravelers"
                          value={formData.numberOfTravelers}
                          onChange={handleChange}
                          className="app-form-input"
                          min="1"
                          required
                        />
                      </div>

                      {/* Status */}
                      <div className="col-md-4 app-form-group">
                        <label htmlFor="status" className="app-form-label">Trip Status</label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="app-form-select"
                          aria-label="Select trip status"
                        >
                          <option value="PLANNING">Planning</option>
                          <option value="UPCOMING">Upcoming</option>
                          <option value="ONGOING">Ongoing</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </div>
                    </div>

                    {/* Cover Image URL */}
                    <div className="app-form-group">
                      <label htmlFor="coverImage" className="app-form-label">Cover Image URL (Optional)</label>
                      <input
                        type="url"
                        id="coverImage"
                        name="coverImage"
                        value={formData.coverImage || ""}
                        onChange={handleChange}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="app-form-input"
                      />
                    </div>

                    {/* Description */}
                    <div className="app-form-group mb-4">
                      <label htmlFor="description" className="app-form-label">Trip Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="app-form-textarea"
                        rows="4"
                      ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="d-flex justify-content-end gap-3 mt-4">
                      <Link to="/trips" className="app-secondary-btn text-decoration-none">
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
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <FaSave /> Save Changes
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

export default EditTrip;
