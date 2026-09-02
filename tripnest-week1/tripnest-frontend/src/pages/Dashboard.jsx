import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'destinations' | 'create' | 'trips'
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search Widget State
  const [bookingType, setBookingType] = useState("Flights");
  const [fromLoc, setFromLoc] = useState("Mumbai, UP");
  const [toLoc, setToLoc] = useState("Darjeeling, DP");
  const [passengerClass, setPassengerClass] = useState("2 Adults, First Class");

  // Create Trip Form State
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [status, setStatus] = useState("PLANNED");
  const [description, setDescription] = useState("");

  const getToken = () => localStorage.getItem("token") || localStorage.getItem("jwtToken");

  const fetchTrips = () => {
    setLoading(true);
    fetch("http://localhost:8080/api/trips", {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setTrips(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setTrips([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCreateTrip = (e) => {
    e.preventDefault();
    const newTrip = {
      title,
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      status,
      description,
    };

    fetch("http://localhost:8080/api/trips", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTrip),
    })
      .then((res) => {
        if (res.ok) {
          alert("Adventure Created Successfully! 🎉");
          setTitle("");
          setDestination("");
          setStartDate("");
          setEndDate("");
          setBudget("");
          setDescription("");
          fetchTrips();
          setActiveTab("trips");
        } else {
          setTrips([...trips, { ...newTrip, id: Date.now() }]);
          setActiveTab("trips");
        }
      })
      .catch(() => {
        setTrips([...trips, { ...newTrip, id: Date.now() }]);
        setActiveTab("trips");
      });
  };

  const handleDeleteTrip = (id) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    fetch(`http://localhost:8080/api/trips/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(() => fetchTrips())
      .catch(() => setTrips(trips.filter((t) => t.id !== id)));
  };

  // Extended Destinations Collection
  const destinationsList = [
    { name: "Goa, India", category: "Beach & Party", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&q=80", price: "₹12,000" },
    { name: "Darjeeling, West Bengal", category: "Hill Station", img: "https://images.unsplash.com/photo-1544634076-a196a1f457f8?w=500&q=80", price: "₹18,500" },
    { name: "Paris, France", category: "Romantic & Heritage", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&q=80", price: "₹85,000" },
    { name: "Bali, Indonesia", category: "Tropical Paradise", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80", price: "₹45,000" },
    { name: "Tokyo, Japan", category: "Modern Culture", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&q=80", price: "₹75,000" },
    { name: "Manali, Himachal Pradesh", category: "Snow & Adventure", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=500&q=80", price: "₹15,000" },
    { name: "Dubrovnik, Croatia", category: "Historic Coastal", img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=500&q=80", price: "₹65,000" },
    { name: "Kyoto, Japan", category: "Temples & Gardens", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&q=80", price: "₹70,000" },
  ];

  return (
    <div style={styles.layout}>
      {/* --- LEFT GREEN SIDEBAR --- */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <span style={{ fontSize: "28px" }}>✈️</span>
          <span style={styles.sidebarTitle}>TripNest</span>
        </div>

        <nav style={styles.navMenu}>
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              ...styles.navItem,
              backgroundColor: activeTab === "overview" ? "#047857" : "transparent",
            }}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab("destinations")}
            style={{
              ...styles.navItem,
              backgroundColor: activeTab === "destinations" ? "#047857" : "transparent",
            }}
          >
            🏖️ Destinations
          </button>
          <button
            onClick={() => setActiveTab("create")}
            style={{
              ...styles.navItem,
              backgroundColor: activeTab === "create" ? "#047857" : "transparent",
            }}
          >
            ✏️ Create Trip
          </button>
          <button
            onClick={() => setActiveTab("trips")}
            style={{
              ...styles.navItem,
              backgroundColor: activeTab === "trips" ? "#047857" : "transparent",
            }}
          >
            🧳 My Trips
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={logout} style={styles.logoutBtnSidebar}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN DISPLAY CONTENT --- */}
      <main style={styles.mainContent}>
        {/* Top Header Bar */}
        <header style={styles.topHeader}>
          <div>
            <h2 style={{ margin: 0, color: "#111827", fontSize: "22px" }}>
              Hello, {user?.name || "Keerthana"} 👋
            </h2>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
              Welcome back, let's plan your next adventure
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => setActiveTab("create")} style={styles.createTripTopBtn}>
              + Create Trip
            </button>
            <div style={styles.userAvatar}>
              {(user?.name || "K").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "14px" }}>{user?.name || "Keerthana"}</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>{user?.email || "keerthana@travel.com"}</div>
            </div>
          </div>
        </header>

        {/* --- TAB 1: OVERVIEW PAGE --- */}
        {activeTab === "overview" && (
          <div>
            {/* Green Hero Banner Section */}
            <div style={styles.heroBanner}>
              <h1 style={{ fontSize: "36px", margin: "0 0 10px 0", fontWeight: "800" }}>
                Got a place in mind?
              </h1>
              <p style={{ margin: "0 0 30px 0", opacity: 0.9, fontSize: "16px" }}>
                TripNest - Making travel planning effortless
              </p>

              {/* Booking / Search Panel */}
              <div style={styles.searchPanel}>
                <div style={styles.bookingTabs}>
                  {["Flights", "Hotel", "Train", "Villas & Apt"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setBookingType(type)}
                      style={{
                        ...styles.bookingTab,
                        color: bookingType === type ? "#059669" : "#4b5563",
                        fontWeight: bookingType === type ? "700" : "500",
                        borderBottom: bookingType === type ? "3px solid #059669" : "none",
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div style={styles.searchFields}>
                  <div style={styles.inputBox}>
                    <label style={styles.inputLabel}>FROM</label>
                    <input
                      type="text"
                      value={fromLoc}
                      onChange={(e) => setFromLoc(e.target.value)}
                      style={styles.heroInput}
                    />
                  </div>
                  <div style={styles.inputBox}>
                    <label style={styles.inputLabel}>TO</label>
                    <input
                      type="text"
                      value={toLoc}
                      onChange={(e) => setToLoc(e.target.value)}
                      style={styles.heroInput}
                    />
                  </div>
                  <div style={styles.inputBox}>
                    <label style={styles.inputLabel}>PASSENGER / CLASS</label>
                    <input
                      type="text"
                      value={passengerClass}
                      onChange={(e) => setPassengerClass(e.target.value)}
                      style={styles.heroInput}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setDestination(toLoc);
                      setTitle(`${toLoc} Vacation`);
                      setActiveTab("create");
                    }}
                    style={styles.searchBtn}
                  >
                    🔍 Search
                  </button>
                </div>
              </div>
            </div>

            {/* Flight & Special Deals Cards */}
            <div style={styles.dealsGrid}>
              <div style={{ ...styles.dealCard, background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                <h3>Flight Deals</h3>
                <p>Up to 50% Off on international flights</p>
                <button onClick={() => setActiveTab("destinations")} style={styles.dealBtn}>Claim Now</button>
              </div>
              <div style={{ ...styles.dealCard, background: "linear-gradient(135deg, #0d9488 0%, #0284c7 100%)" }}>
                <h3>Special Deals</h3>
                <p>For Villas & Luxury Apartments</p>
                <button onClick={() => setActiveTab("destinations")} style={styles.dealBtn}>Explore Options</button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: EXPLORE DESTINATIONS --- */}
        {activeTab === "destinations" && (
          <div>
            <h2 style={{ color: "#111827", marginBottom: "8px" }}>Explore Destinations 🏖️</h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              Discover top-rated destinations and launch your itineraries instantly.
            </p>

            <div style={styles.destinationsGrid}>
              {destinationsList.map((dest, i) => (
                <div key={i} style={styles.destinationCard}>
                  <img src={dest.img} alt={dest.name} style={styles.destImage} />
                  <div style={{ padding: "16px" }}>
                    <span style={styles.destCategory}>{dest.category}</span>
                    <h3 style={{ margin: "8px 0 4px 0", color: "#111827" }}>{dest.name}</h3>
                    <p style={{ fontWeight: "700", color: "#059669", margin: "0 0 16px 0" }}>
                      Avg. {dest.price}
                    </p>
                    <button
                      onClick={() => {
                        setDestination(dest.name);
                        setTitle(`${dest.name} Tour`);
                        setActiveTab("create");
                      }}
                      style={styles.planBtn}
                    >
                      Plan Trip Here
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: CREATE TRIP FORM --- */}
        {activeTab === "create" && (
          <div style={styles.formContainer}>
            <h2 style={{ color: "#111827", marginTop: 0 }}>Create New Adventure ✏️</h2>
            <form onSubmit={handleCreateTrip}>
              <div style={styles.formRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Trip Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Family Vacation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Destination *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Goa, India"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formRowThree}>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Budget (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>No. of Travelers</label>
                  <input
                    type="number"
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={styles.formInput}
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={styles.fieldLabel}>Description</label>
                <textarea
                  rows="4"
                  placeholder="Describe your adventure plans, goals, and notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ ...styles.formInput, width: "100%", height: "100px" }}
                />
              </div>

              <button type="submit" style={styles.submitAdventureBtn}>
                Create Adventure
              </button>
            </form>
          </div>
        )}

        {/* --- TAB 4: MY TRIPS LIST --- */}
        {activeTab === "trips" && (
          <div>
            <h2 style={{ color: "#111827", marginBottom: "16px" }}>Your Saved Adventures 🧳</h2>
            {loading ? (
              <p>Loading itinerary...</p>
            ) : trips.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: "40px" }}>🏝️</span>
                <h3>No trips found!</h3>
                <p>Click "Create Trip" to start planning.</p>
              </div>
            ) : (
              <div style={styles.destinationsGrid}>
                {trips.map((trip) => (
                  <div key={trip.id} style={styles.tripListCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={styles.statusBadge}>{trip.status || "PLANNED"}</span>
                      <button onClick={() => handleDeleteTrip(trip.id)} style={styles.deleteBtnIcon}>
                        🗑️
                      </button>
                    </div>
                    <h3 style={{ margin: "10px 0 4px 0", color: "#111827" }}>{trip.title}</h3>
                    <p style={{ margin: "0 0 10px 0", color: "#6b7280", fontSize: "14px" }}>
                      📍 {trip.destination || "Global Destination"}
                    </p>
                    <div style={styles.datesBox}>
                      📅 {trip.startDate} to {trip.endDate}
                    </div>
                    {trip.budget && (
                      <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#4b5563" }}>
                        💰 <strong>Budget:</strong> ₹{trip.budget}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Styling Object with Green Theme
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f0fdf4",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  sidebar: {
    width: "240px",
    backgroundColor: "#059669", // Emerald Green Sidebar
    color: "#ffffff",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
  },
  sidebarBrand: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "36px", paddingLeft: "8px" },
  sidebarTitle: { fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px" },
  navMenu: { display: "flex", flexDirection: "column", gap: "10px", flex: 1 },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
  },
  sidebarFooter: { marginTop: "auto" },
  logoutBtnSidebar: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.18)",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  mainContent: { flex: 1, padding: "32px 40px", overflowY: "auto" },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
  },
  createTripTopBtn: {
    backgroundColor: "#059669",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  heroBanner: {
    background: "linear-gradient(135deg, #047857 0%, #064e3b 100%)",
    borderRadius: "20px",
    padding: "40px",
    color: "#ffffff",
    marginBottom: "30px",
  },
  searchPanel: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    color: "#111827",
  },
  bookingTabs: { display: "flex", gap: "20px", marginBottom: "16px", borderBottom: "1px solid #e5e7eb" },
  bookingTab: { background: "none", border: "none", padding: "8px 12px", cursor: "pointer", fontSize: "14px" },
  searchFields: { display: "flex", gap: "16px", alignItems: "center" },
  inputBox: { flex: 1, backgroundColor: "#f3f4f6", padding: "8px 12px", borderRadius: "8px" },
  inputLabel: { display: "block", fontSize: "10px", fontWeight: "bold", color: "#6b7280" },
  heroInput: { border: "none", background: "transparent", width: "100%", fontWeight: "700", fontSize: "14px", outline: "none" },
  searchBtn: { backgroundColor: "#059669", color: "#fff", border: "none", padding: "14px 28px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  dealsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  dealCard: { padding: "24px", borderRadius: "16px", color: "#fff" },
  dealBtn: { backgroundColor: "#fff", color: "#111827", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "700", marginTop: "12px", cursor: "pointer" },
  destinationsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" },
  destinationCard: { backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb" },
  destImage: { width: "100%", height: "160px", objectFit: "cover" },
  destCategory: { backgroundColor: "#dcfce7", color: "#15803d", fontSize: "11px", fontWeight: "bold", padding: "4px 8px", borderRadius: "4px" },
  planBtn: { width: "100%", backgroundColor: "#059669", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "700", cursor: "pointer" },
  formContainer: { backgroundColor: "#fff", padding: "32px", borderRadius: "16px", border: "1px solid #e5e7eb", maxWidth: "800px" },
  formRow: { display: "flex", gap: "20px", marginBottom: "16px" },
  formRowThree: { display: "flex", gap: "16px", marginBottom: "16px" },
  fieldGroup: { flex: 1 },
  fieldLabel: { display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" },
  formInput: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" },
  submitAdventureBtn: { width: "100%", backgroundColor: "#059669", color: "#fff", border: "none", padding: "14px", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer" },
  tripListCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e5e7eb" },
  statusBadge: { backgroundColor: "#dcfce7", color: "#15803d", fontSize: "11px", fontWeight: "bold", padding: "4px 8px", borderRadius: "4px" },
  datesBox: { backgroundColor: "#f8fafc", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", color: "#4b5563" },
  deleteBtnIcon: { background: "none", border: "none", cursor: "pointer" },
  emptyState: { backgroundColor: "#fff", padding: "40px", textAlign: "center", borderRadius: "12px", color: "#6b7280" },
};