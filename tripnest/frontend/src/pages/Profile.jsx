import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const Profile = () => {
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/user/profile");

      setProfile(response.data);

      setFormData({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        phone: response.data.phone || "",
      });

    } catch (err) {
      console.error("Error loading profile:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load profile."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // EDIT PROFILE
  // ==========================================

  const handleEdit = () => {
    setMessage("");
    setError("");

    setFormData({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
    });

    setEditing(true);
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancel = () => {
    setFormData({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
    });

    setEditing(false);
    setError("");
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleUpdate = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await api.put(
        "/user/profile",
        formData
      );

      // Update profile immediately
      setProfile(response.data);

      setFormData({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        phone: response.data.phone || "",
      });

      setEditing(false);

      setMessage("Profile updated successfully!");

      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (err) {
      console.error("Error updating profile:", err);

      setError(
        err.response?.data?.message ||
        "Failed to update profile."
      );

    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar />

        <main style={styles.main}>
          <div style={styles.loading}>
            Loading profile...
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div style={styles.container}>

      <Sidebar />

      <main style={styles.main}>

        {/* HEADER */}

        <h1 style={styles.title}>
          My Profile 👤
        </h1>

        {/* SUCCESS */}

        {message && (
          <div style={styles.successBox}>
            ✅ {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div style={styles.errorBox}>
            ❌ {error}
          </div>
        )}

        {/* PROFILE CARD */}

        <div
          className="glass-card"
          style={styles.profileCard}
        >

          {/* PROFILE HEADER */}

          <div style={styles.avatarSection}>

            <div style={styles.avatar}>
              {(
                profile?.firstName ||
                profile?.username ||
                "U"
              ).charAt(0)}
            </div>

            <div>

              <h2 style={styles.profileName}>
                {profile?.firstName || ""}
                {" "}
                {profile?.lastName || ""}
              </h2>

              <p style={styles.profileUsername}>
                @{profile?.username}
              </p>

              <span
                className="badge badge-upcoming"
                style={{
                  marginTop: "8px",
                  display: "inline-flex",
                }}
              >
                {profile?.roles?.[0]
                  ?.replace("ROLE_", "") ||
                  "TRAVELER"}
              </span>

            </div>

          </div>

          <div className="divider" />

          {/* VIEW MODE */}

          {!editing ? (

            <div style={styles.infoGrid}>

              <InfoItem
                label="First Name"
                value={profile?.firstName}
                icon="👤"
              />

              <InfoItem
                label="Last Name"
                value={profile?.lastName}
                icon="👤"
              />

              <InfoItem
                label="Email"
                value={profile?.email}
                icon="✉️"
              />

              <InfoItem
                label="Phone"
                value={profile?.phone}
                icon="📱"
              />

              <InfoItem
                label="Username"
                value={profile?.username}
                icon="🔑"
              />

              <InfoItem
                label="Role"
                value={
                  profile?.roles?.[0]
                    ?.replace("ROLE_", "") ||
                  "TRAVELER"
                }
                icon="🎭"
              />

              {/* EDIT BUTTON */}

              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "8px",
                }}
              >

                <button
                  className="btn-aurora"
                  onClick={handleEdit}
                >
                  ✏️ Edit Profile
                </button>

              </div>

            </div>

          ) : (

            /* EDIT MODE */

            <div style={styles.editForm}>

              <div style={styles.formGrid}>

                <InputField
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />

                <InputField
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />

                <InputField
                  name="phone"
                  label="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />

              </div>

              {/* READ ONLY INFORMATION */}

              <div style={styles.readOnlyGrid}>

                <div style={styles.infoItem}>
                  <p style={styles.infoLabel}>
                    ✉️ Email
                  </p>

                  <p style={styles.infoValue}>
                    {profile?.email}
                  </p>
                </div>

                <div style={styles.infoItem}>
                  <p style={styles.infoLabel}>
                    🔑 Username
                  </p>

                  <p style={styles.infoValue}>
                    {profile?.username}
                  </p>
                </div>

              </div>

              {/* ACTIONS */}

              <div style={styles.editActions}>

                <button
                  className="btn-ghost"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="btn-aurora"
                  onClick={handleUpdate}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "💾 Save Changes"}
                </button>

              </div>

            </div>

          )}

        </div>

      </main>

    </div>
  );
};


// ==========================================
// INFO ITEM
// ==========================================

const InfoItem = ({
  label,
  value,
  icon,
}) => {

  return (
    <div style={styles.infoItem}>

      <p style={styles.infoLabel}>
        {icon} {label}
      </p>

      <p style={styles.infoValue}>
        {value || "Not set"}
      </p>

    </div>
  );
};


// ==========================================
// INPUT FIELD
// ==========================================

const InputField = ({
  name,
  label,
  value,
  onChange,
  placeholder,
}) => {

  return (
    <div style={styles.inputGroup}>

      <label style={styles.label}>
        {label}
      </label>

      <input
        className="aurora-input"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

    </div>
  );
};


// ==========================================
// STYLES
// ==========================================

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

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#f1f5f9",
    fontFamily: "'Space Grotesk', sans-serif",
    marginBottom: "24px",
  },

  loading: {
    color: "#94a3b8",
    fontSize: "16px",
  },

  successBox: {
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#6ee7b7",
    fontSize: "14px",
    marginBottom: "20px",
  },

  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#fca5a5",
    fontSize: "14px",
    marginBottom: "20px",
  },

  profileCard: {
    padding: "32px",
  },

  avatarSection: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "24px",
  },

  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #7c3aed, #06b6d4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "700",
    color: "white",
    textTransform: "uppercase",
    flexShrink: 0,
  },

  profileName: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#f1f5f9",
    fontFamily: "'Space Grotesk', sans-serif",
  },

  profileUsername: {
    color: "#7c3aed",
    fontSize: "14px",
    marginTop: "4px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  readOnlyGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "20px",
  },

  infoItem: {
    padding: "16px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "10px",
    border:
      "1px solid rgba(255,255,255,0.06)",
  },

  infoLabel: {
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "6px",
  },

  infoValue: {
    color: "#f1f5f9",
    fontSize: "15px",
    fontWeight: "500",
  },

  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
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

  editActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "8px",
  },
};

export default Profile;