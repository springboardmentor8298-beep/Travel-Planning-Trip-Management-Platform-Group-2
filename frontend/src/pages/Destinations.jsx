import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  ATTRACTION_CATEGORIES,
  STATES_LIST,
  BUDGET_LEVELS,
  SEASONS_LIST,
  DESTINATIONS_REGISTRY,
  getDestinationBySlugOrName,
} from "../data/destinationData";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaClock,
  FaCompass,
  FaTicketAlt,
  FaBuilding,
  FaLayerGroup,
  FaFilter,
  FaGlobe,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaRedo,
  FaHeart,
} from "react-icons/fa";
import "../styles/AppLayout.css";
import "../styles/Destinations.css";

const LOCAL_FALLBACK_SVG = "/images/destinations/coming-soon.svg";

function Destinations() {
  const navigate = useNavigate();
  const [rawDestinations, setRawDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState({});

  // Search & Multi-Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("All States & Global");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRating, setSelectedRating] = useState("0");
  const [selectedBudget, setSelectedBudget] = useState("All Budgets");
  const [selectedSeason, setSelectedSeason] = useState("All Seasons");
  const [viewMode, setViewMode] = useState("attractions");

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await api.get("/destinations");
        setRawDestinations(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError("Note: Operating with local tourism registry data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const registryItems = DESTINATIONS_REGISTRY ? Object.values(DESTINATIONS_REGISTRY).filter(Boolean) : [];
  const combinedMap = {};

  registryItems.forEach((regItem) => {
    if (regItem && regItem.slug) {
      combinedMap[regItem.slug] = {
        ...regItem,
        destinationId: regItem.destinationId || regItem.slug,
      };
    }
  });

  if (Array.isArray(rawDestinations) && rawDestinations.length > 0) {
    rawDestinations.forEach((dest) => {
      if (!dest) return;
      const matched = getDestinationBySlugOrName(dest);
      if (matched && matched.slug) {
        combinedMap[matched.slug] = {
          ...matched,
          ...dest,
          destinationId: dest.destinationId || dest.id || matched.slug,
        };
      }
    });
  }

  const enrichedList = Object.values(combinedMap).filter(Boolean);

  const filteredAttractions = enrichedList.filter((item) => {
    if (!item || typeof item !== "object" || !item.name) return false;
    const term = searchTerm.toLowerCase().trim();

    let targetTerm = term;
    if (term === "vizag") targetTerm = "visakhapatnam";
    if (term === "madras") targetTerm = "chennai";
    if (term === "bombay") targetTerm = "mumbai";
    if (term === "calcutta") targetTerm = "kolkata";
    if (term === "bangalore") targetTerm = "bengaluru";

    const matchesSearch =
      !term ||
      item.name?.toLowerCase().includes(targetTerm) ||
      item.city?.toLowerCase().includes(targetTerm) ||
      item.state?.toLowerCase().includes(targetTerm) ||
      item.country?.toLowerCase().includes(targetTerm) ||
      item.category?.toLowerCase().includes(targetTerm) ||
      item.description?.toLowerCase().includes(targetTerm);

    let matchesState = true;
    if (selectedState && selectedState.trim() !== "All States & Global") {
      if (selectedState.trim().toLowerCase() === "international") {
        matchesState = (item.country || "").trim().toLowerCase() !== "india";
      } else {
        matchesState = (item.state || "").trim().toLowerCase() === selectedState.trim().toLowerCase();
      }
    }

    let matchesCategory = true;
    if (selectedCategory && selectedCategory !== "All Categories") {
      matchesCategory = (item.category || "").toLowerCase().trim() === selectedCategory.toLowerCase().trim();
    }

    let matchesRating = true;
    if (selectedRating !== "0" && selectedRating !== "All Ratings") {
      const minRating = parseFloat(selectedRating);
      const itemRating = typeof item.rating === "number" ? item.rating : parseFloat(item.rating) || 0;
      matchesRating = itemRating >= minRating;
    }

    let matchesBudget = true;
    if (selectedBudget && selectedBudget !== "All Budgets") {
      const itemBudCat = (item.budgetCategory || "").toLowerCase();
      const itemEstBud = (item.estimatedBudget || item.entryFee || "").toLowerCase();
      const selBud = selectedBudget.toLowerCase();
      matchesBudget = itemBudCat.includes(selBud) || itemEstBud.includes(selBud);
    }

    let matchesSeason = true;
    if (selectedSeason && selectedSeason !== "All Seasons") {
      const seasonStr = (item.bestSeason || item.bestTimeToVisit || "").toLowerCase();
      const selSeason = selectedSeason.toLowerCase();
      matchesSeason = seasonStr.includes(selSeason) || seasonStr.includes("year-round");
    }

    return matchesSearch && matchesState && matchesCategory && matchesRating && matchesBudget && matchesSeason;
  });

  const cityGroupsMap = {};
  filteredAttractions.forEach((item) => {
    const cityKey = item.city || "Other";
    if (!cityGroupsMap[cityKey]) {
      cityGroupsMap[cityKey] = {
        cityName: item.city || "Other",
        state: item.state || "",
        country: item.country || "India",
        heroImage: item.heroImage || LOCAL_FALLBACK_SVG,
        attractions: [],
      };
    }
    cityGroupsMap[cityKey].attractions.push(item);
  });

  const cityList = Object.values(cityGroupsMap);

  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedState("All States & Global");
    setSelectedCategory("All Categories");
    setSelectedRating("0");
    setSelectedBudget("All Budgets");
    setSelectedSeason("All Seasons");
    setViewMode("attractions");
  };

  const handleImageError = (e, dest) => {
    e.target.onerror = null;
    if (dest && Array.isArray(dest.gallery) && dest.gallery.length > 1) {
      const currentSrc = e.target.src;
      const alt = dest.gallery.find((img) => img && img !== currentSrc) || dest.heroImage;
      if (alt && alt !== currentSrc) {
        e.target.src = alt;
        return;
      }
    }
    e.target.src = LOCAL_FALLBACK_SVG;
  };

  return (
    <div className="app-dashboard-container">
      <Navbar />

      <div className="app-main-layout">
        <Sidebar />

        <main className="app-content-body">
          {/* Header */}
          <div className="app-page-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="app-page-title-wrap">
              <h1 className="app-page-title">Explore Travel Destinations</h1>
              <p className="app-page-subtitle">
                Discover top tourist attractions across Andhra Pradesh, India, and global destinations.
              </p>
            </div>

            {/* View Switcher */}
            <div className="dest-view-switcher">
              <button
                className={`dest-view-btn ${viewMode === "attractions" ? "active" : ""}`}
                onClick={() => setViewMode("attractions")}
                type="button"
              >
                <FaLayerGroup /> Tourist Spots ({filteredAttractions.length})
              </button>
              <button
                className={`dest-view-btn ${viewMode === "cities" ? "active" : ""}`}
                onClick={() => setViewMode("cities")}
                type="button"
              >
                <FaBuilding /> City Guides ({cityList.length})
              </button>
            </div>
          </div>

          {error && (
            <div className="app-alert-banner app-alert-info mb-3" role="alert">
              {error}
            </div>
          )}

          {/* Search Card */}
          <div className="dest-search-card mb-4">
            <div className="dest-search-input-wrap">
              <input
                type="text"
                placeholder="Search by City (Kondaveedu, Amaravati, Vizag), State (Andhra Pradesh), Attraction (Borra Caves), or Type (Beach, Fort)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dest-search-input"
                aria-label="Search destinations"
              />
              <FaSearch className="dest-search-icon" />
            </div>
          </div>

          {/* Multi-Filter Bar */}
          <div className="dest-multi-filter-box mb-4">
            <div>
              <div className="dest-filter-label">
                <FaCompass className="text-primary" /> Filter by State / Region:
              </div>
              <div className="dest-pill-list">
                {STATES_LIST.map((st) => (
                  <button
                    key={st}
                    className={`dest-filter-pill ${selectedState === st ? "active" : ""}`}
                    onClick={() => setSelectedState(st)}
                    type="button"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="dest-filter-label">
                <FaFilter className="text-info" /> Filter by Category:
              </div>
              <div className="dest-pill-list">
                {ATTRACTION_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`dest-filter-pill ${selectedCategory === cat ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                    type="button"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-3 pt-2" style={{ borderTop: "1px solid #E2E8F0" }}>
              <div className="d-flex align-items-center gap-2">
                <span className="dest-filter-label mb-0"><FaStar className="text-warning" /> Rating:</span>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="dest-select-input"
                >
                  <option value="0">All Ratings</option>
                  <option value="4.0">4★ & Above</option>
                  <option value="4.5">4.5★ & Above</option>
                  <option value="5.0">5★</option>
                </select>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="dest-filter-label mb-0"><FaMoneyBillWave className="text-success" /> Budget:</span>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="dest-select-input"
                >
                  {BUDGET_LEVELS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="dest-filter-label mb-0"><FaCalendarAlt className="text-info" /> Season:</span>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="dest-select-input"
                >
                  {SEASONS_LIST.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetAllFilters}
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 ms-auto"
                style={{ borderRadius: "10px" }}
                type="button"
              >
                <FaRedo /> Reset Filters
              </button>
            </div>
          </div>

          {/* Content Body */}
          {loading ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="col">
                  <div className="app-glass-card p-3">
                    <div className="skeleton-loader mb-3" style={{ height: "200px", borderRadius: "14px" }} />
                    <div className="skeleton-loader mb-2" style={{ height: "24px", width: "80%" }} />
                    <div className="skeleton-loader mb-2" style={{ height: "16px", width: "50%" }} />
                    <div className="skeleton-loader" style={{ height: "16px", width: "90%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === "attractions" ? (
            filteredAttractions.length > 0 ? (
              <motion.div
                className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {filteredAttractions.map((dest, idx) => {
                  const isFav = Boolean(favorites[dest.destinationId || dest.slug]);
                  return (
                    <div key={dest.destinationId || dest.slug || idx} className="col">
                      <motion.div
                        className="attraction-card h-100"
                        whileHover={{ y: -8, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        onClick={() => navigate(`/destinations/${dest.slug || dest.id || dest.destinationId}`)}
                      >
                        <div className="attraction-img-wrap">
                          <img
                            src={dest.heroImage || LOCAL_FALLBACK_SVG}
                            alt={dest.name || "Attraction"}
                            className="attraction-img"
                            loading="lazy"
                            onError={(e) => handleImageError(e, dest)}
                          />
                          <span className="attraction-category-badge">{dest.category || "Tourism"}</span>
                          <div className="attraction-rating-badge">
                            <FaStar className="text-warning" /> {dest.rating || 4.8}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(dest.destinationId || dest.slug, e)}
                            className="btn btn-sm text-white position-absolute top-0 end-0 m-3 p-2 rounded-circle"
                            style={{
                              background: isFav ? "rgba(239, 68, 68, 0.9)" : "rgba(15, 23, 42, 0.7)",
                              backdropFilter: "blur(4px)",
                              border: "none",
                            }}
                            title={isFav ? "Remove Favorite" : "Save Favorite"}
                          >
                            <FaHeart style={{ color: isFav ? "#FFFFFF" : "#CBD5E1" }} />
                          </button>
                        </div>

                        <div className="attraction-body d-flex flex-column justify-content-between">
                          <div>
                            <h3 className="attraction-title">{dest.name}</h3>
                            <div className="attraction-location mb-2">
                              <FaMapMarkerAlt className="text-danger me-1" />
                              {dest.city}{dest.state ? `, ${dest.state}` : ""}, {dest.country || "India"}
                            </div>
                            <p className="attraction-desc mb-3">{dest.description}</p>
                          </div>

                          <div>
                            <div className="attraction-specs-row mb-3">
                              <div className="attraction-spec-item">
                                <FaClock className="text-warning me-1" />
                                <span>{dest.idealDuration || dest.recommendedDuration || "2 - 3 hrs"}</span>
                              </div>
                              <div className="attraction-spec-item">
                                <FaTicketAlt className="text-info me-1" />
                                <span>{dest.entryFee || "Free Entry"}</span>
                              </div>
                            </div>

                            <button
                              className="app-primary-btn w-100"
                              type="button"
                            >
                              Explore Complete Guide
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="app-glass-card text-center p-5">
                <FaGlobe className="text-muted mb-3" style={{ fontSize: "3.5rem" }} />
                <h2 className="h3 text-dark font-weight-bold">No Tourist Attractions Found</h2>
                <p className="text-secondary-text">Try resetting search filters or state selections.</p>
                <button onClick={resetAllFilters} className="app-primary-btn mt-2" type="button">
                  Reset All Filters
                </button>
              </div>
            )
          ) : cityList.length > 0 ? (
            <motion.div
              className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {cityList.map((cityObj, idx) => (
                <div key={cityObj.cityName || idx} className="col">
                  <div
                    className="city-card"
                    onClick={() => {
                      setSearchTerm(cityObj.cityName);
                      setViewMode("attractions");
                    }}
                  >
                    <img
                      src={cityObj.heroImage || LOCAL_FALLBACK_SVG}
                      alt={cityObj.cityName}
                      className="city-card-img"
                      onError={handleImageError}
                    />
                    <div className="city-card-overlay">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="city-badge">{cityObj.state || cityObj.country}</span>
                        <span className="city-attractions-count">
                          {cityObj.attractions.length} Places
                        </span>
                      </div>

                      <div>
                        <h2 className="text-white h3 mb-1 font-weight-bold">{cityObj.cityName}</h2>
                        <p className="text-light mb-0" style={{ fontSize: "14px", opacity: 0.9 }}>
                          Click to view all tourist spots in {cityObj.cityName} &rarr;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="app-glass-card text-center p-5">
              <FaBuilding className="text-muted mb-3" style={{ fontSize: "3.5rem" }} />
              <h2 className="h3 text-dark font-weight-bold">No Cities Found</h2>
              <p className="text-secondary-text">Try clearing your current search parameters.</p>
              <button onClick={resetAllFilters} className="app-primary-btn mt-2" type="button">
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Destinations;