import LeftPanel from "../components/auth/LeftPanel";
import RegisterForm from "../components/auth/RegisterForm";
import "../styles/Register.css";

function Register() {
  return (
    <div className="auth-page register-page">
      {/* Left Visual Panel: 45% width, 100vh height */}
      <LeftPanel />

      {/* Right Form Panel: 55% width, 100vh height */}
      <main
        className="auth-right-panel register-right-panel"
        aria-label="Create your TripNest account"
      >
        {/* Background Glowing Blobs */}
        <div className="auth-right-panel-bg" aria-hidden="true">
          <span className="auth-right-blob auth-right-blob--one" />
          <span className="auth-right-blob auth-right-blob--two" />
        </div>

        {/* Inner Centered Form Card */}
        <div className="auth-right-panel-inner auth-animate auth-animate--slide-up">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}

export default Register;
