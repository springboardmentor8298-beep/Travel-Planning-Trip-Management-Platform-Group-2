import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAllTrips } from "../services/tripService";

import Navbar from "../components/Navbar";
import TripCard from "../components/TripCard";

import "../styles/Home.css";

import { toast } from "react-toastify";

function MyTrips() {

    const navigate = useNavigate();

    const [trips, setTrips] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

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

    const filteredTrips = trips.filter((trip) => {

        const matchesSearch =
            trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.title.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "ALL" ||
            trip.status === statusFilter;

        return matchesSearch && matchesStatus;

    });

    const sortedTrips = [...filteredTrips];

    return (

        <div>

            <Navbar onLogout={handleLogout} />

            <div className="home-container">

                <div className="hero">

                    <p className="hero-tag">
                        🧳 My Trips
                    </p>

                    <h1>
                        Manage Your Trips
                    </h1>

                    <p className="hero-description">
                        Search, organize and manage all your travel plans.
                    </p>

                    <button
                        className="create-trip-btn"
                        onClick={() => navigate("/create-trip")}
                    >
                        + Create New Trip
                    </button>

                    <div className="search-container">

                        <input
                            type="text"
                            placeholder="Search trips..."
                            className="search-box"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />

                        {searchTerm && (

                            <button
                                className="clear-btn"
                                onClick={() => setSearchTerm("")}
                            >
                                ✕
                            </button>

                        )}

                    </div>

                    <div className="filter-container">

                        <label>Status</label>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="status-filter"
                        >

                            <option value="ALL">All Trips</option>
                            <option value="PLANNED">🟢 Planned</option>
                            <option value="ONGOING">✈ Ongoing</option>
                            <option value="COMPLETED">✅ Completed</option>
                            <option value="CANCELLED">❌ Cancelled</option>

                        </select>

                    </div>

                </div>

                <div className="hotel-container">

                    {sortedTrips.length > 0 ? (

                        sortedTrips.map((trip) => (

                            <TripCard
                                key={trip.id}
                                trip={trip}
                            />

                        ))

                    ) : (

                        <h2>No trips found ✈️</h2>

                    )}

                </div>

            </div>

        </div>

    );

}

export default MyTrips;