import { Check, Plane } from "lucide-react";
import { Link } from "react-router-dom";

function AuthLayout({ children, mode }) {
  const isLogin = mode === "login";

  return (
    <main className="auth-shell">
      <section className="auth-visual" aria-label="Travel inspiration">
        <div className="auth-visual__overlay" />
        <Link className="auth-brand auth-brand--light" to="/login">
          <span className="brand-mark"><Plane size={20} /></span>
          <span>TripNest</span>
        </Link>
        <div className="auth-visual__copy">
          <span className="auth-tag">Your journey, beautifully organized</span>
          <h1>Plan less.<br />Experience more.</h1>
          <p>Bring every trip, itinerary, expense and travel companion together in one thoughtful workspace.</p>
          <div className="auth-benefits">
            <span><Check size={15} /> Day-wise itinerary planning</span>
            <span><Check size={15} /> Shared budgets and group trips</span>
            <span><Check size={15} /> Documents and reminders in one place</span>
          </div>
        </div>
        <div className="auth-location"><span /> Santorini, Greece</div>
      </section>

      <section className="auth-form-side">
        <div className="auth-mobile-header">
          <Link className="auth-brand" to="/login"><span className="brand-mark"><Plane size={19} /></span><span>TripNest</span></Link>
        </div>
        <div className="auth-form-wrap">
          {children}
          <p className="auth-switch">
            {isLogin ? "New to TripNest?" : "Already have an account?"}
            <Link to={isLogin ? "/register" : "/login"}>{isLogin ? "Create an account" : "Sign in"}</Link>
          </p>
        </div>
        <p className="auth-legal">By continuing, you agree to the Terms of Service and Privacy Policy.</p>
      </section>
    </main>
  );
}

export default AuthLayout;
