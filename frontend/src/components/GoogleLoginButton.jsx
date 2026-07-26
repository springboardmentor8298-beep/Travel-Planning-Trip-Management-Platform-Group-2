import React, { useEffect, useState } from "react";
import { authApi } from "../api/authApi";

export default function GoogleLoginButton() {
  const [enabled, setEnabled] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    authApi
      .oauthEnabled()
      .then((res) => {
        const isEnabled = res.data?.enabled === true;
        setEnabled(isEnabled);
        if (!isEnabled) {
          setError("Google sign-in is not currently configured.");
        }
      })
      .catch((err) => {
        setEnabled(false);
        setError(
          err.response?.data?.message ||
            "Unable to check Google login status. Please refresh or try again.",
        );
      })
      .finally(() => setInitialized(true));
  }, []);

  const handleGoogleLogin = () => {
    if (!enabled) return;
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const buttonLabel = initialized
    ? enabled
      ? "Continue with Google"
      : "Google sign-in unavailable"
    : "Checking Google login...";

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={!enabled}
        className="w-full bg-white border border-slate-300 text-slate-800 font-medium py-2.5 rounded-md text-sm shadow-sm hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {buttonLabel}
      </button>
      {initialized && error && (
        <p className="mt-2 text-xs text-slate-500">{error}</p>
      )}
    </div>
  );
}
