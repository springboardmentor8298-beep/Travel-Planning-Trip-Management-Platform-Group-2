import { useState } from "react";
import API from "../services/api";
import "../styles/TripPlan.css";

function TripPlan() {

    const [trip, setTrip] = useState({
        from: "",
        destination: "",
        startDate: "",
        endDate: "",
        travellers: "",
        budget: "",
    });

    const handleChange = (e) => {
        setTrip({
            ...trip,
            [e.target.name]: e.target.value,
        });
    };

    const planTrip = async () => {

        const tripData = {
            fromLocation: trip.from,
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            travellers: Number(trip.travellers),
            budget: Number(trip.budget),
        };

        try {

            const response = await API.post("/trips/add", tripData);

            console.log(response.data);

            alert("🎉 Trip Planned Successfully!");

            setTrip({
                from: "",
                destination: "",
                startDate: "",
                endDate: "",
                travellers: "",
                budget: "",
            });

        } catch (error) {

            console.error(error);

            if (error.response) {

                alert("Failed to Save Trip!\nStatus: " + error.response.status);

            } else {

                alert("Cannot connect to Spring Boot Backend!");

            }

        }
    };

    return (
        <div className="trip-container">

            <div className="trip-card">

                <h2>✈️ Plan Your Dream Trip</h2>

                <input
                    type="text"
                    name="from"
                    placeholder="From"
                    value={trip.from}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="destination"
                    placeholder="Destination"
                    value={trip.destination}
                    onChange={handleChange}
                />

                <input
                    type="date"
                    name="startDate"
                    value={trip.startDate}
                    onChange={handleChange}
                />

                <input
                    type="date"
                    name="endDate"
                    value={trip.endDate}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="travellers"
                    placeholder="Number of Travellers"
                    value={trip.travellers}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="budget"
                    placeholder="Budget (₹)"
                    value={trip.budget}
                    onChange={handleChange}
                />

                <button onClick={planTrip}>
                    Plan Trip
                </button>

            </div>

        </div>
    );
}

export default TripPlan;