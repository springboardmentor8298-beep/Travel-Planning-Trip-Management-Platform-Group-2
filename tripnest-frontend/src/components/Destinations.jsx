import { Link } from "react-router-dom";
import "../styles/Destinations.css";

function Destinations() {

    const destinations = [
        {
            name: "Goa",
            image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600",
            description: "Beautiful beaches and nightlife."
        },
        {
            name: "Ooty",
            image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600",
            description: "Queen of Hill Stations."
        },
        {
            name: "Manali",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
            description: "Snow mountains and adventure."
        }
    ];

    return (
        <div className="destinations-container">

            <h2>Popular Destinations</h2>

            <div className="destination-grid">

                {destinations.map((place, index) => (

                    <div className="destination-card" key={index}>

                        <img
                            src={place.image}
                            alt={place.name}
                        />

                        <h3>{place.name}</h3>

                        <p>{place.description}</p>

                        <Link to={`/destination/${place.name}`}>
                            <button>View Details</button>
                        </Link>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Destinations;