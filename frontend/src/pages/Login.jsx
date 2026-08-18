import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";

/* Rotating travel quotes shown in the left panel */
const QUOTES = [
  { text: "The world is a book, and those who do not travel read only one page.", author: "Saint Augustine" },
  { text: "Travel is the only thing you buy that makes you richer.", author: "Anonymous" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "Adventure is worthwhile in itself.", author: "Amelia Earhart" },
  { text: "Life is short and the world is wide.", author: "Simon Raven" },
];

/* Left panel background images (cycling) */
const BG_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80", // mountains
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=80", // bali
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=80", // dubai
];

export default function Login() {
  const { login, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [touched, setTouched] = useState({});
  const [bgIndex, setBgIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  /* Cycle background & quote every 5 s */
  useEffect(() => {
    const id = setInterval(() => {
      setBgIndex((i) => (i + 1) % BG_IMAGES.length);
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
      setImgLoaded(false);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  /* Clear server error when user starts typing again */
  useEffect(() => {
    if (error) setError(null);
  }, [form]); // eslint-disable-line

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const touch = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const emailErr = touched.email && !form.email ? "Email is required" :
    touched.email && !/\S+@\S+\.\S+/.test(form.email) ? "Enter a valid email" : "";
  const passErr = touched.password && !form.password ? "Password is required" : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (emailErr || passErr || !form.email || !form.password) return;
    const ok = await login(form.email, form.password);
    if (ok) navigate("/");
  };

  const quote = QUOTES[quoteIndex];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex animate-fadeIn">

      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Background image with crossfade */}
        <img
          key={bgIndex}
          src={BG_IMAGES[bgIndex]}
          alt="travel"
          onLoad={() => setImgLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/70 via-brand-800/60 to-indigo-900/80" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl">✈</span>
            <span className="text-white font-extrabold text-xl tracking-tight">TripNest</span>
          </div>

          {/* Quote */}
          <div key={quoteIndex} className="animate-fadeInUp">
            <p className="text-white/90 text-xl font-light italic leading-relaxed mb-3">
              "{quote.text}"
            </p>
            <p className="text-white/50 text-sm">— {quote.author}</p>

            {/* Dot indicators */}
            <div className="flex gap-1.5 mt-6">
              {QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setQuoteIndex(i); setBgIndex(i % BG_IMAGES.length); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === quoteIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                />
              ))}
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["✈️ Trip Planning", "💰 Budget Tracking", "👥 Group Travel", "🗺️ Itineraries"].map((f) => (
              <span key={f} className="text-xs text-white/80 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-slate-50">
        <div className="w-full max-w-md animate-slideInRight">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white text-base">✈</span>
            <span className="font-extrabold text-xl text-brand-700">TripNest</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back 👋</h1>
            <p className="text-slate-500 mt-1.5 text-sm">
              Sign in to continue planning your adventures.
            </p>
          </div>

          {/* Server error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-scaleIn">
              <span className="text-base mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">📧</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={set("email")}
                  onBlur={touch("email")}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${emailErr
                    ? "border-red-300 focus:ring-red-200 bg-red-50"
                    : "border-slate-200 focus:ring-brand-200 focus:border-brand-400 bg-white"
                    }`}
                />
              </div>
              {emailErr && <p className="text-xs text-red-600 mt-1 ml-1">{emailErr}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-600 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={set("password")}
                  onBlur={touch("password")}
                  placeholder="Your password"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${passErr
                    ? "border-red-300 focus:ring-red-200 bg-red-50"
                    : "border-slate-200 focus:ring-brand-200 focus:border-brand-400 bg-white"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-base"
                  tabIndex={-1}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {passErr && <p className="text-xs text-red-600 mt-1 ml-1">{passErr}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-brand-200 transition-all duration-200 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          {/* Divider + Google — GoogleLoginButton handles its own visibility */}
          <GoogleLoginButton />

          {/* Register link */}
          <p className="text-sm text-slate-500 mt-6 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-600 font-bold hover:underline">
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
