import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LeftPanel from "../components/auth/LeftPanel";
import LoginForm from "../components/auth/LoginForm";
import travelBg from "../assets/travel-bg.jpg";
import logo from "../assets/tripnest-logo.jpg";
import {
  FaChevronRight,
  FaShieldAlt,
  FaBrain,
  FaWallet,
  FaMapMarkedAlt,
} from "react-icons/fa";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const shouldShowDirectly = location.state?.showLoginFormDirectly;
  const [showWelcome, setShowWelcome] = useState(!shouldShowDirectly);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStartTransition = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowWelcome(false);
      setIsTransitioning(false);
    }, 1000); // 1 Second loader duration
  };

  // Render polished 1-second loading screen
  if (isTransitioning) {
    return (
      <div
        className="welcome-page-wrapper"
        style={{ backgroundImage: `url(${travelBg})` }}
      >
        <div className="welcome-page-overlay" aria-hidden="true" />
        <div className="welcome-loading-container auth-animate auth-animate--fade-in">
          <div className="welcome-loading-spinner" />
          <h2 className="welcome-loading-text">Preparing your travel experience...</h2>
          <p className="welcome-loading-subtext">Loading...</p>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div
        className="welcome-page-wrapper"
        style={{ backgroundImage: `url(${travelBg})` }}
      >
        <div className="welcome-page-overlay" aria-hidden="true" />

        {/* Premium Navigation Bar */}
        <nav className="welcome-navbar">
          <div className="welcome-nav-brand">
            <img src={logo} alt="TripNest Logo" className="welcome-nav-logo" />
          </div>
          <ul className="welcome-nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#destinations">Destinations</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="welcome-nav-actions">
            <button
              type="button"
              onClick={handleStartTransition}
              className="welcome-nav-btn welcome-nav-btn--login"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="welcome-nav-btn welcome-nav-btn--register"
            >
              Register
            </button>
          </div>
        </nav>

        <div className="welcome-content-container auth-animate auth-animate--slide-up">
          {/* Welcome Core Description */}
          <main className="welcome-main-section">
            <h1 className="welcome-hero-title">
              Welcome to <span className="welcome-hero-gradient">TripNest</span>
            </h1>
            <p className="welcome-hero-subtitle">
              Plan smarter, travel better, and save more with the world's most advanced AI-powered travel planning and intelligent budget management system.
            </p>

            {/* Feature points grid */}
            <div className="welcome-points-grid">
              <div className="welcome-point-card">
                <div className="welcome-point-icon-box">
                  <FaBrain />
                </div>
                <div className="welcome-point-text-box">
                  <h3>AI Itinerary Planner</h3>
                  <p>Generate optimized travel plans customized to your dates, interests, budget, and travel style in seconds.</p>
                </div>
              </div>

              <div className="welcome-point-card">
                <div className="welcome-point-icon-box">
                  <FaWallet />
                </div>
                <div className="welcome-point-text-box">
                  <h3>Budget Tracking</h3>
                  <p>Monitor your travel expenses, set smart boundaries, and catalog live travel costs during your journey.</p>
                </div>
              </div>

              <div className="welcome-point-card">
                <div className="welcome-point-icon-box">
                  <FaShieldAlt />
                </div>
                <div className="welcome-point-text-box">
                  <h3>Secure & Encrypted</h3>
                  <p>Rest assured that all travel tickets, credential tokens, budgets, and files are encrypted and safe.</p>
                </div>
              </div>

              <div className="welcome-point-card">
                <div className="welcome-point-icon-box">
                  <FaMapMarkedAlt />
                </div>
                <div className="welcome-point-text-box">
                  <h3>Trending Destinations</h3>
                  <p>Discover global destinations, travel reviews, and local suggestions curated by community insights.</p>
                </div>
              </div>
            </div>

            {/* Redirection Welcome Button centered at the bottom middle */}
            <div className="welcome-action-container">
              <button
                type="button"
                className="welcome-action-btn"
                onClick={handleStartTransition}
                aria-label="Get started on your journey with TripNest"
              >
                GET STARTED ON YOUR JOURNEY <FaChevronRight className="ms-2 welcome-btn-arrow" aria-hidden="true" />
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Render the original split layout authentication screen
  return (
    <div className="auth-page login-page">
      {/* Left Visual Panel: 42% width, 100vh height */}
      <LeftPanel />

      {/* Right Form Panel: 58% width, 100vh height */}
      <main
        className="auth-right-panel login-right-panel"
        aria-label="Sign in to your TripNest account"
      >
        <div className="auth-right-panel-bg" aria-hidden="true">
          <span className="auth-right-blob auth-right-blob--one" />
          <span className="auth-right-blob auth-right-blob--two" />
        </div>

        <div className="auth-right-panel-inner auth-animate auth-animate--slide-up">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}

export default Login;
