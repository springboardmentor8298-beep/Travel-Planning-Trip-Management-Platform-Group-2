import { useState } from "react";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

import "../styles/Login.css";

import { MdEmail, MdLock } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import loginIllustration from "../assets/login-illustration.png";

function Login() {

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();
    const handleChange = (event) => {

        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });

        setErrorMessage("");
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setLoading(true);

        try {

            const response = await loginUser(formData);

            setErrorMessage("");

            localStorage.setItem("token", response.token);

            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: response.id,
                    name: response.name,
                    email: response.email
                })
            );

            // console.log(localStorage.getItem("token"));

            // console.log(response);

            navigate("/home");

        } catch (error) {

            console.log(error);

            setErrorMessage("Invalid email or password.");

        } finally{
            setLoading(false);
        }

    };

return (
  <div className="login-page">
  <div className="login-left">

      <img
          src={loginIllustration}
          alt="Travel Illustration"
          className="login-illustration"
      />

  </div>

    <div className="login-right">
      <div className="login-card">
        <h2>Welcome Back</h2>

        <p>Login to continue planning your trips.</p>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>

          <div className="input-group">
            <MdEmail className="input-icon" />

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          <label>Password</label>

          <div className="input-group">
            <MdLock className="input-icon" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>
          Don't have an account?{" "}
          <span className="register-link" onClick={() => navigate("/register")}>
            Register
          </span>
        </p>
      </div>
    </div>
  </div>
);

}

export default Login;