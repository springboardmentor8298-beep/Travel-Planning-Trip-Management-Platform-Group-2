import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaHeart,
  FaCompass,
  FaSave,
  FaCamera,
  FaCheckCircle
} from "react-icons/fa";
import "../styles/AppLayout.css";

function Profile() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImage: "",
    travelPreferences: "",
    favoriteDestination: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/me");
        const user = response.data;
        setProfile({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || localStorage.getItem("email") || "",
          phone: user.phone || "",
          profileImage: user.profileImage || "",
          travelPreferences: user.travelPreferences || "",
          favoriteDestination: user.favoriteDestination || "",
        });
      } catch (err) {
        setAlert({ type: "danger", message: "Failed to load user profile." });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    setAlert({ type: "", message: "" });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!profile.firstName.trim()) {
      setAlert({ type: "danger", message: "First Name is required." });
      return;
    }

    setSaving(true);
    try {
      const response = await api.put("/users/me", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        profileImage: profile.profileImage,
        travelPreferences: profile.travelPreferences,
        favoriteDestination: profile.favoriteDestination,
      });

      setProfile((prev) => ({ ...prev, ...response.data }));
      setAlert({ type: "success", message: "Profile updated successfully!" });
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to update profile details." });
    } finally {
      setSaving(false);
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
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
              <h1 className="app-page-title">My Profile & Settings</h1>
              <p className="app-page-subtitle">Manage personal information, travel preferences, and account details.</p>
            </div>
          </div>

          {alert.message && (
            <div className={`app-alert-banner app-alert-${alert.type}`} role="alert">
              {alert.message}
            </div>
          )}

          {loading ? (
            <div className="app-loader-box">
              <div className="spinner-border text-primary" role="status"></div>
              <span>Fetching profile details...</span>
            </div>
          ) : (
            <div className="row justify-content-center">
              <div className="col-lg-9">
                <div className="app-glass-card">
                  {/* Profile Header Avatar Banner */}
                  <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom border-secondary">
                    <div
                      style={{
                        width: "90px",
                        height: "90px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: "rgba(37, 99, 235, 0.2)",
                        border: "2px solid #2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {profile.profileImage ? (
                        <img
                          src={profile.profileImage}
                          alt="Profile Avatar"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <FaUser className="text-primary" style={{ fontSize: "2.5rem" }} />
                      )}
                    </div>

                    <div>
                      <h2 className="text-dark h3 mb-1" style={{ fontWeight: "700" }}>
                        {profile.firstName} {profile.lastName}
                      </h2>
                      <p className="text-muted mb-1 d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }}>
                        <FaEnvelope className="text-primary" /> {profile.email}
                      </p>
                      <span className="badge bg-success border border-secondary" style={{ borderRadius: "8px" }}>
                        <FaCheckCircle className="me-1" /> Active Member
                      </span>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <form onSubmit={handleSaveProfile} noValidate>
                    <h3 className="h5 text-dark mb-3" style={{ fontWeight: "700" }}>Personal Details</h3>
                    <div className="row">
                      {/* First Name */}
                      <div className="col-md-6 app-form-group">
                        <label htmlFor="firstName" className="app-form-label">First Name</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={profile.firstName}
                          onChange={handleChange}
                          className="app-form-input"
                          required
                        />
                      </div>

                      {/* Last Name */}
                      <div className="col-md-6 app-form-group">
                        <label htmlFor="lastName" className="app-form-label">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={profile.lastName}
                          onChange={handleChange}
                          className="app-form-input"
                        />
                      </div>
                    </div>

                    <div className="row">
                      {/* Email (Read Only) */}
                      <div className="col-md-6 app-form-group">
                        <label htmlFor="email" className="app-form-label">Email Address (Account ID)</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profile.email}
                          className="app-form-input text-muted"
                          disabled
                          readOnly
                        />
                      </div>

                      {/* Phone */}
                      <div className="col-md-6 app-form-group">
                        <label htmlFor="phone" className="app-form-label">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          placeholder="e.g. +1 555-0199"
                          className="app-form-input"
                        />
                      </div>
                    </div>

                    <div className="app-form-group">
                      <label htmlFor="profileImage" className="app-form-label">Profile Image URL</label>
                      <input
                        type="url"
                        id="profileImage"
                        name="profileImage"
                        value={profile.profileImage}
                        onChange={handleChange}
                        placeholder="https://example.com/avatar.jpg"
                        className="app-form-input"
                      />
                    </div>

                    <hr className="my-4 border-secondary" />

                    <h3 className="h5 text-dark mb-3" style={{ fontWeight: "700" }}>Travel Customization</h3>

                    <div className="app-form-group">
                      <label htmlFor="favoriteDestination" className="app-form-label">Favorite Destinations</label>
                      <input
                        type="text"
                        id="favoriteDestination"
                        name="favoriteDestination"
                        value={profile.favoriteDestination}
                        onChange={handleChange}
                        placeholder="e.g. Paris, Maldives, Swiss Alps, Kyoto"
                        className="app-form-input"
                      />
                    </div>

                    <div className="app-form-group mb-4">
                      <label htmlFor="travelPreferences" className="app-form-label">Travel Preferences & Interests</label>
                      <textarea
                        id="travelPreferences"
                        name="travelPreferences"
                        value={profile.travelPreferences}
                        onChange={handleChange}
                        placeholder="Describe your travel style (e.g., Beach Relaxation, Historical Museums, Fine Dining, Backpacking)..."
                        className="app-form-textarea"
                        rows="3"
                      ></textarea>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-end gap-3 mt-4">
                      <button
                        type="submit"
                        className="app-primary-btn"
                        disabled={saving}
                        aria-busy={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving Profile...
                          </>
                        ) : (
                          <>
                            <FaSave /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Profile;