import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const Collaboration = () => {
  const { id } = useParams();

  const [members, setMembers] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // LOAD MEMBERS
  // =========================
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/trips/${id}/members`
      );

      setMembers(response.data);
    } catch (err) {
      console.error("Error loading members:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load trip members."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMembers();
    }
  }, [id]);

  // =========================
  // ADD MEMBER
  // =========================
  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    try {
      setAdding(true);
      setError("");

      const response = await api.post(
        `/trips/${id}/members`,
        {
          username: username.trim(),
        }
      );

      setMembers((prev) => [
        ...prev,
        response.data,
      ]);

      setUsername("");

      alert(
        `${response.data.username} added to the trip!`
      );
    } catch (err) {
      console.error("Error adding member:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to add member."
      );
    } finally {
      setAdding(false);
    }
  };

  // =========================
  // REMOVE MEMBER
  // =========================
  const handleRemoveMember = async (userId) => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this member?"
    );

    if (!confirmRemove) {
      return;
    }

    try {
      await api.delete(
        `/trips/${id}/members/${userId}`
      );

      setMembers((prev) =>
        prev.filter(
          (member) => member.userId !== userId
        )
      );

      alert("Member removed successfully.");
    } catch (err) {
      console.error(
        "Error removing member:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to remove member."
      );
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />

      <main style={styles.main}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              👥 Trip Collaboration
            </h1>

            <p style={styles.subtitle}>
              Invite people and plan your trip together
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {/* ADD MEMBER */}
        <div
          className="glass-card"
          style={styles.addCard}
        >
          <h2 style={styles.sectionTitle}>
            ➕ Add Traveler
          </h2>

          <p style={styles.description}>
            Enter the username of a registered
            TripNest user.
          </p>

          <form
            onSubmit={handleAddMember}
            style={styles.form}
          >
            <input
              className="aurora-input"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              style={styles.input}
            />

            <button
              className="btn-aurora"
              type="submit"
              disabled={adding}
            >
              {adding
                ? "Adding..."
                : "Add Member"}
            </button>
          </form>
        </div>

        {/* MEMBERS */}
        <div
          className="glass-card"
          style={styles.membersCard}
        >
          <div style={styles.membersHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                👥 Trip Members
              </h2>

              <p style={styles.description}>
                {members.length} traveler
                {members.length !== 1
                  ? "s"
                  : ""}{" "}
                in this trip
              </p>
            </div>
          </div>

          {loading ? (
            <p style={styles.muted}>
              Loading members...
            </p>
          ) : members.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>
                👥
              </div>

              <h3 style={styles.emptyTitle}>
                No members yet
              </h3>

              <p style={styles.muted}>
                Add travelers to start collaborating.
              </p>
            </div>
          ) : (
            <div style={styles.memberList}>
              {members.map((member) => (
                <div
                  key={member.id}
                  style={styles.member}
                >
                  {/* AVATAR */}
                  <div style={styles.avatar}>
                    {member.firstName
                      ? member.firstName
                          .charAt(0)
                          .toUpperCase()
                      : member.username
                          .charAt(0)
                          .toUpperCase()}
                  </div>

                  {/* INFO */}
                  <div style={styles.memberInfo}>
                    <div style={styles.nameRow}>
                      <h3 style={styles.memberName}>
                        {member.firstName ||
                          member.username}{" "}
                        {member.lastName || ""}
                      </h3>

                      <span
                        style={{
                          ...styles.role,
                          ...(member.role === "OWNER"
                            ? styles.ownerRole
                            : styles.memberRole),
                        }}
                      >
                        {member.role === "OWNER"
                          ? "👑 Owner"
                          : "Member"}
                      </span>
                    </div>

                    <p style={styles.username}>
                      @{member.username}
                    </p>

                    <p style={styles.email}>
                      {member.email}
                    </p>
                  </div>

                  {/* REMOVE */}
                  {member.role !== "OWNER" && (
                    <button
                      className="btn-ghost"
                      onClick={() =>
                        handleRemoveMember(
                          member.userId
                        )
                      }
                      style={styles.removeButton}
                    >
                      🗑 Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

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
    maxWidth: "1200px",
  },

  header: {
    marginBottom: "24px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#f1f5f9",
    fontFamily: "'Space Grotesk', sans-serif",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    marginTop: "4px",
  },

  error: {
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  addCard: {
    padding: "24px",
    marginBottom: "24px",
  },

  sectionTitle: {
    color: "#f1f5f9",
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
  },

  description: {
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "6px",
  },

  form: {
    display: "flex",
    gap: "12px",
    marginTop: "18px",
  },

  input: {
    flex: 1,
    maxWidth: "450px",
  },

  membersCard: {
    padding: "24px",
  },

  membersHeader: {
    marginBottom: "20px",
  },

  memberList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  member: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(139,92,246,0.15)",
    borderRadius: "12px",
  },

  avatar: {
    width: "48px",
    height: "48px",
    minWidth: "48px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #7c3aed, #06b6d4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
  },

  memberInfo: {
    flex: 1,
  },

  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  memberName: {
    color: "#f1f5f9",
    fontSize: "16px",
    margin: 0,
  },

  username: {
    color: "#a78bfa",
    fontSize: "12px",
    margin: "4px 0",
  },

  email: {
    color: "#64748b",
    fontSize: "12px",
    margin: 0,
  },

  role: {
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
  },

  ownerRole: {
    background: "rgba(245,158,11,0.12)",
    color: "#fbbf24",
  },

  memberRole: {
    background: "rgba(124,58,237,0.12)",
    color: "#c4b5fd",
  },

  removeButton: {
    fontSize: "12px",
    padding: "8px 12px",
    color: "#fca5a5",
  },

  muted: {
    color: "#64748b",
    fontSize: "13px",
  },

  empty: {
    textAlign: "center",
    padding: "40px 20px",
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "10px",
  },

  emptyTitle: {
    color: "#f1f5f9",
    margin: "0 0 6px",
  },
};

export default Collaboration;