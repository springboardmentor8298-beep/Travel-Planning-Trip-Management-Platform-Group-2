import { useParams, Link } from "react-router-dom";
import "../styles/DestinationDetails.css";

function DestinationDetails() {
    const { name } = useParams();

    return (
        <div className="details-container">
            <div className="details-card">

                <h1>{name}</h1>

                <p>
                    Welcome to {name}! This destination offers beautiful scenery,
                    comfortable hotels, delicious food, and exciting tourist attractions.
                </p>

                <h3>Best Time to Visit</h3>
                <p>October – March</p>

                <h3>Estimated Budget</h3>
                <p>₹15,000 – ₹30,000</p>

                <h3>Popular Attractions</h3>

                <ul>
                    <li>Tourist Spot 1</li>
                    <li>Tourist Spot 2</li>
                    <li>Tourist Spot 3</li>
                </ul>

                <Link to="/dashboard">
                    <button>Back to Dashboard</button>
                </Link>

            </div>
        </div>
    );
}

export default DestinationDetails;