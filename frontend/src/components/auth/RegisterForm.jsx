import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaCheck,
  FaEnvelope,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import api from "../../services/api";
import PasswordField from "./PasswordField";
import SocialButtons from "./SocialButtons";
import "../../styles/Register.css";

const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { id: "lower", label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { id: "number", label: "One number", test: (value) => /[0-9]/.test(value) },
  { id: "special", label: "One special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setAlert({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate fields and show validation error if any field is empty
    if (!formData.firstName || !formData.firstName.trim()) {
      setAlert({ type: "error", message: "First Name is required" });
      return;
    }
    if (!formData.lastName || !formData.lastName.trim()) {
      setAlert({ type: "error", message: "Last Name is required" });
      return;
    }
    if (!formData.email || !formData.email.trim()) {
      setAlert({ type: "error", message: "Email is required" });
      return;
    }
    if (!formData.phone || !formData.phone.trim()) {
      setAlert({ type: "error", message: "Phone number is required" });
      return;
    }
    if (!formData.password) {
      setAlert({ type: "error", message: "Password is required" });
      return;
    }
    if (!formData.confirmPassword) {
      setAlert({ type: "error", message: "Confirm Password is required" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const response = await api.post("/auth/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      // 4. Successful registration alert and redirect to Login (do NOT navigate to dashboard)
      setAlert({
        type: "success",
        message: response.data || "User Registered Successfully",
      });
      setTimeout(() => navigate("/", { state: { showLoginFormDirectly: true } }), 1500);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Registration failed. Please try again.";
      setAlert({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card register-card">
      <header className="auth-card-header">
        <h2 className="auth-card-title">Create Your Account</h2>
        <p className="auth-card-subtitle">
          Join TripNest and make your travel dreams a reality.
        </p>
      </header>

      {alert.message && (
        <div
          className={`auth-alert ${alert.type === "success" ? "auth-alert-success" : "auth-alert-error"}`}
          role="alert"
          aria-live="polite"
        >
          {alert.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Name Fields: First Name & Last Name (Side by Side) */}
        <div className="auth-row-layout">
          <div className="auth-col-layout">
            <div className="auth-input-field-group">
              <label htmlFor="firstName" className="auth-input-label">
                First Name
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon-slot">
                  <FaUser className="auth-input-field-icon" aria-hidden="true" />
                </span>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className="auth-text-input"
                  autoComplete="given-name"
                  required
                  aria-required="true"
                />
              </div>
            </div>
          </div>

          <div className="auth-col-layout">
            <div className="auth-input-field-group">
              <label htmlFor="lastName" className="auth-input-label">
                Last Name
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon-slot">
                  <FaUser className="auth-input-field-icon" aria-hidden="true" />
                </span>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className="auth-text-input"
                  autoComplete="family-name"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Email Address Field */}
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
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="auth-text-input"
              autoComplete="email"
              required
              aria-required="true"
            />
          </div>
        </div>

        {/* Phone Number Field */}
        <div className="auth-input-field-group">
          <label htmlFor="phone" className="auth-input-label">
            Phone Number
          </label>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon-slot">
              <FaPhone className="auth-input-field-icon" aria-hidden="true" />
            </span>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="auth-text-input"
              autoComplete="tel"
            />
          </div>
        </div>

        {/* Password & Confirm Password (Side by Side) */}
        <div className="auth-row-layout">
          <div className="auth-col-layout">
            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="auth-col-layout">
            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
            />
          </div>
        </div>

        {/* Password checklist container */}
        <div className="auth-requirements-box">
          <p className="auth-requirements-heading">Password must contain:</p>
          <ul className="auth-requirements-checklist" aria-label="Password checklist">
            {PASSWORD_REQUIREMENTS.map((requirement) => {
              const isValid = requirement.test(formData.password);
              return (
                <li key={requirement.id} className={`auth-requirement-item ${isValid ? "passed" : ""}`}>
                  <span className="auth-requirement-check-box">
                    <FaCheck className="auth-requirement-check-icon" aria-hidden="true" />
                  </span>
                  <span className="auth-requirement-text">{requirement.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          className="auth-action-btn"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className="auth-btn-spinner-box">
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Registering...
            </span>
          ) : (
            <span className="auth-btn-label-box">
              Create Account <FaArrowRight className="ms-2 auth-btn-arrow" aria-hidden="true" />
            </span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="auth-divider-separator" role="separator" aria-label="Or continue with">
        <span className="auth-divider-line-bar"></span>
        <span className="auth-divider-text-content">OR</span>
        <span className="auth-divider-line-bar"></span>
      </div>

      {/* Social login buttons */}
      <SocialButtons />

      {/* Footer link to Login */}
      <footer className="auth-card-footer-box">
        <p className="auth-footer-text-content">
          Already have an account?{" "}
          <Link to="/" className="auth-footer-link-action">
            Login
          </Link>
        </p>
      </footer>
    </div>
  );
}

export default RegisterForm;
