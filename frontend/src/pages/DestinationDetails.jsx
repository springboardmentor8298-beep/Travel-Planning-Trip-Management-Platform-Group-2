import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getDestinationBySlugOrName } from "../data/destinationData";
import {
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaStar,
  FaClock,
  FaTicketAlt,
  FaHistory,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaPlane,
  FaTrain,
  FaBus,
  FaCalendarCheck,
  FaShoppingCart,
  FaTimes,
  FaExpand,
  FaHeart,
  FaRegHeart,
  FaShieldAlt,
  FaCamera,
  FaLandmark,
  FaCompass,
  FaShareAlt,
  FaPlus,
  FaChevronDown,
  FaChevronUp,
  FaQuoteLeft,
  FaYoutube
} from "react-icons/fa";
import "../styles/AppLayout.css";
import "../styles/Destinations.css";

const DEFAULT_GALLERY = [
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
];

const DEFAULT_REVIEWS = [
  {
    id: 1,
    user: "Aarav Sharma",
    avatar: "AS",
    rating: 5,
    date: "August 2026",
    comment: "An absolute marvel of architecture and natural beauty! The sunset view from the top ramparts was breathtaking. Highly recommend visiting early morning."
  },
  {
    id: 2,
    user: "Priya Patel",
    avatar: "PP",
    rating: 5,
    date: "July 2026",
    comment: "Incredible historical depth and peaceful surroundings. The travel guide logistics provided by TripNest made our family visit super smooth!"
  },
  {
    id: 3,
    user: "Vikram Malhotra",
    avatar: "VM",
    rating: 4,
    date: "June 2026",
    comment: "A must-visit spot for photography and history enthusiasts. Clean surroundings, clear signage, and great local food options nearby."
  }
];

