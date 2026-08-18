import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PasswordResetService from "../services/passwordResetService";

const ResetPassword = () => {

  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    setSuccess("");
    setError("");

    if (!token) {
      setError(
        "Invalid or missing reset token."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {

      setLoading(true);

      const response =
        await PasswordResetService
          .resetPassword(
            token,
            password
          );

      setSuccess(
        response.message
      );

      setPassword("");
      setConfirmPassword("");

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to reset password."
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
          🔑
        </div>

        <h1 style={styles.title}>
          Reset Password
        </h1>

        <p style={styles.subtitle}>
          Enter your new TripNest password.
        </p>

        {success && (
          <div style={styles.success}>
            ✅ {success}
            <br />

            <Link
              to="/login"
              style={styles.loginLink}
            >
              Go to Login →
            </Link>
          </div>
        )}

        {error && (
          <div style={styles.error}>
            ❌ {error}
          </div>
        )}

        {!success && (

          <form onSubmit={handleSubmit}>

            <label style={styles.label}>
              New Password
            </label>

            <input
              className="aurora-input"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <label style={styles.label}>
              Confirm Password
            </label>

            <input
              className="aurora-input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
              style={{
                marginTop: "8px"
              }}
            />

            <button
              className="btn-aurora"
              type="submit"
              disabled={loading}
              style={styles.button}
            >
              {loading
                ? "Resetting..."
                : "🔐 Reset Password"}
            </button>

          </form>

        )}

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
    marginBottom: "25px"
  },

  label: {
    display: "block",
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "8px",
    marginTop: "15px"
  },

  button: {
    width: "100%",
    marginTop: "22px"
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

  loginLink: {
    display: "inline-block",
    marginTop: "10px",
    color: "#a78bfa",
    textDecoration: "none"
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

export default ResetPassword;