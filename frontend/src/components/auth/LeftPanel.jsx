import travelBg from "../../assets/travel-bg.jpg";
import logo from "../../assets/tripnest-logo.jpg";
import {
  FaShieldAlt,
  FaBrain,
  FaWallet,
  FaHeadset,
} from "react-icons/fa";
import "../../styles/LeftPanel.css";

const FEATURES = [
  {
    id: "secure",
    icon: FaShieldAlt,
    title: "Secure & Safe",
    description: "Your data is protected with top security.",
  },
  {
    id: "ai-planner",
    icon: FaBrain,
    title: "AI Planner",
    description: "Smart itinerary generation using AI.",
  },
  {
    id: "budget",
    icon: FaWallet,
    title: "Budget Tracking",
    description: "Monitor travel costs and expenses.",
  },
  {
    id: "support",
    icon: FaHeadset,
    title: "24/7 Support",
    description: "We are here to help you anytime, anywhere.",
  },
];

function LeftPanel() {
  return (
    <aside className="auth-left-panel" style={{ backgroundImage: `url(${travelBg})` }}>
      <div className="auth-left-overlay">
        {/* Official Logo Banner */}
        <header className="auth-left-brand">
          <img src={logo} alt="TripNest Logo" className="auth-left-logo-img" />
        </header>

        {/* Hero title & Tagline */}
        <div className="auth-left-copy">
          <h1 className="auth-hero-title">
            Start Your Journey With <span className="auth-hero-gradient">TripNest</span>
          </h1>
          <p className="auth-hero-tagline">
            Plan smarter with AI-powered travel planning, smart itineraries, expense tracking, and personalized recommendations.
          </p>
        </div>

        {/* 2x2 Feature Grid */}
        <ul className="auth-feature-list" role="list">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <li key={feature.id} className="auth-feature-card">
                <div className="auth-feature-icon-wrap" aria-hidden="true">
                  <Icon className="auth-feature-icon" />
                </div>
                <div className="auth-feature-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <footer className="auth-left-footer">
          <span>© 2026 TripNest</span>
        </footer>
      </div>
      <div className="auth-left-glass-reflection" aria-hidden="true" />
    </aside>
  );
}

export default LeftPanel;
