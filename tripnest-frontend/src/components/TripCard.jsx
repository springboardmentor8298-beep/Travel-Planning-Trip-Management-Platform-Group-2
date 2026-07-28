import { Link, useNavigate } from "react-router-dom";
import { deleteTrip } from "../services/tripService";
import "../styles/TripCard.css";

function TripCard({ trip }) {

    const navigate = useNavigate();

    const handleDelete = async () => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this trip?"
        );

        if (!confirmDelete) return;

        try {

            await deleteTrip(trip.id);

            alert("Trip deleted successfully!");

            window.location.reload();

        } catch (error) {

            console.error(error);

            alert("Failed to delete trip.");

        }

    };

    return (
  <div className="hotel-card">

    <div className="trip-status">
      {trip.status}
    </div>

    <div className="hotel-content">

      <h3 className="trip-title">
  {trip.title}
</h3>

      <div className="trip-info">

        <p>
          📍 {trip.destination}
        </p>

        <p>
          📅 {trip.startDate} - {trip.endDate}
        </p>

        <h4>
          💰 ₹{trip.budget}
        </h4>

      </div>

      <hr className="trip-divider" />

      <Link
        to={`/trip/${trip.id}`}
        className="view-btn"
      >
        View Details
      </Link>

      <div className="trip-actions">

        <button
          className="edit-btn"
          onClick={() => navigate(`/edit-trip/${trip.id}`)}
        >
          ✏ Edit
        </button>

        <button
          className="delete-btn"
          onClick={handleDelete}
        >
          🗑 Delete
        </button>

      </div>

    </div>

  </div>
);
}

export default TripCard;