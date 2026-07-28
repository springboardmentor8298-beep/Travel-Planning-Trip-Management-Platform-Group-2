import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getHotelById } from "../services/hotelService";

import "../styles/HotelDetails.css";

function HotelDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [hotel, setHotel] = useState(null);

useEffect(() => {

    const fetchHotel = async () => {

        try {

            const data = await getHotelById(id);

            setHotel(data);

        } catch (error) {

            console.log(error);

        }

    };

    fetchHotel();

}, [id]);

    if (!hotel) {

        return <h2>Loading...</h2>;

    }

return (

    <div className="hotel-details">

        <img
            src={hotel.image}
            alt={hotel.name}
        />

        <div className="details-content">

            <h1>{hotel.name}</h1>

            <p>📍 {hotel.city}</p>

            <p>⭐ {hotel.rating}</p>

            <h2>₹{hotel.price} / night</h2>

            <h3>About this Hotel</h3>

            <p>
                Experience a comfortable stay with premium
                amenities and excellent hospitality.
            </p>

            <h3>Amenities</h3>

            <ul>

                <li>Free WiFi</li>

                <li>Swimming Pool</li>

                <li>Restaurant</li>

                <li>Parking</li>

                <li>Gym</li>

            </ul>

            <button
                className="book-btn"
                onClick={() => navigate(`/booking/${hotel.id}`)}
            >   

            Book Now

            </button>

        </div>

    </div>

);

}

export default HotelDetails;