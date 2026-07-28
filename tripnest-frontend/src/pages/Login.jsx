import { useEffect, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      const refreshToken = params.get("refreshToken");
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      window.history.replaceState({}, document.title, "/login");
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (event) => {
    setError("");
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Bad credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <AuthLayout mode="login">
      <div className="auth-heading">
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in to TripNest</h2>
        <p>Continue planning journeys worth remembering.</p>
      </div>

      <button type="button" className="google-button" onClick={handleGoogleLogin}>
        <span className="google-mark">G</span> Continue with Google
      </button>
      <div className="auth-divider"><span>or continue with email</span></div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {location.state?.registered && <div className="auth-success" role="status">Account created successfully. Sign in to continue.</div>}
        {error && <div className="auth-error" role="alert">{error}</div>}
        <label>Email address
          <span className="auth-input"><Mail size={18} /><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" required /></span>
        </label>
        <label>Password
          <span className="auth-input"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" autoComplete="current-password" required /><button type="button" title={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
        </label>
        <div className="auth-options"><label className="remember-me"><input type="checkbox" /> Remember me</label><button type="button" className="auth-link-button">Forgot password?</button></div>
        <button className="auth-submit" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={18} /> Signing in...</> : "Sign in"}</button>
      </form>
    </AuthLayout>
  );
}

export default Login;
