import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import destinations from "../data/destinations";
import destinationDetails from "../data/destinationDetails";
import api from "../services/api";
import "./DestinationDetails.css";

function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const destinationName = searchParams.get("name");

  // ==========================================
  // FIND DESTINATION
  // ==========================================

  const destination = destinationName
    ? destinations.find(
        (d) =>
          d.name.toLowerCase().trim() ===
          destinationName.toLowerCase().trim()
      )
    : destinations.find(
        (d) => d.id === Number(id)
      );

  // ==========================================
  // FIND DETAILS BY DESTINATION NAME
  // ==========================================

  const details = destination
    ? destinationDetails.find(
        (d) =>
          d.name?.toLowerCase().trim() ===
          destination.name.toLowerCase().trim()
      ) ||
      destinationDetails.find(
        (d) => d.id === destination.id
      )
    : null;

  console.log("Destination:", destination);
  console.log("Destination ID:", destination?.id);
  console.log("Destination Name:", destination?.name);
  console.log("Details:", details);

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!destination) {
    return (
      <div className="details-page">
        <h2>Destination Not Found</h2>

        <button
          className="back-btn"
          onClick={() => navigate("/destinations")}
        >
          ← Back to Destinations
        </button>
      </div>
    );
  }

  // ==========================================
  // ADD TO TRIP
  // ==========================================

  const handleAddToTrip = async () => {
    try {
      let budget = 5000;

      if (details?.budget) {
        const budgetMatch = String(details.budget)
          .replace(/,/g, "")
          .match(/\d+/);

        if (budgetMatch) {
          budget = Number(budgetMatch[0]);
        }
      }

      const tripData = {
        title: `${destination.name} Trip`,

        description:
          details?.about ||
          `Trip to ${destination.name}, ${destination.state}.`,

        destination:
          `${destination.name}, ${destination.state}`,

        startDate: null,
        endDate: null,
        numberOfTravelers: 1,
        budget: budget,
        status: "PLANNING"
      };

      const response = await api.post(
        "/trips",
        tripData
      );

      console.log("Trip created:", response.data);

      alert(
        `${destination.name} added to My Trip!`
      );

      navigate("/trips");

    } catch (error) {
      console.error(
        "Error adding trip:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to add destination to My Trip."
      );
    }
  };

  // ==========================================
  // IMAGE FALLBACK
  // ==========================================

  const handleImageError = (e) => {
    e.currentTarget.style.display = "none";
  };

  return (
    <div className="details-page">

      {/* BACK */}

      <button
        className="back-btn"
        onClick={() => navigate("/destinations")}
      >
        ← Back to Destinations
      </button>

      {/* HERO */}

      <img
        src={destination.image}
        alt={destination.name}
        className="hero-image"
        onError={handleImageError}
      />

      {/* CARD */}

      <div className="details-card">

        <h1>{destination.name}</h1>

        <h3>
          📍 {destination.state}
        </h3>

        {/* INFO */}

        <div className="info-grid">

          <div className="info-box">
            <div>⭐</div>
            <h4>Rating</h4>
            <p>
              {details?.rating || "4.5 / 5"}
            </p>
          </div>

          <div className="info-box">
            <div>🌡️</div>
            <h4>Weather</h4>
            <p>
              {details?.weather || "Pleasant"}
            </p>
          </div>

          <div className="info-box">
            <div>💰</div>
            <h4>Budget</h4>
            <p>
              {details?.budget ||
                "₹5,000 - ₹10,000"}
            </p>
          </div>

          <div className="info-box">
            <div>📅</div>
            <h4>Best Time</h4>
            <p>
              {details?.bestTime ||
                "October - March"}
            </p>
          </div>

        </div>

        {/* ABOUT */}

        <div className="section">

          <h2>
            About {destination.name}
          </h2>

          <p>
            {details?.about ||
              `${destination.name} is a beautiful travel destination in ${destination.state}. Explore its famous attractions, local culture, food and unforgettable experiences.`}
          </p>

        </div>

        {/* PLACES */}

        <div className="section">

          <h2>
            📍 Famous Places to Visit
          </h2>

          {details?.places &&
          details.places.length > 0 ? (

            <div className="places-grid">

              {details.places.map(
                (place, index) => (

                  <div
                    className="place-card"
                    key={index}
                  >

                    {place.image && (
                      <img
                        src={place.image}
                        alt={place.name}
                        onError={handleImageError}
                      />
                    )}

                    <div className="place-content">

                      <h3>
                        {place.name}
                      </h3>

                      <p>
                        🕒 Best Time:{" "}
                        {place.bestTime}
                      </p>

                      <p>
                        💰 Budget:{" "}
                        {place.budget}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <p>
              Famous places information
              coming soon.
            </p>

          )}

        </div>

        {/* ADD TO TRIP */}

        <button
          className="trip-button"
          onClick={handleAddToTrip}
        >
          ✈️ Add To My Trip
        </button>

      </div>

    </div>
  );
}

export default DestinationDetails;