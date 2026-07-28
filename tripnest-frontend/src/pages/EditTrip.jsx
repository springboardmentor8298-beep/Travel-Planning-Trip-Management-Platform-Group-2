import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getTripById,
    updateTrip
} from "../services/tripService";

import { toast } from "react-toastify";

import "../styles/CreateTrip.css";


import {
    MdFlight,
    MdLocationOn,
    MdCalendarToday,
    MdAttachMoney,
    MdDescription
} from "react-icons/md";

function EditTrip() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        destination: "",
        startDate: "",
        endDate: "",
        budget: "",
        status: "",
        description: ""
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const fetchTrip = async () => {

            try {

                const data = await getTripById(id);

                setFormData(data);

            } catch (error) {

                console.error(error);

                toast.error("Failed to load trip.");

            }

        };

        fetchTrip();

    }, [id]);

    const handleChange = (event) => {

        setFormData({

            ...formData,

            [event.target.name]: event.target.value

        });

    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setLoading(true);

        try {

            const tripData = {

                ...formData,

                budget: Number(formData.budget)

            };

            await updateTrip(id, tripData);

            toast.success("Trip updated successfully!");

            navigate("/home");

        } catch (error) {

            console.error(error);

            toast.error("Failed to update trip.");

        } finally {

            setLoading(false);

        }

    };

    return (
    <div className="create-page">
        <div className="create-card">

            <h2>✏ Edit Your Trip</h2>

            <p>
                Update your trip details and keep your travel plan up to date.
            </p>

        <form
            className="trip-form"
            onSubmit={handleSubmit}
        >
        <div className="form-group">

            <label>Trip Title</label>

            <div className="input-group">

                 <MdFlight className="input-icon"/>

                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter trip title"
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
                        value={formData.destination}
                        onChange={handleChange}
                        placeholder="Enter destination"
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

        <div className="form-buttons">

            <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/home")}
            >
                Cancel
            </button>

            <button
                type="submit"
                className="create-btn"
                disabled={loading}
            >
                {loading ? "Updating..." : "💾 Save Changes"}
            </button>

        </div>
        </form>
    </div>
    </div>
    );

}

export default EditTrip;