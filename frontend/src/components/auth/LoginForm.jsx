import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaEnvelope } from "react-icons/fa";
import api from "../../services/api";
import PasswordField from "./PasswordField";
import SocialButtons from "./SocialButtons";
import "../../styles/Login.css";

function LoginForm() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "", remember: false });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData({ ...data, [name]: type === "checkbox" ? checked : value });
    setAlert({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. If Email is empty, show alert and do not proceed
    if (!data.email || !data.email.trim()) {
      setAlert({ type: "error", message: "Email is required" });
      return;
    }

    // 2. If Password is empty, show alert and do not proceed
    if (!data.password || !data.password.trim()) {
      setAlert({ type: "error", message: "Password is required" });
      return;
    }

    setIsLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const { token, email, role, message } = response.data;

      // 4. Only if backend returns HTTP 200 and a valid token is present
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("email", email || "");
        localStorage.setItem("role", role || "USER");

        setAlert({
          type: "success",
          message: message || "Login Successful",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        setAlert({
          type: "error",
          message: message || "Login failed. No token received from server.",
        });
      }
    } catch (error) {
      // 3. If Email or Password is invalid, show backend error
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Invalid Email or Password";

      setAlert({
        type: "error",
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card login-card">
      <header className="auth-card-header">
        <h2 className="auth-card-title">Welcome Back</h2>
        <p className="auth-card-subtitle">
          Continue planning your next adventure.
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
              value={data.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="auth-text-input"
              autoComplete="email"
              required
              aria-required="true"
            />
          </div>
        </div>

        {/* Password Field */}
        <PasswordField
          label="Password"
          name="password"
          value={data.password}
          onChange={handleChange}
          placeholder="Enter password"
          required
        />

        {/* Remember me & Forgot Password */}
        <div className="auth-meta-row">
          <label className="auth-remember-checkbox-label" htmlFor="remember">
            <input
              type="checkbox"
              name="remember"
              id="remember"
              checked={data.remember}
              onChange={handleChange}
              className="auth-checkbox-input"
            />
            <span>Remember Me</span>
          </label>

          <button
            type="button"
            className="auth-forgot-link-btn"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
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
              Signing in...
            </span>
          ) : (
            <span className="auth-btn-label-box">
              Login <FaArrowRight className="ms-2 auth-btn-arrow" aria-hidden="true" />
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

      {/* Social Login Buttons Container */}
      <SocialButtons />

      {/* Footer */}
      <footer className="auth-card-footer-box">
        <p className="auth-footer-text-content">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="auth-footer-link-action">
            Register
          </Link>
        </p>
      </footer>
    </div>
  );
}

export default LoginForm;
