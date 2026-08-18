import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const Destinations = () => {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPopular, setShowPopular] = useState(false);

  useEffect(() => {
    fetchDestinations();
  }, []);

  // Get all destinations
  const fetchDestinations = async () => {
    try {
      setLoading(true);

      const res = await api.get("/destinations");

      setDestinations(res.data);
      setShowPopular(false);
    } catch (err) {
      console.error("Error fetching destinations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search destinations
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchDestinations();
      return;
    }

    try {
      setLoading(true);

      const res = await api.get(
        `/destinations/search?name=${encodeURIComponent(searchQuery)}`
      );

      setDestinations(res.data);
      setShowPopular(false);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Popular destinations
  const handlePopular = async () => {
    try {
      setLoading(true);

      if (showPopular) {
        await fetchDestinations();
        return;
      }

      const res = await api.get("/destinations/popular");

      setDestinations(res.data);
      setShowPopular(true);
    } catch (err) {
      console.error("Popular destinations error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open destination details
  const handleExplore = (id) => {
    navigate(`/destinations/${id}`);
  };

  return (
    <div style={styles.container}>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Destinations 🌍
            </h1>

            <p style={styles.subtitle}>
              Discover your next adventure
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={styles.searchRow}>

          <input
            className="aurora-input"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            style={styles.searchInput}
          />

          <button
            className="btn-aurora"
            onClick={handleSearch}
          >
            Search
          </button>

          <button
            className={showPopular ? "btn-aurora" : "btn-ghost"}
            onClick={handlePopular}
          >
            🔥 Popular
          </button>

        </div>

        {/* Loading */}
        {loading ? (

          <p style={styles.loading}>
            Loading destinations...
          </p>

        ) : destinations.length === 0 ? (

          /* No destinations */
          <div
            style={styles.emptyState}
            className="glass-card"
          >
            <span style={{ fontSize: "48px" }}>
              🌍
            </span>

            <h3 style={{ color: "#f1f5f9" }}>
              No destinations found
            </h3>

            <p style={{ color: "#94a3b8" }}>
              Try a different search
            </p>
          </div>

        ) : (

          /* Destination Cards */
          <div style={styles.grid}>

            {destinations.map((dest) => (

              <div
                key={dest.id}
                style={styles.card}
                className="glass-card"
              >

                {/* Destination Image */}
                {dest.imageUrl ? (

                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    style={styles.cardImage}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />

                ) : (

                  <div style={styles.imagePlaceholder}>
                    🌍
                    <span>
                      No Image
                    </span>
                  </div>

                )}

                {/* Card Header */}
                <div style={styles.cardHeader}>

                  <span style={{ fontSize: "32px" }}>
                    📍
                  </span>

                  {dest.popular && (
                    <span className="badge badge-upcoming">
                      🔥 Popular
                    </span>
                  )}

                </div>

                {/* Name */}
                <h3 style={styles.destName}>
                  {dest.name}
                </h3>

                {/* Location */}
                <p style={styles.destLocation}>
                  📍 {dest.city || dest.name},{" "}
                  {dest.country || dest.state || "India"}
                </p>

                {/* Description */}
                {dest.description && (
                  <p style={styles.destDesc}>
                    {dest.description}
                  </p>
                )}

                {/* Category */}
                {dest.category && (
                  <span style={styles.categoryBadge}>
                    {dest.category}
                  </span>
                )}

                {/* Meta Information */}
                <div style={styles.destMeta}>

                  {dest.climate && (
                    <span style={styles.metaItem}>
                      🌤️ {dest.climate}
                    </span>
                  )}

                  {dest.bestTimeToVisit && (
                    <span style={styles.metaItem}>
                      📅 {dest.bestTimeToVisit}
                    </span>
                  )}

                  {dest.averageCost && (
                    <span style={styles.metaItem}>
                      💰 ₹
                      {Number(
                        dest.averageCost
                      ).toLocaleString()}
                    </span>
                  )}

                </div>

                {/* Explore Button */}
               <button
  className="btn-aurora"
  onClick={() =>
    navigate(`/destinations/${dest.id}?name=${encodeURIComponent(dest.name)}`)
  }
>
  🌍 Explore →
</button>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
};


/* ========================= */
/* STYLES */
/* ========================= */

const styles = {

  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#0a0f1e"
  },

  main: {
    marginLeft: "260px",
    flex: 1,
    padding: "32px"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px"
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#f1f5f9",
    fontFamily: "'Space Grotesk', sans-serif"
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    marginTop: "4px"
  },

  searchRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap"
  },

  searchInput: {
    maxWidth: "400px",
    flex: 1
  },

  loading: {
    color: "#94a3b8",
    fontSize: "15px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(280px, 1fr))",
    gap: "22px"
  },

  /* Card */
  card: {
    padding: "0 0 20px 0",
    overflow: "hidden",
    transition: "0.3s"
  },

  /* Image */
  cardImage: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    display: "block",
    borderRadius: "12px 12px 0 0"
  },

  /* If image doesn't exist */
  imagePlaceholder: {
    width: "100%",
    height: "180px",
    background:
      "linear-gradient(135deg, #1e293b, #312e81)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "8px",
    color: "#94a3b8",
    fontSize: "40px"
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "15px",
    padding: "0 20px",
    marginBottom: "10px"
  },

  destName: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#f1f5f9",
    fontFamily: "'Space Grotesk', sans-serif",
    margin: "0 20px 6px"
  },

  destLocation: {
    color: "#94a3b8",
    fontSize: "13px",
    margin: "0 20px 10px"
  },

  destDesc: {
    color: "#64748b",
    fontSize: "12px",
    lineHeight: "1.6",
    margin: "0 20px 12px"
  },

  categoryBadge: {
    display: "inline-block",
    color: "#c4b5fd",
    fontSize: "12px",
    background:
      "rgba(124, 58, 237, 0.18)",
    padding: "5px 10px",
    borderRadius: "6px",
    margin: "0 20px 12px"
  },

  destMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    padding: "0 20px",
    marginBottom: "15px"
  },

  metaItem: {
    color: "#a78bfa",
    fontSize: "12px",
    background:
      "rgba(124,58,237,0.1)",
    padding: "4px 8px",
    borderRadius: "6px"
  },

  exploreButton: {
    width: "calc(100% - 40px)",
    margin: "0 20px",
    padding: "11px",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "600",
    cursor: "pointer"
  },

  emptyState: {
    padding: "48px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px"
  }
};


/* ========================= */
/* RESPONSIVE */
/* ========================= */

const mediaStyles = document.createElement("style");

mediaStyles.innerHTML = `
  @media (max-width: 1100px) {
    .destination-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 700px) {
    .destination-grid {
      grid-template-columns: 1fr;
    }
  }
`;

if (!document.head.contains(mediaStyles)) {
  document.head.appendChild(mediaStyles);
}


export default Destinations;