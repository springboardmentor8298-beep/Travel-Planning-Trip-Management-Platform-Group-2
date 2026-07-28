import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/AuthService";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await registerUser(form);
      alert(response.data.message);

      if (response.data.message === "User Registered Successfully") {
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      alert("Signup failed. Make sure the backend is running.");
    }
  };

  return (
    <div className="auth-page">
      <div className="card">
        <h1>Create TripNest Account</h1>

        <form onSubmit={handleSignup}>
          <label>Name</label>
          <input name="name" value={form.name} onChange={change} placeholder="Enter name" required />

          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={change}
                 placeholder="Enter email" required />

          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={change}
                 placeholder="Create password" required />

          <button type="submit">Sign Up</button>
        </form>

        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

export default Signup;
