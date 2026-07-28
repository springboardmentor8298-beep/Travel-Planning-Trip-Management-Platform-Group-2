import { Link } from "react-router-dom";

function Dashboard() {
  const email = localStorage.getItem("userEmail") || "Traveler";

  return (
    <div className="app-page">
      <header>
        <h1>TripNest Dashboard</h1>
        <p>Welcome, {email}</p>
      </header>

      <div className="grid">
        <Link className="feature-card" to="/trips">
          <h2>✈️ Trips</h2>
          <p>Create and manage your trips.</p>
        </Link>

        <Link className="feature-card" to="/itinerary">
          <h2>🗓️ Itinerary</h2>
          <p>Build your day-by-day travel plan.</p>
        </Link>

        <Link className="feature-card" to="/destinations">
          <h2>📍 Destinations</h2>
          <p>Explore and manage destinations.</p>
        </Link>

        <Link className="feature-card" to="/activities">
          <h2>🎯 Activities</h2>
          <p>Schedule activities for your trip.</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
