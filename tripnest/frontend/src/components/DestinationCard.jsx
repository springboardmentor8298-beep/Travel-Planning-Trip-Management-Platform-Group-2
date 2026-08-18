import { useState } from "react";
import destinations from "../data/destinations";
import "./Destination.css";

function Destination() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    "Hill Station",
    "Beach",
    "Heritage",
    "Nature",
    "Snow",
    "Adventure",
    "City",
    "Desert",
    "Wildlife",
    "Backwaters",
    "Pilgrimage",
    "Mountain",
    "Lake"
  ];

  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch =
      destination.name.toLowerCase().includes(search.toLowerCase()) ||
      destination.state.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || destination.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="destination-page">

      {/* Hero Section */}
      <div className="hero">
        <h1>🌍 Discover Amazing Destinations</h1>
        <p>Explore • Save • Plan • Travel</p>

        <input
          type="text"
          placeholder="🔍 Search destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
        />
      </div>

      {/* Category Filter */}
      <div className="category-container">
        {categories.map((cat) => (
          <button
            key={cat}
            className={category === cat ? "category active" : "category"}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="card-container">
        {filteredDestinations.map((destination) => (
          <div className="destination-card" key={destination.id}>

            <img
              src={destination.image}
              alt={destination.name}
            />

            <div className="card-body">

              <h2>{destination.name}</h2>

              <p>📍 {destination.state}</p>

              <span className="badge">
                {destination.category}
              </span>

              <div className="card-buttons">
                <button className="explore-btn">
                  Explore
                </button>

                <button className="trip-btn">
                  Add To Trip
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default Destination;