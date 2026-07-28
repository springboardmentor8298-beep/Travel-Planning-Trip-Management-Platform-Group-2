import "./../styles/Navbar.css";

import { Link, useLocation } from "react-router-dom";
import "./../styles/Navbar.css";

function Navbar({ onLogout }) {

    const location = useLocation();

    return (

        <nav className="navbar">

            <div className="logo">
                ✈ TripNest
            </div>

            <div className="nav-links">

                <Link
                    to="/home"
                    className={location.pathname === "/home" ? "active" : ""}
                >
                    🏠 Home
                </Link>

                <Link
                    to="/my-trips"
                    className={location.pathname === "/my-trips" ? "active" : ""}
                >
                    🧳 My Trips
                </Link>

                <Link
                    to="/create-trip"
                    className={location.pathname === "/create-trip" ? "active" : ""}
                >
                    ➕ Create Trip
                </Link>

                <button
                    className="logout-btn"
                    onClick={onLogout}
                >
                    Logout
                </button>

            </div>

        </nav>

    );

}

export default Navbar;