function DestinationDetails() {
  // ── 1. ALL REACT HOOKS AT TOP LEVEL (MUST BE BEFORE ANY EARLY RETURNS) ──
  const params = useParams();
  const routeParam = params.slug || params.id;
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeImage, setActiveImage] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [accordionOpen, setAccordionOpen] = useState({ history: true, arch: false, tips: false });

  // Reviews state
  const [reviewsList, setReviewsList] = useState(DEFAULT_REVIEWS);
  const [newReview, setNewReview] = useState({ user: "", rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Hook 1: Fetch Destination Data Effect
  useEffect(() => {
    setLoading(true);

    if (routeParam) {
      const data = getDestinationBySlugOrName(routeParam);

      if (data && (data.slug || data.id || data.name)) {
        setDestination(data);
        const mainImg = data.heroImage || data.imageUrl || (data.gallery && data.gallery[0]) || DEFAULT_GALLERY[0];
        setActiveImage(mainImg);
        setLoading(false);
      } else {
        setDestination(null);
        setLoading(false);
        navigate("/destinations", { replace: true });
      }
    } else {
      setLoading(false);
      navigate("/destinations", { replace: true });
    }
  }, [routeParam, navigate, params]);

  // Hook 2: Keyboard navigation for Lightbox modal (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      const list = (destination && destination.gallery && destination.gallery.length > 0) ? destination.gallery : DEFAULT_GALLERY;
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => {
          const nextIdx = (prev - 1 + list.length) % list.length;
          setActiveImage(list[nextIdx]);
          return nextIdx;
        });
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => {
          const nextIdx = (prev + 1) % list.length;
          setActiveImage(list[nextIdx]);
          return nextIdx;
        });
      } else if (e.key === "Escape") {
        setLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, destination]);

  // ── 2. HELPER FUNCTIONS & LOGIC ──
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setAlert({ type: "success", message: "Destination link copied to clipboard!" });
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    setAlert({
      type: "success",
      message: !isFavorite ? "Saved to your Favorite Destinations!" : "Removed from Favorites.",
    });
    setTimeout(() => setAlert({ type: "", message: "" }), 2500);
  };

  const toggleAccordion = (key) => {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.user.trim() || !newReview.comment.trim()) {
      setAlert({ type: "danger", message: "Please enter your name and review comment." });
      return;
    }

    setReviewSubmitting(true);
    const created = {
      id: Date.now(),
      user: newReview.user,
      avatar: newReview.user.substring(0, 2).toUpperCase(),
      rating: Number(newReview.rating),
      date: "Just now",
      comment: newReview.comment,
    };

    setReviewsList([created, ...reviewsList]);
    setNewReview({ user: "", rating: 5, comment: "" });
    setReviewSubmitting(false);
    setAlert({ type: "success", message: "Thank you! Your review has been posted." });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  // YouTube Dynamic URL & Search Resolver
  const getDestinationYouTubeUrl = (dest) => {
    if (!dest || !dest.name) return "https://www.youtube.com";
    const loc = dest.city || dest.state || dest.location || "";
    const queryStr = (dest.name + (loc ? ` ${loc}` : "")).trim();
    const query = encodeURIComponent(queryStr);
    return `https://www.youtube.com/results?search_query=${query}`;
  };

  const handleWatchOnYouTube = () => {
    if (!destination || !destination.name) return;
    const url = getDestinationYouTubeUrl(destination);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // YouTube Video Embed Resolver & Validator
  const getValidYouTubeEmbedUrl = (dest) => {
    if (!dest) return null;

    if (dest.youtubeVideoId && typeof dest.youtubeVideoId === "string" && dest.youtubeVideoId.length === 11) {
      return `https://www.youtube.com/embed/${dest.youtubeVideoId}`;
    }

    const urlCandidates = [dest.youtubeUrl, dest.youtubeVideo, dest.videoUrl, dest.youtube];
    for (const rawUrl of urlCandidates) {
      if (rawUrl && typeof rawUrl === "string") {
        const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (match && match[1]) {
          return `https://www.youtube.com/embed/${match[1]}`;
        }
      }
    }

    return null;
  };

  // Helper to format Quick Information Card values concisely
  const formatFactValue = (key, rawVal) => {
    if (!rawVal) {
      if (key === "fee") return "Free";
      if (key === "timings") return "Daily";
      if (key === "duration") return "2–3 Hours";
      if (key === "season") return "Year-Round";
      if (key === "rating") return "4.8 / 5.0";
      if (key === "budget") return "Budget Friendly";
      if (key === "unesco") return "Protected Heritage";
    }

    const str = String(rawVal).trim();

    if (key === "fee") {
      if (str.toLowerCase().includes("free")) return "Free";
      if (str.includes("300")) return "₹300 Special";
      if (str.length > 14) return str.split(" ")[0] || "Free";
      return str;
    }
    if (key === "timings") {
      if (str.toLowerCase().includes("daily")) return "Daily";
      if (str.includes("03:00 AM") || str.includes("01:30 AM")) return "03:00 AM – 01:30 AM";
      if (str.length > 18) return "09:00 AM – 05:00 PM";
      return str.replace("-", "–");
    }
    if (key === "duration") {
      if (str.includes("3") && str.includes("4")) return "3–4 Hours";
      if (str.includes("2") && str.includes("3")) return "2–3 Hours";
      if (str.length > 12) return "2–3 Hours";
      return str.replace("-", "–");
    }
    if (key === "season") {
      if (str.toLowerCase().includes("year") || str.toLowerCase().includes("all")) return "Year-Round";
      if (str.length > 12) return "Oct – Mar";
      return str.replace("-", "–");
    }
    if (key === "unesco") {
      if (str.toLowerCase().includes("ttd")) return "TTD Protected";
      if (str.toLowerCase().includes("state") || str.toLowerCase().includes("heritage") || str.toLowerCase().includes("protected")) return "Protected Heritage";
      if (str.length > 16) return "Protected Heritage";
      return str;
    }

    return str;
  };

  // ── 3. CONDITIONAL EARLY RETURNS (MUST BE PLACED AFTER ALL HOOKS) ──
  if (loading) {
    return (
      <div className="app-dashboard-container">
        <Navbar />
        <div className="app-main-layout">
          <Sidebar />
          <main className="app-content-body">
            <div className="app-loader-box">
              <div className="spinner-border text-primary" role="status"></div>
              <span>Loading Destination Details...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!destination) {
    return null; // Automatic redirect is handled in useEffect
  }

  const galleryImages = destination.gallery && destination.gallery.length > 0 ? destination.gallery : DEFAULT_GALLERY;
  const mapEmbedQuery = encodeURIComponent(`${destination.name} ${destination.state || ""}`);
  const validEmbedUrl = getValidYouTubeEmbedUrl(destination);
  const targetYouTubeUrl = getDestinationYouTubeUrl(destination);

  const openLightboxAt = (idx) => {
    setLightboxIndex(idx);
    setActiveImage(galleryImages[idx]);
    setLightboxOpen(true);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    const prevIdx = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
    setLightboxIndex(prevIdx);
    setActiveImage(galleryImages[prevIdx]);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    const nextIdx = (lightboxIndex + 1) % galleryImages.length;
    setLightboxIndex(nextIdx);
    setActiveImage(galleryImages[nextIdx]);
  };

  return (
    <div className="app-dashboard-container">
      <Navbar />

      <div className="app-main-layout">
        <Sidebar />

        <main className="app-content-body">
          {/* Breadcrumb Back Button */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <button onClick={() => navigate("/destinations")} className="btn btn-link text-decoration-none text-secondary p-0 d-flex align-items-center gap-2">
              <FaChevronLeft /> Back to All Destinations
            </button>
            <span className="badge bg-primary px-3 py-2" style={{ borderRadius: "20px" }}>
              {destination.category || "Travel Destination"}
            </span>
          </div>

          {alert.message && (
            <div className={`app-alert-banner app-alert-${alert.type}`} role="alert">
              {alert.message}
            </div>
          )}

          {/* ── 1. HERO SECTION & GALLERY PREVIEW ── */}
          <div className="app-glass-card p-4 mb-4">
            <div className="guide-hero-gallery-wrap">
              {/* Large Cover Hero Image */}
              <div className="guide-hero-main-img-box" onClick={() => openLightboxAt(0)}>
                <img src={activeImage || galleryImages[0]} alt={destination.name} className="guide-hero-main-img" />
                <button className="btn btn-sm btn-dark position-absolute bottom-0 end-0 m-3 px-3 py-2" style={{ borderRadius: "10px", opacity: 0.9 }}>
                  <FaExpand className="me-2" /> View Fullscreen
                </button>
              </div>

              {/* Thumbnail Gallery Underneath */}
              <div className="guide-thumbs-grid">
                {galleryImages.slice(0, 4).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className={`guide-thumb-item ${activeImage === imgUrl ? "active" : ""}`}
                    onClick={() => { setActiveImage(imgUrl); setLightboxIndex(idx); }}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="guide-thumb-img" />
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Title & Primary Meta Details */}
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mt-3">
              <div>
                <h1 className="h2 text-dark font-weight-bold mb-1">{destination.name}</h1>
                <p className="text-secondary d-flex align-items-center gap-2 mb-2" style={{ fontSize: "16px" }}>
                  <FaMapMarkerAlt className="text-primary" /> {destination.city || destination.state}, {destination.state}, {destination.country || "India"}
                </p>
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-warning text-dark px-3 py-2 font-weight-bold d-flex align-items-center gap-1" style={{ borderRadius: "8px", fontSize: "14px" }}>
                    <FaStar /> {destination.rating || "4.8"} (Visitor Rating)
                  </span>
                  <span className="text-muted" style={{ fontSize: "14px" }}>
                    Category: <strong>{destination.category}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="guide-action-btn-group">
                <button
                  onClick={toggleFavorite}
                  className={`guide-action-btn ${isFavorite ? "active-fav" : ""}`}
                  type="button"
                >
                  {isFavorite ? <FaHeart className="text-danger" /> : <FaRegHeart className="text-secondary" />}
                  {isFavorite ? "Saved" : "Favorite"}
                </button>

                <button onClick={handleShare} className="guide-action-btn" type="button">
                  <FaShareAlt className="text-primary" /> Share
                </button>

                <button onClick={() => setActiveTab("map")} className="guide-action-btn" type="button">
                  <FaMapMarkerAlt className="text-primary" /> View Map
                </button>

                <button onClick={handleWatchOnYouTube} className="guide-action-btn" type="button">
                  <FaYoutube className="text-danger" /> Watch on YouTube
                </button>

                <Link to={`/trips/create?destination=${encodeURIComponent(destination.name)}`} className="guide-action-btn-primary">
                  <FaPlus /> Add to Trip
                </Link>
              </div>
            </div>

            <p className="text-secondary mt-3 mb-0" style={{ fontSize: "15px", lineHeight: "1.6" }}>
              {destination.fullIntroduction || destination.description || "Discover real-time historical significance, travel logistics, and recommendations for your perfect trip."}
            </p>
          </div>

          {/* ── 2. QUICK INFORMATION CARDS (7 CARDS - EQUAL SIZES & PIXEL-PERFECT ALIGNMENT) ── */}
          <div className="guide-quick-facts-grid">
            <div className="guide-fact-card">
              <div className="guide-fact-icon"><FaTicketAlt /></div>
              <div className="guide-fact-content">
                <span className="guide-fact-title">Entry Fee</span>
                <div className="guide-fact-val" title={destination.entryFee}>
                  {formatFactValue("fee", destination.entryFee)}
                </div>
              </div>
            </div>

            <div className="guide-fact-card">
              <div className="guide-fact-icon"><FaClock /></div>
              <div className="guide-fact-content">
                <span className="guide-fact-title">Timings</span>
                <div className="guide-fact-val" title={destination.timings}>
                  {formatFactValue("timings", destination.timings)}
                </div>
              </div>
            </div>

            <div className="guide-fact-card">
              <div className="guide-fact-icon"><FaCalendarCheck /></div>
              <div className="guide-fact-content">
                <span className="guide-fact-title">Duration</span>
                <div className="guide-fact-val" title={destination.recommendedDuration}>
                  {formatFactValue("duration", destination.recommendedDuration)}
                </div>
              </div>
            </div>

            <div className="guide-fact-card">
              <div className="guide-fact-icon"><FaCompass /></div>
              <div className="guide-fact-content">
                <span className="guide-fact-title">Best Season</span>
                <div className="guide-fact-val" title={destination.bestTimeToVisit}>
                  {formatFactValue("season", destination.bestTimeToVisit)}
                </div>
              </div>
            </div>

            <div className="guide-fact-card">
              <div className="guide-fact-icon"><FaStar /></div>
              <div className="guide-fact-content">
                <span className="guide-fact-title">Visitor Rating</span>
                <div className="guide-fact-val">
                  {destination.rating ? `${destination.rating} / 5.0` : "4.8 / 5.0"}
                </div>
              </div>
            </div>

            <div className="guide-fact-card">
              <div className="guide-fact-icon"><FaInfoCircle /></div>
              <div className="guide-fact-content">
                <span className="guide-fact-title">Budget</span>
                <div className="guide-fact-val" title={destination.budgetLevel}>
                  {formatFactValue("budget", destination.budgetLevel)}
                </div>
              </div>
            </div>

            <div className="guide-fact-card">
              <div className="guide-fact-icon"><FaShieldAlt /></div>
              <div className="guide-fact-content">
                <span className="guide-fact-title">UNESCO Status</span>
                <div className="guide-fact-val" title={destination.unescoStatus}>
                  {formatFactValue("unesco", destination.unescoStatus)}
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. TABBED LAYOUT NAVIGATION (7 DEDICATED TABS) ── */}
          <div className="guide-nav-tabs-bar">
            {[
              { id: "overview", label: "Overview", icon: <FaInfoCircle /> },
              { id: "history", label: "History & Culture", icon: <FaHistory /> },
              { id: "gallery", label: "Gallery", icon: <FaCamera /> },
              { id: "guide", label: "Travel Guide", icon: <FaLandmark /> },
              { id: "reviews", label: "Reviews", icon: <FaQuoteLeft /> },
              { id: "map", label: "Map & Location", icon: <FaMapMarkerAlt /> },
              { id: "youtube", label: "Watch on YouTube", icon: <FaYoutube className="text-danger" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`guide-tab-item ${activeTab === tab.id ? "active" : ""}`}
                type="button"
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ── 4. TAB CONTENTS (ONLY ONE VISIBLE AT A TIME) ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="row g-4">
                  <div className="col-lg-8">
                    <div className="app-glass-card h-100">
                      <h3 className="h5 text-dark mb-3 font-weight-bold">About {destination.name}</h3>
                      <p className="text-secondary" style={{ fontSize: "15px", lineHeight: "1.7" }}>
                        {destination.fullIntroduction || destination.description}
                      </p>

                      <h4 className="h6 text-dark mt-4 mb-3 font-weight-bold">Why Visit This Landmark?</h4>
                      <p className="text-secondary" style={{ fontSize: "15px", lineHeight: "1.7" }}>
                        {destination.whyFamous || "Celebrated for its outstanding architectural craftsmanship, scenic surroundings, and rich cultural heritage."}
                      </p>

                      {destination.thingsToDo && destination.thingsToDo.length > 0 && (
                        <div className="mt-4">
                          <h4 className="h6 text-dark mb-3 font-weight-bold">Top Recommended Experiences</h4>
                          <ul className="list-unstyled">
                            {destination.thingsToDo.map((item, idx) => (
                              <li key={idx} className="d-flex align-items-center gap-2 mb-2 text-secondary" style={{ fontSize: "14px" }}>
                                <span className="badge bg-primary-subtle text-primary rounded-circle p-1">✓</span> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <div className="app-glass-card h-100">
                      <h3 className="h5 text-dark mb-3 font-weight-bold">Quick Specifications</h3>
                      <div className="d-flex flex-column gap-3">
                        <div>
                          <span className="text-muted d-block" style={{ fontSize: "12px" }}>Built By</span>
                          <strong className="text-dark" style={{ fontSize: "14px" }}>{destination.builtBy || "Historical Monarchs / Rulers"}</strong>
                        </div>
                        <div>
                          <span className="text-muted d-block" style={{ fontSize: "12px" }}>Built Period / Era</span>
                          <strong className="text-dark" style={{ fontSize: "14px" }}>{destination.builtYear || "14th Century AD"}</strong>
                        </div>
                        <div>
                          <span className="text-muted d-block" style={{ fontSize: "12px" }}>Dynasty</span>
                          <strong className="text-dark" style={{ fontSize: "14px" }}>{destination.dynasty || "Regional Kingdom"}</strong>
                        </div>
                        <div>
                          <span className="text-muted d-block" style={{ fontSize: "12px" }}>Architecture Style</span>
                          <strong className="text-dark" style={{ fontSize: "14px" }}>{destination.architectureStyle || "Dravidian / Medieval Fortress"}</strong>
                        </div>
                        <div>
                          <span className="text-muted d-block" style={{ fontSize: "12px" }}>Elevation & Area</span>
                          <strong className="text-dark" style={{ fontSize: "14px" }}>{destination.elevationArea || "Elevation 1,700 ft"}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: HISTORY & CULTURE (ACCORDIONS) */}
              {activeTab === "history" && (
                <div className="app-glass-card">
                  <h3 className="h5 text-dark mb-4 font-weight-bold">History, Architecture & Cultural Significance</h3>

                  <div className="guide-accordion-item">
                    <div className="guide-accordion-header" onClick={() => toggleAccordion("history")}>
                      <span>Complete Historical Background</span>
                      {accordionOpen.history ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                    {accordionOpen.history && (
                      <div className="guide-accordion-body">
                        <p>{destination.completeHistory || destination.historicalSignificance || "This landmark holds deep historical roots spanning centuries of royal patronage, warrior resilience, and regional development."}</p>
                      </div>
                    )}
                  </div>

                  <div className="guide-accordion-item">
                    <div className="guide-accordion-header" onClick={() => toggleAccordion("arch")}>
                      <span>Architectural Style & Construction Materials</span>
                      {accordionOpen.arch ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                    {accordionOpen.arch && (
                      <div className="guide-accordion-body">
                        <p><strong>Architecture Style:</strong> {destination.architectureStyle || "Classic medieval craftsmanship with fortified bastions."}</p>
                        <p><strong>Construction Materials:</strong> {destination.constructionMaterials || "Granite stone masonry, lime mortar, and native hill bedrock."}</p>
                      </div>
                    )}
                  </div>

                  <div className="guide-accordion-item">
                    <div className="guide-accordion-header" onClick={() => toggleAccordion("tips")}>
                      <span>Cultural & Religious Importance</span>
                      {accordionOpen.tips ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                    {accordionOpen.tips && (
                      <div className="guide-accordion-body">
                        <p><strong>Cultural Heritage:</strong> {destination.culturalSignificance || "Celebrates royal patronage of literature, temple construction, and water engineering."}</p>
                        <p><strong>Religious Shrines:</strong> {destination.religiousImportance || "Houses sacred shrines and ancient heritage ruins."}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PHOTO GALLERY */}
              {activeTab === "gallery" && (
                <div className="app-glass-card">
                  <h3 className="h5 text-dark mb-4 font-weight-bold"><FaCamera className="text-primary me-2" /> Photo Gallery</h3>
                  <div className="guide-gallery-container">
                    <div className="guide-gallery-grid">
                      {galleryImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="guide-gallery-item"
                          onClick={() => openLightboxAt(idx)}
                        >
                          <img
                            src={imgUrl}
                            alt={`Gallery Image ${idx + 1}`}
                            className="guide-gallery-img"
                          />
                          <div className="guide-gallery-overlay">
                            <span className="badge bg-light text-dark px-3 py-2 rounded-pill font-weight-bold">
                              <FaExpand className="me-1" /> Expand
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TRAVEL GUIDE & LOGISTICS */}
              {activeTab === "guide" && (
                <div className="row g-4">
                  <div className="col-lg-6">
                    <div className="app-glass-card h-100">
                      <h3 className="h5 text-dark mb-3 font-weight-bold"><FaLandmark className="text-primary me-2" /> How to Reach</h3>
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex gap-3">
                          <div className="p-3 bg-primary-subtle text-primary rounded-3"><FaPlane /></div>
                          <div>
                            <strong className="text-dark d-block">By Air</strong>
                            <span className="text-secondary" style={{ fontSize: "14px" }}>{destination.nearestAirport || destination.howToReach || "Nearest airport connections available with local transport."}</span>
                          </div>
                        </div>

                        <div className="d-flex gap-3">
                          <div className="p-3 bg-info-subtle text-info rounded-3"><FaTrain /></div>
                          <div>
                            <strong className="text-dark d-block">By Train</strong>
                            <span className="text-secondary" style={{ fontSize: "14px" }}>{destination.nearestRailway || "Nearest railway junction linked via state buses."}</span>
                          </div>
                        </div>

                        <div className="d-flex gap-3">
                          <div className="p-3 bg-success-subtle text-success rounded-3"><FaBus /></div>
                          <div>
                            <strong className="text-dark d-block">By Road / Bus</strong>
                            <span className="text-secondary" style={{ fontSize: "14px" }}>{destination.howToReach || "Highway connectivity via taxis and inter-city state buses."}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="app-glass-card h-100">
                      <h3 className="h5 text-dark mb-3 font-weight-bold"><FaShoppingCart className="text-primary me-2" /> Local Cuisine & Shopping</h3>
                      {destination.famousFoods && (
                        <div className="mb-3">
                          <strong className="text-dark d-block mb-1">Famous Local Dishes:</strong>
                          <div className="d-flex flex-wrap gap-2">
                            {destination.famousFoods.map((food, idx) => (
                              <span key={idx} className="badge bg-light text-dark border">{food}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {destination.shopping && (
                        <div>
                          <strong className="text-dark d-block mb-1">Shopping & Souvenirs:</strong>
                          <div className="d-flex flex-wrap gap-2">
                            {destination.shopping.map((shop, idx) => (
                              <span key={idx} className="badge bg-light text-primary border">{shop}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: REVIEWS */}
              {activeTab === "reviews" && (
                <div className="row g-4">
                  <div className="col-lg-7">
                    <div className="app-glass-card">
                      <h3 className="h5 text-dark mb-3 font-weight-bold">Visitor Reviews ({reviewsList.length})</h3>
                      {reviewsList.map((rev) => (
                        <div key={rev.id} className="review-card-item">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center gap-3">
                              <div className="review-avatar-circle">{rev.avatar}</div>
                              <div>
                                <strong className="text-dark d-block" style={{ fontSize: "15px" }}>{rev.user}</strong>
                                <small className="text-muted">{rev.date}</small>
                              </div>
                            </div>
                            <span className="badge bg-warning text-dark"><FaStar /> {rev.rating}.0</span>
                          </div>
                          <p className="text-secondary mb-0" style={{ fontSize: "14px", lineHeight: "1.6" }}>{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-lg-5">
                    <div className="app-glass-card">
                      <h3 className="h5 text-dark mb-3 font-weight-bold">Post Your Review</h3>
                      <form onSubmit={handleAddReview}>
                        <div className="app-form-group">
                          <label className="app-form-label">Your Name</label>
                          <input
                            type="text"
                            value={newReview.user}
                            onChange={(e) => setNewReview({ ...newReview, user: e.target.value })}
                            placeholder="e.g. Ananya Sen"
                            className="app-form-input"
                            required
                          />
                        </div>

                        <div className="app-form-group">
                          <label className="app-form-label">Rating</label>
                          <select
                            value={newReview.rating}
                            onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                            className="app-form-select"
                          >
                            <option value="5">5 ★★★★★ Excellent</option>
                            <option value="4">4 ★★★★☆ Very Good</option>
                            <option value="3">3 ★★★☆☆ Average</option>
                            <option value="2">2 ★★☆☆☆ Poor</option>
                          </select>
                        </div>

                        <div className="app-form-group">
                          <label className="app-form-label">Review Comment</label>
                          <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Share your travel experiences, tips, and highlights..."
                            className="app-form-textarea"
                            rows="4"
                            required
                          ></textarea>
                        </div>

                        <button type="submit" className="app-primary-btn w-100" disabled={reviewSubmitting}>
                          Submit Review
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: MAP & LOCATION */}
              {activeTab === "map" && (
                <div className="app-glass-card">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="h5 text-dark mb-0 font-weight-bold"><FaMapMarkerAlt className="text-primary me-2" /> Interactive Location Map</h3>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${mapEmbedQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="app-primary-btn text-decoration-none btn-sm"
                      style={{ height: "38px", padding: "0 16px" }}
                    >
                      Open in Google Maps <FaExternalLinkAlt />
                    </a>
                  </div>

                  <div className="rounded-3 overflow-hidden border shadow-sm" style={{ height: "420px" }}>
                    <iframe
                      title={`Map of ${destination.name}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${mapEmbedQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              {/* TAB 7: WATCH ON YOUTUBE */}
              {activeTab === "youtube" && (
                <div className="app-glass-card">
                  {validEmbedUrl ? (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="h5 text-dark mb-0 font-weight-bold d-flex align-items-center gap-2">
                          <FaYoutube className="text-danger" style={{ fontSize: "1.5rem" }} /> Watch {destination.name} Video Guide
                        </h3>
                        <a
                          href={targetYouTubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-danger font-weight-bold d-inline-flex align-items-center gap-1"
                          style={{ borderRadius: "8px" }}
                        >
                          <FaYoutube /> Open in YouTube <FaExternalLinkAlt style={{ fontSize: "0.8rem" }} />
                        </a>
                      </div>

                      <div className="ratio ratio-16x9 rounded-4 overflow-hidden border shadow-sm">
                        <iframe
                          src={validEmbedUrl}
                          title={`Watch ${destination.name} on YouTube`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-5">
                      <div className="mb-3">
                        <span className="badge bg-secondary-subtle text-dark px-3 py-2 rounded-pill font-weight-bold" style={{ fontSize: "14px" }}>
                          Video unavailable
                        </span>
                      </div>
                      <FaYoutube className="text-danger mb-3" style={{ fontSize: "4rem" }} />
                      <h3 className="h4 text-dark font-weight-bold mb-2">Watch {destination.name} Vlogs & Travel Guides</h3>
                      <p className="text-secondary mb-4" style={{ fontSize: "15px", maxWidth: "560px", margin: "0 auto 24px auto" }}>
                        Direct embedded video is unavailable for this destination. Click below to explore official videos, drone footage, and travel guides on YouTube.
                      </p>
                      <button
                        onClick={handleWatchOnYouTube}
                        className="btn btn-danger font-weight-bold d-inline-flex align-items-center gap-2 px-4 py-3"
                        style={{ borderRadius: "14px", fontSize: "16px", boxShadow: "0 4px 16px rgba(239, 68, 68, 0.35)" }}
                        type="button"
                      >
                        <FaYoutube style={{ fontSize: "1.3rem" }} /> Watch on YouTube &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Full-screen Lightbox Modal with Prev/Next Controls */}
          {lightboxOpen && (
            <div className="app-modal-overlay" onClick={() => setLightboxOpen(false)}>
              <div
                className="position-relative d-flex align-items-center justify-content-center"
                style={{ width: "90vw", height: "90vh" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Previous Button */}
                <button
                  onClick={handlePrevImage}
                  className="btn btn-dark position-absolute start-0 ms-3 rounded-circle p-3 shadow-lg"
                  style={{ zIndex: 10, opacity: 0.85 }}
                  title="Previous Image"
                  type="button"
                >
                  <FaChevronLeft style={{ fontSize: "1.2rem" }} />
                </button>

                {/* SINGLE Image Currently Selected */}
                <div className="text-center">
                  <img
                    src={galleryImages[lightboxIndex] || activeImage}
                    alt={`Photo ${lightboxIndex + 1}`}
                    className="img-fluid rounded-4 shadow-lg"
                    style={{ maxHeight: "80vh", maxWidth: "85vw", objectFit: "contain" }}
                  />
                  <div className="badge bg-dark text-white px-3 py-2 rounded-pill mt-3 font-weight-bold opacity-75">
                    Image {lightboxIndex + 1} of {galleryImages.length}
                  </div>
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextImage}
                  className="btn btn-dark position-absolute end-0 me-3 rounded-circle p-3 shadow-lg"
                  style={{ zIndex: 10, opacity: 0.85 }}
                  title="Next Image"
                  type="button"
                >
                  <FaChevronRight style={{ fontSize: "1.2rem" }} />
                </button>

                {/* Close (X) Button */}
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="btn btn-danger position-absolute top-0 end-0 m-3 rounded-circle p-2 shadow-lg"
                  title="Close Lightbox"
                  type="button"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DestinationDetails;
