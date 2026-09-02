import "../styles/LeftPanel.css";
import travelBg from "../assets/travel-bg.jpg";
import logo from "../assets/tripnest-logo.jpg";

import {
  FaShieldAlt,
  FaGlobe,
  FaHeadset
} from "react-icons/fa";

function LeftPanel() {
  return (
    <div
      className="left-panel"
      style={{ backgroundImage: `url(${travelBg})` }}
    >
      <div className="left-overlay">

        <img
          src={logo}
          alt="TripNest"
          className="left-logo"
        />

        <h1>
          Start Your
          <br />
          Journey With
          <br />
          <span>TripNest</span>
        </h1>

        <p className="left-description">
          Create an account and explore amazing places
          with the best travel experience.
        </p>

        <div className="left-feature">

          <FaShieldAlt className="feature-icon" />

          <div>

            <h4>Secure & Safe</h4>

            <p>Your data is protected with top security.</p>

          </div>

        </div>

        <div className="left-feature">

          <FaGlobe className="feature-icon" />

          <div>

            <h4>Best Destinations</h4>

            <p>Discover the world's most beautiful places.</p>

          </div>

        </div>

        <div className="left-feature">

          <FaHeadset className="feature-icon" />

          <div>

            <h4>24/7 Support</h4>

            <p>We are here to help anytime, anywhere.</p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default LeftPanel;