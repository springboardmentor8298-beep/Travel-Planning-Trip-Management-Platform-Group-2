import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthRedirect() {
  const navigate = useNavigate();
  const { persistToken } = useAuth();

  useEffect(() => {
    const completeGoogleSignIn = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      await persistToken(token);
      navigate("/", { replace: true });
    };

    completeGoogleSignIn();
  }, [navigate, persistToken]);

  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center">
      Signing in with Google...
    </div>
  );
}
