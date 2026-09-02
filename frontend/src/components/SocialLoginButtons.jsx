import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import GoogleLoginButton from "./auth/GoogleLoginButton";

function SocialLoginButtons() {
  return (
    <>
      <div className="mb-3 w-100">
        <GoogleLoginButton />
      </div>

      <button className="btn btn-outline-primary w-100 mb-2" disabled>
        <FaFacebookF className="me-2" />
        Continue with Facebook
      </button>

      <button className="btn btn-outline-info w-100" disabled>
        <FaLinkedinIn className="me-2" />
        Continue with LinkedIn
      </button>
    </>
  );
}

export default SocialLoginButtons;