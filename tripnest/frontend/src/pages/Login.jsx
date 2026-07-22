import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/boarding-pass.css";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Invalid username or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bp-page">
      <div style={{ width: "100%", maxWidth: 860 }}>
        <div className="bp-eyebrow">Trip Nest &nbsp;·&nbsp; Boarding Pass</div>
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
                    <div className="bp-route-code">YOU</div>
                    <div className="bp-route-label">Here</div>
                  </div>
                  <div className="bp-route-arrow" />
                  <div>
                    <div className="bp-route-code">TRP</div>
                    <div className="bp-route-label">Next Trip</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bp-stub-meta">
              PASSENGER&nbsp;&nbsp;<b>Returning</b>
              <br />
              DATE&nbsp;&nbsp;<b>{today}</b>
              <br />
              GATE&nbsp;&nbsp;<b>Sign In</b>
              <br />
              SEAT&nbsp;&nbsp;<b>Reserved for you</b>
            </div>
          </div>

          <div className="bp-perforation" />

          {/* Form */}
          <div className="bp-form-half">
            <div className="bp-stamp">
              <div className="bp-stamp-inner">
                Welcome
                <b>Back</b>
                Traveler
              </div>
            </div>

            <h2 className="bp-title">Sign in</h2>
            <p className="bp-subtitle">Check in to continue planning your journey.</p>

            {error && <div className="bp-alert bp-alert-error">⚠ {error}</div>}

            <form className="bp-form" onSubmit={handleSubmit}>
              <div className="bp-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="bp-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>
              <button className="bp-submit" type="submit" disabled={loading}>
                {loading ? "Checking in…" : "Board · Sign In"}
              </button>
            </form>

            <p className="bp-switch">
              New here? <Link to="/signup">Create your boarding pass</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;