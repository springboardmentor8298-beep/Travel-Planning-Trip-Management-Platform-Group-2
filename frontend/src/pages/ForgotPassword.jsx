import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await axiosClient.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      // Network error = backend not running; HTTP error = use server message
      if (!err?.response) {
        setErrorMsg("Cannot connect to server. Please make sure the backend is running on port 8080.");
      } else {
        setErrorMsg(err?.response?.data?.message || "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-slate-50 animate-fadeIn">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

          {/* Icon + heading */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-3xl mx-auto mb-4">
              🔑
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Forgot your password?</h1>
            <p className="text-slate-500 text-sm mt-2">
              Enter the email address linked to your TripNest account and we'll send
              you a reset link — valid for 30 minutes.
            </p>
          </div>

          {/* ── Success state ── */}
          {status === "sent" ? (
            <div className="animate-scaleIn space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">✅</span>
                <div>
                  <p className="font-semibold text-emerald-800">Check your inbox!</p>
                  <p className="text-sm text-emerald-700 mt-0.5">
                    If <strong>{email}</strong> is registered, a password-reset link
                    has been sent. Check your spam folder if you don't see it.
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setStatus("idle"); setEmail(""); }}
                className="w-full border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium py-2.5 rounded-xl text-sm transition-all"
              >
                Try a different email
              </button>

              <Link
                to="/login"
                className="block text-center text-sm text-brand-600 font-semibold hover:underline"
              >
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {errorMsg && (
                <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-scaleIn">
                  <span className="mt-0.5 flex-shrink-0">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">📧</span>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !email.trim()}
                className="w-full bg-brand-600 hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-brand-200 transition-all duration-200"
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending reset link…
                  </span>
                ) : "Send Reset Link →"}
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

        {/* Bottom hint */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Didn't get an email? Check your spam or{" "}
          <button
            onClick={() => { setStatus("idle"); }}
            className="text-brand-600 hover:underline font-medium"
          >
            try again
          </button>
          .
        </p>
      </div>
    </div>
  );
}
