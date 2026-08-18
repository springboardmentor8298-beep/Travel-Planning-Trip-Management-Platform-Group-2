import { useState } from "react";
import { Link } from "react-router-dom";
import PasswordResetService from "../services/passwordResetService";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {

      setLoading(true);

      const response =
        await PasswordResetService
          .forgotPassword(email);

      setMessage(response.message);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      <div
        className="glass-card"
        style={styles.card}
      >

        <div style={styles.icon}>
          🔐
        </div>

        <h1 style={styles.title}>
          Forgot Password?
        </h1>

        <p style={styles.subtitle}>
          Enter your email and we'll send you
          a password reset link.
        </p>

        {message && (
          <div style={styles.success}>
            ✅ {message}
          </div>
        )}

        {error && (
          <div style={styles.error}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label style={styles.label}>
            Email Address
          </label>

          <input
            className="aurora-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <button
            className="btn-aurora"
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Sending..."
              : "📧 Send Reset Link"}
          </button>

        </form>

        <Link
          to="/login"
          style={styles.back}
        >
          ← Back to Login
        </Link>

      </div>

    </div>
  );
};

const styles = {

  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0f1e",
    padding: "20px"
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    padding: "36px"
  },

  icon: {
    fontSize: "42px",
    textAlign: "center",
    marginBottom: "15px"
  },

  title: {
    color: "#f1f5f9",
    textAlign: "center",
    fontSize: "26px",
    marginBottom: "10px"
  },

  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "25px"
  },

  label: {
    display: "block",
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "8px"
  },

  button: {
    width: "100%",
    marginTop: "20px"
  },

  success: {
    background: "rgba(16,185,129,0.1)",
    border:
      "1px solid rgba(16,185,129,0.3)",
    color: "#6ee7b7",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "20px"
  },

  error: {
    background: "rgba(239,68,68,0.1)",
    border:
      "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "20px"
  },

  back: {
    display: "block",
    textAlign: "center",
    marginTop: "22px",
    color: "#a78bfa",
    textDecoration: "none",
    fontSize: "14px"
  }

};

export default ForgotPassword;