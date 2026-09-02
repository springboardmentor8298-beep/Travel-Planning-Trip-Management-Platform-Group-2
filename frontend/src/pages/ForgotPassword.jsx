import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import api from "../services/api";
import PasswordField from "../components/auth/PasswordField";
import LeftPanel from "../components/auth/LeftPanel";
import "../styles/Login.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const response = await api.post("/auth/reset-password", {
        email,
        password: newPassword,
      });

      setAlert({ type: "success", message: response.data || "Password updated successfully." });
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      const message = error?.response?.data || "Failed to reset password. Please try again.";
      setAlert({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page login-page">
      {/* Left Visual Panel: 42% width, 100vh height */}
      <LeftPanel />

      {/* Right Form Panel: 58% width, 100vh height */}
      <main
        className="auth-right-panel login-right-panel"
        aria-label="Reset your TripNest password"
      >
        <div className="auth-right-panel-bg" aria-hidden="true">
          <span className="auth-right-blob auth-right-blob--one" />
          <span className="auth-right-blob auth-right-blob--two" />
        </div>

        <div className="auth-right-panel-inner auth-animate auth-animate--slide-up">
          <div className="auth-card login-card">
            <header className="auth-card-header">
              <span className="auth-input-label" style={{ color: "var(--auth-accent-color)", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Reset Password</span>
              <h2 className="auth-card-title">Forgot your password?</h2>
              <p className="auth-card-subtitle">Enter your email and a new password to update your account.</p>
            </header>

            {alert.message && (
              <div className={`auth-alert ${alert.type === "success" ? "auth-alert-success" : "auth-alert-error"}`}>
                {alert.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {/* Email Field with Static Label */}
              <div className="auth-input-field-group">
                <label htmlFor="email" className="auth-input-label">
                  Email Address
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon-slot">
                    <FaEnvelope className="auth-input-field-icon" aria-hidden="true" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="auth-text-input"
                    autoComplete="email"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <PasswordField
                label="New Password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />

              <PasswordField
                label="Confirm Password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />

              <button type="submit" className="auth-action-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="auth-btn-spinner-box">
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Updating...
                  </span>
                ) : (
                  <span className="auth-btn-label-box">Update Password</span>
                )}
              </button>
            </form>

            <footer className="auth-card-footer-box">
              <p className="auth-footer-text-content">
                Remembered your password?{" "}
                <Link to="/" className="auth-footer-link-action">Login</Link>
              </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;
