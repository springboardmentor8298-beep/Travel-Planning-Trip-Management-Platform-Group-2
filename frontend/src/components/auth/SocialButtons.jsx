import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import GoogleLoginButton from "./GoogleLoginButton";
import "../../styles/SocialButtons.css";

function SocialButtons() {
  return (
    <div className="social-buttons-wrapper">
      {/* Full width Google authentication button wrapper */}
      <div className="google-btn-container">
        <GoogleLoginButton />
      </div>
      
      {/* Side-by-side Facebook and LinkedIn authentication buttons */}
      <div className="social-grid-row">
        <button type="button" className="social-btn facebook" disabled aria-disabled="true">
          <FaFacebookF className="social-icon" /> Facebook (Coming Soon)
        </button>
        <button type="button" className="social-btn linkedin" disabled aria-disabled="true">
          <FaLinkedinIn className="social-icon" /> LinkedIn (Coming Soon)
        </button>
      </div>
      
      <p className="social-helper-text">
        Use your Google account or continue with email and password.
      </p>
    </div>
  );
}

export default SocialButtons;
