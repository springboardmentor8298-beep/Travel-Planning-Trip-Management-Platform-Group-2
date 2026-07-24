import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, CalendarDays, ChevronDown, ChevronRight, CircleHelp, Clock3,
  Compass, FileText, Gauge, LogOut, MapPin, Menu, MessageSquare,
  MoreHorizontal, Plane, Plus, Search, Settings, TrendingUp, UsersRound,
  WalletCards, X,
} from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import dashboardModules from "../data/dashboardModules";
import api from "../services/api";
import NotificationTray from "../components/NotificationTray";

const navItems = [
  { label: "Overview", icon: Gauge, path: "/dashboard" },
  { label: "My trips", icon: Plane, path: "/trips" },
  { label: "Itineraries", icon: CalendarDays, path: "/trips" },
  { label: "Discover", icon: Compass, path: "/destinations" },
  { label: "Travel groups", icon: UsersRound, path: "/groups" },
  { label: "Budget", icon: WalletCards, path: "/budget" },
  { label: "Documents", icon: FileText, path: "/documents" },
];

function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [trips, setTrips] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  useEffect(() => { api.get("/trips", { params: { size: 50 } }).then((response) => setTrips(response.data.content || [])).catch(() => setTrips([])); }, []);
  const totalBudget = trips.reduce((total, trip) => total + (Number(trip.budget) || 0), 0);
  const totalDays = trips.reduce((total, trip) => total + Math.max(0, Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) + 1), 0);
  const nextTrip = trips.filter((trip) => new Date(`${trip.endDate}T23:59:59`) >= new Date()).sort((a,b) => new Date(a.startDate) - new Date(b.startDate))[0];
  const nextTripId = nextTrip?.id;
  useEffect(() => {
    if (!nextTripId) {
      setItinerary([]);
      return;
    }

    api.get(`/trips/${nextTripId}/itineraries`)
      .then((response) =>
        setItinerary(
          response.data
            .flatMap((day) => day.activities.map((activity) => ({ ...activity, day: day.dayNumber })))
            .slice(0, 4),
        ),
      )
      .catch(() => setItinerary([]));
  }, [nextTripId]);

  const openModule = (module) => {
    const message = module.status === "Available"
      ? `${module.title} is available from your authenticated account workspace.`
      : `${module.title} is mapped and ready for ${module.status.toLowerCase()} implementation.`;
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <button className={`sidebar-scrim ${sidebarOpen ? "is-visible" : ""}`} aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="brand-row">
          <Link className="brand" to="/"><span className="brand-mark"><Plane size={20} /></span><span>TripNest</span></Link>
          <button className="icon-button sidebar-close" title="Close navigation" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <span className="nav-caption">Workspace</span>
          {navItems.map(({ label, icon: Icon, path }, index) => (
            <button className={`nav-item ${index === 0 ? "is-active" : ""}`} key={label} onClick={() => { setSidebarOpen(false); if (path) navigate(path); }}>
              <Icon size={19} /><span>{label}</span>{label === "My trips" && <span className="nav-badge">{trips.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item"><CircleHelp size={19} /><span>Help center</span></button>
          <button className="nav-item"><Settings size={19} /><span>Settings</span></button>
          <div className="profile-chip">
            <span className="avatar">TS</span>
            <span className="profile-copy"><strong>Thiruppathi S</strong><small>Traveler</small></span>
            <button className="icon-button" title="Sign out" onClick={signOut}><LogOut size={18} /></button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" title="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
          <label className="search-box"><Search size={18} /><input aria-label="Search trips and destinations" placeholder="Search trips, places, documents..." /><kbd>Ctrl K</kbd></label>
          <div className="topbar-actions">
            <NotificationTray />
            <button className="topbar-profile"><span className="avatar avatar--small">TS</span><span>Thiruppathi</span><ChevronDown size={16} /></button>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-row">
            <div><p className="eyebrow">Your travel command center</p><h1>Make the next journey count.</h1><p>Everything you need to plan, share and experience more.</p></div>
            <button className="primary-button" onClick={() => navigate("/trips")}><Plus size={18} /> Plan a trip</button>
          </section>

          <section className="metrics-grid" aria-label="Travel overview">
            <article className="metric"><span className="metric-icon metric-icon--coral"><Plane size={20} /></span><div><small>My trips</small><strong>{trips.length}</strong><span><TrendingUp size={13} /> Live from your plans</span></div></article>
            <article className="metric"><span className="metric-icon metric-icon--teal"><MapPin size={20} /></span><div><small>Destinations</small><strong>{new Set(trips.map((trip) => trip.destination)).size}</strong><span>Across your journeys</span></div></article>
            <article className="metric"><span className="metric-icon metric-icon--gold"><WalletCards size={20} /></span><div><small>Planned budget</small><strong>₹{totalBudget.toLocaleString()}</strong><span>Across all trips</span></div></article>
            <article className="metric"><span className="metric-icon metric-icon--blue"><Clock3 size={20} /></span><div><small>Travel days</small><strong>{totalDays}</strong><span>Across your plans</span></div></article>
          </section>

          <section className="dashboard-grid">
            <article className="panel upcoming-panel">
              <div className="panel-heading"><div><p className="panel-kicker">Next adventure</p><h2>{nextTrip?.tripName || "Plan your next journey"}</h2></div><button className="icon-button" title="Trip options"><MoreHorizontal size={20} /></button></div>
              <div className="trip-visual">
                <div className="trip-visual__content"><span className="trip-pill">{nextTrip?.status || "Ready when you are"}</span><div><p><MapPin size={15} /> {nextTrip?.destination || "Choose a destination"}</p><strong>{nextTrip ? `${nextTrip.startDate} - ${nextTrip.endDate}` : "Create a trip to begin"}</strong></div></div>
              </div>
              <div className="trip-details">
                <div className="traveler-stack"><span>TS</span><span>AK</span><span>+2</span></div>
                <div className="trip-progress"><span><strong>Trip readiness</strong><small>72%</small></span><div><i /></div></div>
                <button className="secondary-button" onClick={() => navigate(nextTrip ? `/trips/${nextTrip.id}` : "/trips")}>{nextTrip ? "Open trip" : "Plan a trip"} <ChevronRight size={16} /></button>
              </div>
            </article>

            <article className="panel budget-panel">
              <div className="panel-heading"><div><p className="panel-kicker">Plan with clarity</p><h2>Trip investment</h2></div><button className="text-button" onClick={() => navigate("/trips")}>Trips <ChevronRight size={15} /></button></div>
              <div className="budget-summary"><div className="donut"><span><strong>{trips.length}</strong><small>trips</small></span></div><div><small>Planned budget</small><strong>₹{totalBudget.toLocaleString()}</strong><p><span className="legend-dot legend-dot--spent" /> {trips.length} journeys in progress</p><p><span className="legend-dot legend-dot--left" /> Add budgets per trip</p></div></div>
              <div className="category-list">
                <div><span>Trips</span><div><i style={{ width: trips.length ? "80%" : "10%" }} /></div><strong>{trips.length}</strong></div>
                <div><span>Places</span><div><i style={{ width: trips.length ? "55%" : "10%" }} /></div><strong>{new Set(trips.map((trip) => trip.destination)).size}</strong></div>
                <div><span>Days</span><div><i style={{ width: totalDays ? "38%" : "10%" }} /></div><strong>{totalDays}</strong></div>
              </div>
            </article>

            <article className="panel itinerary-panel">
              <div className="panel-heading"><div><p className="panel-kicker">Your next chapter</p><h2>{nextTrip ? `${nextTrip.tripName} itinerary` : "Your itinerary"}</h2></div><button className="text-button" onClick={() => navigate(nextTrip ? `/trips/${nextTrip.id}` : "/trips")}>Full plan <ChevronRight size={15} /></button></div>
              <div className="itinerary-list">
                {itinerary.length ? itinerary.map((item, index) => <div className="itinerary-item" key={item.id}><time>{item.startTime || "Any time"}</time><span className={`timeline-dot timeline-dot--${["coral","gold","teal","blue"][index % 4]}`} /><div><strong>{item.activityName}</strong><small>Day {item.day} · {item.activityType}</small></div><button className="icon-button" title={`${item.activityName} options`}><MoreHorizontal size={18} /></button></div>) : <div className="dashboard-empty"><CalendarDays size={22}/><span>Build a day-by-day plan for your next trip.</span></div>}
              </div>
              <button className="add-activity" onClick={() => navigate(nextTrip ? `/trips/${nextTrip.id}` : "/trips")}><Plus size={17} /> {nextTrip ? "Add activity" : "Plan your first trip"}</button>
            </article>

            <article className="panel activity-panel">
              <div className="panel-heading"><div><p className="panel-kicker">Keep momentum</p><h2>Plan with intention</h2></div><button className="text-button" onClick={() => navigate("/destinations")}>Discover</button></div>
              <div className="activity-feed">
                <div><span className="feed-icon feed-icon--teal"><UsersRound size={17} /></span><p><strong>Invite your travel companions</strong><small>Keep every traveler aligned from the first plan.</small></p></div>
                <div><span className="feed-icon feed-icon--gold"><FileText size={17} /></span><p><strong>Keep trip essentials together</strong><small>Bring your bookings and reminders into one view.</small></p></div>
                <div><span className="feed-icon feed-icon--coral"><MessageSquare size={17} /></span><p><strong>Let the journey take shape</strong><small>Start with a place, then make it your own.</small></p></div>
              </div>
            </article>
          </section>

          <section className="modules-section">
            <div className="section-heading"><div><p className="panel-kicker">Product workspace</p><h2>All TripNest modules</h2></div><span>10 modules from project scope</span></div>
            <div className="modules-grid">{dashboardModules.map((module) => <DashboardCard key={module.id} module={module} onOpen={openModule} />)}</div>
          </section>
        </div>
      </main>
      {notice && <div className="toast-notice" role="status">{notice}</div>}
    </div>
  );
}

export default Dashboard;
