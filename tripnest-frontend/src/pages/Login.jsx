import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/AuthService";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser({ email, password });

      if (response.data.message === "Login Successful") {
        localStorage.setItem("userEmail", email);
        navigate("/dashboard");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Login failed. Make sure the backend is running on port 8080.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card">
        <h1>TripNest</h1>
        <p className="subtitle">Plan your perfect journey</p>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                 placeholder="Enter email" required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 placeholder="Enter password" required />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>New to TripNest? <Link to="/signup">Create an account</Link></p>
      </div>
    </div>
  );
}

export default Login;
