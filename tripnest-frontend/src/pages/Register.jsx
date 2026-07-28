import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../services/authService";

import { MdPerson, MdEmail, MdLock } from "react-icons/md";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import loginIllustration from "../assets/login-illustration.png";

import "../styles/Register.css";
function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,

      [event.target.name]: event.target.value,
    });

    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");

    if (formData.password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");

      return;
    }

    setLoading(true);

    try {
      await registerUser(formData);

      navigate("/login");
    } catch (error) {
      console.log(error);

      setErrorMessage("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <img
          src={loginIllustration}
          alt="Travel"
          className="login-illustration"
        />
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Create Your Account ✨</h2>

          <p>Start planning your next adventure with TripNest.</p>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <form onSubmit={handleSubmit}>
            <label>Full Name</label>

            <div className="input-group">
              <MdPerson className="input-icon" />

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <label>Email Address</label>

            <div className="input-group">
              <MdEmail className="input-icon" />

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <label>Password</label>

            <div className="input-group">
              <MdLock className="input-icon" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <label>Confirm Password</label>

            <div className="input-group">
              <MdLock className="input-icon" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p>
            Already have an account?{" "}
            <span className="register-link" onClick={() => navigate("/login")}>
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
