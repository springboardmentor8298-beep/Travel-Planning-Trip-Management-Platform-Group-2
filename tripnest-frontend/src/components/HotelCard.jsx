import "../styles/HotelCard.css";

import { Link } from "react-router-dom";

function HotelCard({ hotel }) {

    return (

        <div className="hotel-card">

            <img
                src={hotel.image}
                alt={hotel.name}
                className="hotel-image"
            />

            <div className="hotel-content">

                <div className="hotel-header">

                    <h3>{hotel.name}</h3>

                    <span>⭐ {hotel.rating}</span>

                </div>

                <p>📍 {hotel.city}</p>

                <h4>₹{hotel.price} / night</h4>

                <Link
                    to={`/hotel/${hotel.id}`}
                    className="view-btn"
                >
                    View Details
                </Link>

            </div>

        </div>

    );

}

export default HotelCard;