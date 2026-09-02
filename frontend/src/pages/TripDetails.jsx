import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api, {
  getTripMembers,
  addTripMember,
  removeTripMember,
  getTripMedia,
  uploadTripMedia,
  deleteTripMedia
} from "../services/api";
import {
  FaChevronLeft,
  FaCalendarAlt,
  FaUserFriends,
  FaWallet,
  FaEdit,
  FaTrashAlt,
  FaCompass,
  FaCheckCircle,
  FaShareAlt,
  FaCopy,
  FaArchive,
  FaClock,
  FaCheck,
  FaUserPlus,
  FaFileUpload,
  FaFileAlt,
  FaImage
} from "react-icons/fa";
import "../styles/AppLayout.css";

const DESTINATION_COVERS = {
  paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
  maldives: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
  tokyo: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
  "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
  default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
};

function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserEmail = localStorage.getItem("email") || "";

  const [trip, setTrip] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [members, setMembers] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Invite member form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState("PHOTO");
  const [uploading, setUploading] = useState(false);

  const fetchMembers = async () => {
    try {
      const resp = await getTripMembers(id);
      setMembers(resp.data);
    } catch (e) {
      console.warn("Could not fetch trip members:", e);
    }
  };

  const fetchMedia = async () => {
    try {
      const resp = await getTripMedia(id);
      setMediaList(resp.data);
    } catch (e) {
      console.warn("Could not fetch trip media:", e);
    }
  };

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await api.get(`/trips/${id}`);
        setTrip(response.data);

        try {
          const itinResp = await api.get(`/itineraries?tripId=${id}`);
          setItineraries(itinResp.data);
        } catch (e) {
          console.error("Could not fetch itineraries for trip", e);
        }

        fetchMembers();
        fetchMedia();
      } catch (err) {
        setError("Failed to retrieve trip details. The trip may not exist or you may not be authorized.");
      } finally {
        setLoading(false);
      }
    };
    fetchTripDetails();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/trips/${id}`);
      navigate("/trips");
    } catch (err) {
      setError("Failed to delete trip. Please try again.");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await api.post(`/trips/${id}/duplicate`);
      setAlert({ type: "success", message: `Trip duplicated! Redirecting to new copy...` });
      setTimeout(() => navigate(`/trips/${response.data.tripId}`), 1200);
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to duplicate trip." });
    }
  };

  const handleArchive = async () => {
    try {
      const response = await api.patch(`/trips/${id}/archive`);
      setTrip({ ...trip, status: response.data.status });
      setAlert({ type: "success", message: `Trip status updated to ${response.data.status}!` });
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to archive trip." });
    } finally {
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await addTripMember(id, inviteEmail.trim(), inviteRole);
      setAlert({ type: "success", message: `Member ${inviteEmail} invited successfully!` });
      setInviteEmail("");
      fetchMembers();
    } catch (err) {
      setAlert({ type: "danger", message: err.response?.data?.message || "Failed to invite member." });
    } finally {
      setInviting(false);
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    if (!window.confirm("Are you sure you want to remove this member from the trip?")) return;
    try {
      await removeTripMember(id, targetUserId);
      setAlert({ type: "success", message: "Member removed from trip." });
      fetchMembers();
    } catch (err) {
      setAlert({ type: "danger", message: err.response?.data?.message || "Failed to remove member." });
    } finally {
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setAlert({ type: "danger", message: "Please select a file to upload." });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      await uploadTripMedia(id, formData, uploadCategory);
      setAlert({ type: "success", message: "File uploaded successfully!" });
      setSelectedFile(null);
      fetchMedia();
    } catch (err) {
      setAlert({ type: "danger", message: err.response?.data?.message || "Failed to upload file." });
    } finally {
      setUploading(false);
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm("Are you sure you want to delete this media file?")) return;
    try {
      await deleteTripMedia(id, mediaId);
      setAlert({ type: "success", message: "Media file deleted." });
      fetchMedia();
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to delete media file." });
    } finally {
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const copyShareLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const getCoverImage = () => {
    if (trip?.coverImage && trip.coverImage.trim() !== "") {
      return trip.coverImage;
    }
    if (!trip?.city && !trip?.destinationName) return DESTINATION_COVERS.default;
    const cityKey = (trip.city || trip.destinationName || "").toLowerCase().trim();
    for (const key in DESTINATION_COVERS) {
      if (cityKey.includes(key)) {
        return DESTINATION_COVERS[key];
      }
    }
    return DESTINATION_COVERS.default;
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "text-success";
      case "ONGOING":
      case "ACTIVE":
        return "text-primary";
      case "CANCELLED":
        return "text-danger";
      case "ARCHIVED":
        return "text-secondary";
      case "PLANNING":
        return "text-info";
      default:
        return "text-warning";
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
              <h1 className="app-page-title">Trip Details</h1>
              <p className="app-page-subtitle">Overview of your scheduled tour plans & group collaboration.</p>
            </div>
            
            <Link to="/trips" className="app-secondary-btn text-decoration-none">
              <FaChevronLeft /> Back to Trips
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

          {loading ? (
            <div className="app-loader-box">
              <div className="spinner-border text-primary" role="status"></div>
              <span>Fetching trip overview...</span>
            </div>
          ) : trip ? (
            <div className="row g-4">
              {/* Cover Image */}
              <div className="col-12">
                <div className="app-glass-card p-0 overflow-hidden" style={{ position: 'relative' }}>
                  <div style={{ height: '340px', position: 'relative' }}>
                    <img
                      src={getCoverImage()}
                      alt={trip.destinationName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(2, 6, 17, 0.95))'
                    }} />
                    
                    <div style={{
                      position: 'absolute',
                      bottom: '24px',
                      left: '30px',
                      right: '30px'
                    }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className={`badge bg-dark ${getStatusColor(trip.status)} border border-secondary`} style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '12px' }}>
                          {trip.status || "UPCOMING"}
                        </span>
                        {trip.durationDays > 0 && (
                          <span className="badge bg-primary text-white" style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '12px' }}>
                            <FaClock /> {trip.durationDays} Days
                          </span>
                        )}
                      </div>

                      <h2 className="text-white h1 mb-1" style={{ fontWeight: '800' }}>{trip.tripName}</h2>
                      
                      <p className="text-light mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                        <FaCompass className="text-primary" />
                        {trip.destinationId ? (
                          <Link to={`/destinations/${trip.destinationId}`} className="text-light text-decoration-none hover-underline font-weight-bold">
                            {trip.destinationName} ({trip.city}, {trip.country})
                          </Link>
                        ) : (
                          <span>{trip.destinationName}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Column */}
              <div className="col-md-8">
                <div className="app-glass-card mb-4" style={{ minHeight: '160px' }}>
                  <h3 className="h5 text-dark mb-3" style={{ fontWeight: '700' }}>Trip Description</h3>
                  <p className="text-secondary" style={{ lineHeight: '1.6', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                    {trip.description || "No description provided. Add details to describe your tour goals."}
                  </p>
                </div>

                {/* Day-wise Itinerary Overview */}
                <div className="app-glass-card mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="h5 text-dark mb-0" style={{ fontWeight: '700' }}>Day-wise Itinerary Plans ({itineraries.length} Days)</h3>
                    <Link to={`/itinerary?tripId=${trip.tripId}`} className="btn btn-sm btn-outline-primary" style={{ borderRadius: '8px' }}>
                      Manage Itinerary →
                    </Link>
                  </div>

                  {itineraries.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {itineraries.map((itin) => (
                        <div key={itin.itineraryId} className="p-3 rounded-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <span className="badge bg-primary me-2">DAY {itin.dayNumber}</span>
                          <strong className="text-dark" style={{ fontSize: '16px' }}>{itin.itineraryTitle}</strong>
                          {itin.description && <p className="text-muted mb-0 mt-1" style={{ fontSize: '14px' }}>{itin.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No days added to this itinerary yet. Click &quot;Manage Itinerary&quot; to build schedule.</p>
                  )}
                </div>

                {/* Group Collaboration Members Card */}
                <div className="app-glass-card mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="h5 text-dark mb-0" style={{ fontWeight: '700' }}>
                      <FaUserFriends className="text-primary me-2" /> Group Trip Members ({members.length})
                    </h3>
                  </div>

                  {/* Add Member Form (Owner only) */}
                  <form onSubmit={handleInviteMember} className="d-flex gap-2 mb-3">
                    <input
                      type="email"
                      placeholder="Enter member email..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="app-form-input flex-grow-1"
                      required
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="app-form-select"
                      style={{ width: "120px" }}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="OWNER">Owner</option>
                    </select>
                    <button type="submit" className="app-primary-btn text-nowrap" disabled={inviting}>
                      <FaUserPlus /> Invite
                    </button>
                  </form>

                  {/* Members List */}
                  {members.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {members.map((m) => (
                        <div key={m.memberId} className="p-3 rounded-3 d-flex justify-content-between align-items-center bg-light border">
                          <div>
                            <strong className="text-dark d-block">{m.firstName ? `${m.firstName} ${m.lastName || ""}` : m.email}</strong>
                            <small className="text-muted">{m.email} • <span className="badge bg-secondary">{m.role}</span></small>
                          </div>
                          {m.role !== "OWNER" && (
                            <button
                              onClick={() => handleRemoveMember(m.userId)}
                              className="btn btn-sm btn-outline-danger"
                              title="Remove Member"
                            >
                              <FaTrashAlt />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No shared members yet. Invite friends by entering their email above.</p>
                  )}
                </div>

                {/* Media & Travel Documents Card */}
                <div className="app-glass-card mb-4">
                  <h3 className="h5 text-dark mb-3" style={{ fontWeight: '700' }}>
                    <FaFileUpload className="text-primary me-2" /> Photos & Travel Documents
                  </h3>

                  {/* Upload Form */}
                  <form onSubmit={handleFileUpload} className="d-flex align-items-center gap-2 mb-4 flex-wrap">
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="app-form-input flex-grow-1"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.txt"
                    />
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="app-form-select"
                      style={{ width: "140px" }}
                    >
                      <option value="PHOTO">Photo</option>
                      <option value="DOCUMENT">Document</option>
                    </select>
                    <button type="submit" className="app-primary-btn text-nowrap" disabled={uploading}>
                      <FaFileUpload /> Upload
                    </button>
                  </form>

                  {/* Media Grid */}
                  {mediaList.length > 0 ? (
                    <div className="row g-3">
                      {mediaList.map((m) => (
                        <div key={m.mediaId} className="col-sm-6 col-md-4">
                          <div className="p-3 border rounded-3 bg-light d-flex flex-column gap-2 h-100 justify-content-between">
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                {m.mediaCategory === "PHOTO" ? <FaImage className="text-primary" /> : <FaFileAlt className="text-warning" />}
                                <strong className="text-dark text-truncate d-block" style={{ fontSize: "14px" }} title={m.fileName}>
                                  {m.fileName}
                                </strong>
                              </div>
                              <small className="text-muted d-block">{((m.fileSize || 0) / 1024).toFixed(1)} KB</small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <a href={`http://localhost:8080${m.filePath}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                View
                              </a>
                              <button onClick={() => handleDeleteMedia(m.mediaId)} className="btn btn-sm btn-outline-danger">
                                <FaTrashAlt />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No media or documents uploaded yet.</p>
                  )}
                </div>

                {/* Actions Row */}
                <div className="d-flex flex-wrap gap-2">
                  <Link to={`/itinerary?tripId=${trip.tripId}`} className="app-primary-btn text-decoration-none">
                    <FaCheckCircle /> View & Manage Itinerary
                  </Link>
                  <Link to={`/trips/edit/${trip.tripId}`} className="app-secondary-btn text-decoration-none">
                    <FaEdit /> Edit Details
                  </Link>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="btn btn-outline-info"
                    style={{ height: '52px', borderRadius: '12px', padding: '0 1.25rem', fontWeight: '600' }}
                    type="button"
                  >
                    <FaShareAlt /> Share
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="btn btn-outline-warning"
                    style={{ height: '52px', borderRadius: '12px', padding: '0 1.25rem', fontWeight: '600' }}
                    type="button"
                  >
                    <FaCopy /> Duplicate
                  </button>
                  <button
                    onClick={handleArchive}
                    className="btn btn-outline-secondary"
                    style={{ height: '52px', borderRadius: '12px', padding: '0 1.25rem', fontWeight: '600' }}
                    type="button"
                  >
                    <FaArchive /> {trip.status === "ARCHIVED" ? "Unarchive" : "Archive"}
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn btn-outline-danger"
                    style={{ height: '52px', borderRadius: '12px', padding: '0 1.25rem', fontWeight: '600' }}
                    type="button"
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              </div>

              {/* Side Parameters */}
              <div className="col-md-4">
                <div className="app-glass-card d-flex flex-column gap-4">
                  <h3 className="h5 text-dark mb-1" style={{ fontWeight: '700' }}>Quick Information</h3>
                  
                  {/* Progress */}
                  <div>
                    <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                      <span>Activity Completion</span>
                      <span className="text-dark font-weight-bold">{trip.progressPercentage || 0}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px', backgroundColor: '#E2E8F0' }}>
                      <div className="progress-bar bg-primary" style={{ width: `${trip.progressPercentage || 0}%` }} />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-3 bg-success-subtle text-success rounded-3" style={{ fontSize: '1.25rem' }}>
                      <FaWallet />
                    </div>
                    <div>
                      <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>Budget Allocated</span>
                      <strong className="text-dark h5 mb-0" style={{ fontWeight: '700' }}>${trip.budgetAllocated}</strong>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-3 bg-primary-subtle text-primary rounded-3" style={{ fontSize: '1.25rem' }}>
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>Travel Dates</span>
                      <strong className="text-dark mb-0" style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                        {trip.startDate} to {trip.endDate}
                      </strong>
                    </div>
                  </div>

                  {/* Travelers */}
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-3 bg-info-subtle text-info rounded-3" style={{ fontSize: '1.25rem' }}>
                      <FaUserFriends />
                    </div>
                    <div>
                      <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>Total Travelers</span>
                      <strong className="text-dark h5 mb-0" style={{ fontWeight: '700' }}>
                        {trip.numberOfTravelers} traveler{trip.numberOfTravelers > 1 ? 's' : ''}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="app-glass-card text-center p-5">
              <h3 className="text-dark font-weight-bold">Trip Not Found</h3>
              <p className="text-muted">The requested trip could not be loaded.</p>
              <Link to="/trips" className="app-primary-btn mt-3 text-decoration-none">
                Back to Trips
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="app-modal-overlay" role="dialog" aria-modal="true">
          <div className="app-modal-card">
            <header className="app-modal-header">
              <h2 className="app-modal-title text-dark">Delete Trip</h2>
            </header>
            <div className="app-modal-body">
              Are you sure you want to delete the trip <strong>{trip?.tripName}</strong>? This will permanently erase this trip record, all its days, and activity schedules. This action is irreversible.
            </div>
            <footer className="app-modal-footer">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="app-secondary-btn"
                type="button"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
                style={{ height: '52px', borderRadius: '12px', padding: '0 1.75rem', fontWeight: '600' }}
                type="button"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Trip"}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="app-modal-overlay" role="dialog" aria-modal="true">
          <div className="app-modal-card">
            <header className="app-modal-header">
              <h2 className="app-modal-title text-dark">Share Trip Details</h2>
            </header>
            <div className="app-modal-body">
              <p className="text-dark mb-2" style={{ fontWeight: "700" }}>{trip.tripName}</p>
              <p className="text-muted mb-3" style={{ fontSize: "14px" }}>
                Destination: {trip.destinationName} ({trip.startDate} to {trip.endDate})
              </p>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
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
                onClick={() => setShowShareModal(false)}
                className="app-secondary-btn"
                type="button"
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripDetails;
