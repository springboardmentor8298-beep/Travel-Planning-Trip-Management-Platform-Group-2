import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/85 via-emerald-900/70 to-teal-900/80" />

      <div className="relative w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-3">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">TripNest</h1>
          <p className="text-emerald-100/80 text-sm mt-1">Your next journey starts here.</p>
        </div>

        <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-5">Create your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-emerald-100/90">Full Name</label>
              <input
                type="text"
                placeholder="Keerthana"
                className="w-full mt-1 bg-white/90 border border-white/30 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-emerald-100/90">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full mt-1 bg-white/90 border border-white/30 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-emerald-100/90">Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                className="w-full mt-1 bg-white/90 border border-white/30 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-200 bg-red-900/40 border border-red-400/30 rounded-lg px-3 py-2 text-xs">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-emerald-100/80">
            Already have an account?{" "}
            <Link to="/login" className="text-white font-medium underline decoration-emerald-400 underline-offset-2">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
