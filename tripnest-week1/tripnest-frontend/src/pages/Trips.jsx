import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");

    fetch("http://localhost:8080/api/trips", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load trips.");
        return res.json();
      })
      .then((data) => {
        setTrips(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto" }}>
      <button onClick={() => navigate("/dashboard")} style={{ marginBottom: "20px", cursor: "pointer" }}>
        ← Back to Dashboard
      </button>

      <h2>✈️ My Trips</h2>

      {loading && <p>Loading trips...</p>}
      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      {!loading && !error && trips.length === 0 && (
        <p>No trips found. Create one in Thunder Client to see it here!</p>
      )}

      {!loading &&
        trips.map((trip) => (
          <div
            key={trip.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "12px",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", color: "#007bff" }}>{trip.title}</h3>
            <p style={{ margin: "4px 0" }}>📅 {trip.startDate} to {trip.endDate}</p>
          </div>
        ))}
    </div>
  );
}