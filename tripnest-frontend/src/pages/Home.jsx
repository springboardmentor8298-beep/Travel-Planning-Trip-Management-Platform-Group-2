import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTrips } from "../services/tripService";

import { FaSuitcaseRolling } from "react-icons/fa";
import { MdAccountBalanceWallet } from "react-icons/md";
import { BsCalendarCheckFill } from "react-icons/bs";

import Navbar from "../components/Navbar";

import "../styles/Home.css";

import { toast } from "react-toastify";

function Home() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await getAllTrips();

        setTrips(data);
      } catch (error) {
        console.log(error);

        toast.error("Failed to load trips.");
      }
    };

    fetchTrips();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };


  const totalTrips = trips.length;

    const totalBudget = trips.reduce(
        (sum, trip) => sum + (trip.budget || 0),
        0
    );

    // const plannedTrips = trips.filter(
    //     (trip) => trip.status === "PLANNED"
    // ).length;

  const completedTrips = trips.filter(
      (trip) => trip.status === "COMPLETED"
  ).length;


  const ongoingTrips = trips.filter(
      (trip) => trip.status === "ONGOING"
  ).length;


  return (
    <div>
      <Navbar onLogout={handleLogout} />

      <div className="home-container">
        <div className="hero">
          <p className="hero-tag">✈️ TripNest Dashboard</p>

          <h1>Welcome Back, {user?.name}! 👋</h1>

          <h3>Ready for your next adventure?</h3>

          <p className="hero-description">
            Plan smarter. Organize better. Travel farther.
          </p>

          <button
            className="create-trip-btn"
            onClick={() => navigate("/create-trip")}
          >
            + Create New Trip
          </button>

        </div>

        <div className="stats-container">
          <div className="stat-card">
            <FaSuitcaseRolling className="stat-icon" />

            <h3>{totalTrips}</h3>

            <p>Total Trips</p>
          </div>

          <div className="stat-card">
            <MdAccountBalanceWallet className="stat-icon" />

            <h3>₹{totalBudget.toLocaleString()}</h3>

            <p>Total Budget</p>
          </div>

          <div className="stat-card">
            <BsCalendarCheckFill className="stat-icon" />

            <h3>{ongoingTrips}</h3>

            <p>Ongoing Trips</p>
          </div>

          <div className="stat-card">
            <BsCalendarCheckFill className="stat-icon" />

            <h3>{completedTrips}</h3>

            <p>Completed Trips</p>
          </div>
        </div>

        {/* Hotel cards remain below */}
      </div>
    </div>
  );
}

export default Home;
