import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { createTrip } from "../services/tripService";

import "../styles/CreateTrip.css";

import {
    MdFlight,
    MdLocationOn,
    MdCalendarToday,
    MdAttachMoney,
    MdDescription
} from "react-icons/md";

import { toast } from "react-toastify";

function CreateTrip() {

    const [formData, setFormData] = useState({
        title: "",
        destination: "",
        startDate: "",
        endDate: "",
        budget: "",
        status: "PLANNED",
        description: ""
    });

    const navigate = useNavigate();

    const handleChange = (event) => {

        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });

    };

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (
            !formData.title ||
            !formData.destination ||
            !formData.startDate ||
            !formData.endDate ||
            !formData.budget
        ) {

            toast.warning("Please fill all required fields.");

            setLoading(false);

            return;

        }

        if (formData.endDate < formData.startDate) {

            toast.warning("End date cannot be before Start date.");

            setLoading(false);

            return;

        }

        if (Number(formData.budget) <= 0) {

            toast.warning("Budget must be greater than 0.");

            setLoading(false);

            return;

        }

        setLoading(true);

        try {

            const tripData = {

                ...formData,

                budget: Number(formData.budget)

            };

            await createTrip(tripData);

           toast.success("Trip created successfully!");

            navigate("/home");

        } catch (error) {

            console.error(error);

            toast.error("Failed to create trip.");

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="create-page">

        <div className="create-card">

            <div className="page-badge">
    🧳 Trip Planning
</div>

        <h2>Plan your next adventure ✈️</h2>

        <p>
            Every great journey begins with a well-planned itinerary.
        </p>

        <form onSubmit={handleSubmit} className="trip-form">

                <div className="form-group">

                    <label>Trip Title</label>

                    <div className="input-group">

                        <MdFlight className="input-icon"/>

                        <input
                            type="text"
                            name="title"
                            placeholder="Enter trip title"
                            value={formData.title}
                            onChange={handleChange}
                        />

                    </div>

                </div>

                <div className="form-group">

                    <label>Destination</label>

                    <div className="input-group">

                        <MdLocationOn className="input-icon"/>

                        <input
                            type="text"
                            name="destination"
                            placeholder="Enter destination"
                            value={formData.destination}
                            onChange={handleChange}
                        />

                    </div>

                </div>

                <div className="form-group">

                    <label>Start Date</label>

                    <div className="input-group">

                        <MdCalendarToday className="input-icon"/>

                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                        />

                    </div>

                </div>

                <div className="form-group">

                    <label>End Date</label>

                    <div className="input-group">

                        <MdCalendarToday className="input-icon"/>

                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                        />

                    </div>

                </div>

                <div className="form-group">

                    <label>Budget</label>

                    <div className="input-group">

                        <MdAttachMoney className="input-icon"/>

                        <input
                            type="number"
                            name="budget"
                            placeholder="Enter budget"
                            value={formData.budget}
                            onChange={handleChange}
                        />

                    </div>

                </div>

                <div className="form-group">

                    <label>Status</label>

                    <div className="input-group">

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="PLANNED">🟢 Planned</option>
                            <option value="ONGOING">🔵 Ongoing</option>
                            <option value="COMPLETED">✅ Completed</option>
                            <option value="CANCELLED">🔴 Cancelled</option>
                        </select>

                    </div>

                </div>

                    <div className="form-group full-width">

                        <label>Description</label>

                        <div className="input-group textarea-group">

                            <MdDescription className="input-icon"/>

                            <textarea
                                name="description"
                                placeholder="Tell us something about your trip..."
                                value={formData.description}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                <button
                    className="create-btn"
                    disabled={loading}
                >
                    {loading ? "Creating..." : "✈ Create My Trip"}
                </button>

            </form>

        </div>

        </div>

    );

}

export default CreateTrip;