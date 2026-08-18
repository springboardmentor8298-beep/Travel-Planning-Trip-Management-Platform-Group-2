import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

/* Password strength helper (same as Register) */
function strength(pw) {
  if (!pw || pw.length < 6) return 0;
  let s = 1;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 5);
}

const STRENGTH_META = [
  { label: "Too short", bar: "bg-red-400", text: "text-red-500" },
  { label: "Weak", bar: "bg-orange-400", text: "text-orange-500" },
  { label: "Fair", bar: "bg-amber-400", text: "text-amber-600" },
  { label: "Strong", bar: "bg-emerald-400", text: "text-emerald-600" },
  { label: "Very strong", bar: "bg-emerald-500", text: "text-emerald-700" },
];

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [status, setStatus] = useState("idle"); // idle|loading|done|error
  const [errorMsg, setErrorMsg] = useState("");

  /* Redirect if no token in URL */
  useEffect(() => {
    if (!token) navigate("/forgot-password", { replace: true });
  }, [token, navigate]);

  const pw_strength = strength(password);
  const strengthInfo = STRENGTH_META[Math.max(0, pw_strength - 1)];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters."); return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords don't match."); return;
    }
    setErrorMsg("");
    setStatus("loading");
    try {
      await axiosClient.post("/auth/reset-password", { token, password });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      if (!err?.response) {
        setErrorMsg("Cannot connect to server. Please make sure the backend is running on port 8080.");
      } else {
        setErrorMsg(err?.response?.data?.message || "Reset failed. The link may have expired.");
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-slate-50 animate-fadeIn">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

          {/* Icon + heading */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-3xl mx-auto mb-4">
              🔒
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Set a new password</h1>
            <p className="text-slate-500 text-sm mt-2">
              Choose a strong password for your TripNest account.
            </p>
          </div>

          {/* ── Success state ── */}
          {status === "done" ? (
            <div className="space-y-5 animate-scaleIn">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🎉</span>
                <div>
                  <p className="font-semibold text-emerald-800">Password updated!</p>
                  <p className="text-sm text-emerald-700 mt-0.5">
                    Your password has been changed. You can now sign in with your new password.
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all active:scale-[0.98]"
              >
                Sign In →
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {errorMsg && (
                <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-scaleIn">
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* New password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white transition-all"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Strength meter */}
                {password && (
                  <div className="mt-2 space-y-1 animate-fadeIn">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <div key={n}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${n <= pw_strength ? strengthInfo.bar : "bg-slate-200"}`}
                        />
                      ))}
                    </div>
                    <p className={`text-[11px] font-semibold ${strengthInfo.text}`}>
                      {strengthInfo.label}{pw_strength >= 4 ? " ✓" : ""}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                  <input
                    type={showCf ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setErrorMsg(""); }}
                    placeholder="Repeat your password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white transition-all"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowCf(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCf ? "🙈" : "👁️"}
                  </button>
                  {/* Match tick */}
                  {confirm && confirm === password && (
                    <span className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-sm">✓</span>
                  )}
                </div>
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1 animate-fadeIn">
                    ⚠ Passwords don't match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !password || !confirm}
                className="w-full bg-brand-600 hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-brand-200 transition-all duration-200"
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Updating…
                  </span>
                ) : "Update Password →"}
              </button>

              <Link
                to="/login"
                className="block text-center text-sm text-slate-500 hover:text-brand-600 transition-colors"
              >
                ← Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
