import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/boarding-pass.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await signup(formData);
      setSuccess("Ticket issued! Redirecting to sign in…");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Signup failed. Username or email may already be in use.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bp-page">
      <div style={{ width: "100%", maxWidth: 860 }}>
        <div className="bp-eyebrow">Trip Nest &nbsp;·&nbsp; New Boarding Pass</div>
        <div className="bp-card">
          {/* Stub */}
          <div className="bp-stub">
            <div>
              <div className="bp-logo">
                Trip<span>Nest</span>
              </div>
              <div className="bp-route">
                <div className="bp-route-row">
                  <div>
                    <div className="bp-route-code">NEW</div>
                    <div className="bp-route-label">Traveler</div>
                  </div>
                  <div className="bp-route-arrow" />
                  <div>
                    <div className="bp-route-code">TRP</div>
                    <div className="bp-route-label">Trip Nest</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bp-stub-meta">
              CLASS&nbsp;&nbsp;<b>Traveler</b>
              <br />
              STATUS&nbsp;&nbsp;<b>Unregistered</b>
              <br />
              GATE&nbsp;&nbsp;<b>Sign Up</b>
              <br />
              BAGGAGE&nbsp;&nbsp;<b>Trips, budgets, itineraries</b>
            </div>
          </div>

          <div className="bp-perforation" />

          {/* Form */}
          <div className="bp-form-half">
            <div className="bp-stamp">
              <div className="bp-stamp-inner">
                Journey
                <b>Begins</b>
                Here
              </div>
            </div>

            <h2 className="bp-title">Create your pass</h2>
            <p className="bp-subtitle">A few details and you're cleared for takeoff.</p>

            {error && <div className="bp-alert bp-alert-error">⚠ {error}</div>}
            {success && <div className="bp-alert bp-alert-success">✓ {success}</div>}

            <form className="bp-form" onSubmit={handleSubmit}>
              <div className="bp-row">
                <div className="bp-field">
                  <label htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    autoComplete="given-name"
                  />
                </div>
                <div className="bp-field">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="bp-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="bp-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="bp-row">
                <div className="bp-field">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Optional"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>
                <div className="bp-field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <button className="bp-submit" type="submit" disabled={loading}>
                {loading ? "Issuing ticket…" : "Issue My Pass"}
              </button>
            </form>

            <p className="bp-switch">
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
