import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

/*
  This page handles two scenarios:
  1. Redirected from backend GET /api/auth/verify-email?token=...
     → URL becomes /verify-email?status=verified|already_verified|invalid
  2. Shown after register to prompt the user to check their inbox.
     → URL is just /verify-email (no status param)
*/

const STATUS_CONFIG = {
  verified: {
    icon: "🎉",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    title: "Email verified!",
    body: "Your email address has been confirmed. You're all set to explore TripNest.",
    cta: { to: "/", label: "Go to Dashboard →" },
  },
  already_verified: {
    icon: "✅",
    color: "text-brand-700",
    bg: "bg-brand-50 border-brand-200",
    title: "Already verified",
    body: "This email address is already verified. You can log in normally.",
    cta: { to: "/login", label: "Sign In →" },
  },
  invalid: {
    icon: "⚠️",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    title: "Invalid or expired link",
    body: "This verification link is invalid or has already been used. Request a new one below.",
    cta: null,
  },
};

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");   // verified | already_verified | invalid | null
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("idle"); // idle | loading | sent | error
  const [resendMsg, setResendMsg] = useState("");

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendStatus("loading");
    setResendMsg("");
    try {
      const res = await axiosClient.post("/auth/resend-verification",
        { email: resendEmail.trim().toLowerCase() });
      setResendMsg(res.data?.message || "Verification email sent!");
      setResendStatus("sent");
    } catch (err) {
      setResendMsg(err?.response?.data?.message || "Could not resend. Try again.");
      setResendStatus("error");
    }
  };

  /* ── No status param: post-register "check your inbox" screen ── */
  if (!status) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-slate-50 animate-fadeIn">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="text-6xl mb-4 animate-float">📧</div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
              Check your inbox
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              We've sent a verification link to your email address.
              Click it to activate your account.
            </p>

            <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 text-left">
              <strong>Didn't receive it?</strong> Check your spam/junk folder.
              Gmail sometimes filters automated emails. Wait 1–2 minutes, then try resending below.
            </div>

            {/* Resend form */}
            <div className="mt-6">
              <p className="text-sm text-slate-500 mb-3">Resend verification email</p>

              {resendStatus === "sent" ? (
                <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  ✅ {resendMsg}
                </div>
              ) : (
                <form onSubmit={handleResend} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">📧</span>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resendStatus === "loading"}
                    className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95"
                  >
                    {resendStatus === "loading" ? "…" : "Resend"}
                  </button>
                </form>
              )}

              {resendStatus === "error" && (
                <p className="text-xs text-red-600 mt-2">{resendMsg}</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center gap-4">
              <Link to="/" className="text-sm text-brand-600 hover:underline font-medium">Skip for now →</Link>
              <Link to="/login" className="text-sm text-slate-500 hover:underline">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Status param present: result of verification click ── */
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.invalid;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-slate-50 animate-fadeIn">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="text-5xl mb-4">{cfg.icon}</div>
          <h1 className={`text-2xl font-extrabold mb-3 ${cfg.color}`}>{cfg.title}</h1>

          <div className={`rounded-xl border px-4 py-3 text-sm text-left mb-6 ${cfg.bg} ${cfg.color}`}>
            {cfg.body}
          </div>

          {cfg.cta && (
            <Link
              to={cfg.cta.to}
              className="block w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all active:scale-[0.98] mb-3"
            >
              {cfg.cta.label}
            </Link>
          )}

          {/* For invalid: show resend form */}
          {status === "invalid" && (
            <div className="mt-2">
              {resendStatus === "sent" ? (
                <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  ✅ {resendMsg}
                </div>
              ) : (
                <form onSubmit={handleResend} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📧</span>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resendStatus === "loading"}
                    className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95"
                  >
                    {resendStatus === "loading" ? "…" : "Resend"}
                  </button>
                </form>
              )}
              {resendStatus === "error" && (
                <p className="text-xs text-red-600 mt-2">{resendMsg}</p>
              )}
            </div>
          )}

          <Link to="/login" className="block mt-4 text-sm text-slate-400 hover:text-brand-600">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
