import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../../services/api";

function GoogleLoginButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hasAttemptedGoogleLogin, setHasAttemptedGoogleLogin] = useState(false);

  const clientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID || "", []);
  const isClientConfigured = Boolean(
    clientId && clientId !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
  );

  const handleSuccess = async (credentialResponse) => {
    setHasAttemptedGoogleLogin(true);

    if (!credentialResponse?.credential) {
      setError("Google authentication did not return a credential.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      const { token, email, role, message: responseMessage } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("email", email || "");
        localStorage.setItem("role", role || "USER");
        localStorage.setItem("user", JSON.stringify({ email: email || "" }));

        setMessage(responseMessage || "Google login successful");
        navigate("/dashboard", { replace: true });
      } else {
        setError("Google login failed. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")
            ? "Cannot connect to backend server at http://localhost:8080. Please verify Spring Boot is running."
            : "Google login failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    setHasAttemptedGoogleLogin(true);
    setError("Google authentication was cancelled or failed.");
  };

  return (
    <div className="w-100 d-flex flex-column align-items-center justify-content-center">
      {!isClientConfigured ? (
        <div className="alert alert-warning mb-3 w-100" role="alert">
          Google OAuth is not configured yet. Set VITE_GOOGLE_CLIENT_ID in the frontend .env file.
        </div>
      ) : (
        <div className="google-login-btn-wrapper w-100 d-flex justify-content-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
            text="continue_with"
            theme="outline"
            size="large"
            shape="rectangular"
          />
        </div>
      )}

      {loading && (
        <div className="d-flex justify-content-center align-items-center mt-3 text-muted">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          <span>Signing you in...</span>
        </div>
      )}

      {message && (
        <div className="alert alert-success mt-3 mb-0 w-100" role="alert">
          {message}
        </div>
      )}

      {hasAttemptedGoogleLogin && error && (
        <div className="alert alert-danger mt-3 mb-0 w-100" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

export default GoogleLoginButton;
