import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/signin", {
        username: formData.username,
        password: formData.password,
      });

      const data = response.data;

      // Save JWT
      localStorage.setItem("token", data.token);

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          username: data.username,
          email: data.email,
          roles: data.roles,
        })
      );

      // Go to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
        "Invalid username or password."
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

        {/* Logo */}
        <div style={styles.logo}>
          ✈️
        </div>

        {/* Title */}
        <h1 style={styles.title}>
          Welcome Back
        </h1>

        <p style={styles.subtitle}>
          Sign in to continue your TripNest journey
        </p>

        {/* Error */}
        {error && (
          <div style={styles.error}>
            ❌ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>

          {/* Username */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Username
            </label>

            <input
              className="aurora-input"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Password
            </label>

            <input
              className="aurora-input"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {/* Forgot Password */}
          <div style={styles.forgotContainer}>
            <Link
              to="/forgot-password"
              style={styles.forgotLink}
            >
              Forgot Password?
            </Link>
          </div>

          {/* Sign In */}
          <button
            type="submit"
            className="btn-aurora"
            disabled={loading}
            style={styles.loginButton}
          >
            {loading ? "Signing in..." : "🔐 Sign In"}
          </button>

        </form>

        {/* Signup */}
        <div style={styles.signupContainer}>

          <span style={styles.signupText}>
            Don't have an account?
          </span>

          {/* IMPORTANT:
              App.jsx uses /signup
          */}
          <Link
            to="/signup"
            style={styles.signupLink}
          >
            Create Account
          </Link>

        </div>

      </div>
    </div>
  );
};


// ==========================================
// STYLES
// ==========================================

const styles = {

  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0f1e",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    padding: "36px",
  },

  logo: {
    width: "64px",
    height: "64px",
    margin: "0 auto 18px",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, #7c3aed, #06b6d4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
  },

  title: {
    color: "#f1f5f9",
    fontSize: "28px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "8px",
    fontFamily: "'Space Grotesk', sans-serif",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "28px",
  },

  error: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    padding: "12px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "20px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "18px",
  },

  label: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "500",
  },

  forgotContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-6px",
    marginBottom: "20px",
  },

  forgotLink: {
    color: "#a78bfa",
    fontSize: "13px",
    textDecoration: "none",
    cursor: "pointer",
  },

  loginButton: {
    width: "100%",
  },

  signupContainer: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "14px",
  },

  signupText: {
    color: "#64748b",
    marginRight: "6px",
  },

  signupLink: {
    color: "#a78bfa",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default Login;