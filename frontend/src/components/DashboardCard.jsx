import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useSpring, useTransform } from "framer-motion";
import {
  FaSuitcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaWallet,
  FaCompass,
  FaPlusCircle,
  FaReceipt,
  FaBell,
  FaMapMarkerAlt,
  FaStar,
  FaPassport,
  FaLuggageCart,
  FaCloudSun,
  FaExchangeAlt,
  FaClock,
  FaArrowRight,
  FaInfoCircle,
} from "react-icons/fa";


/* Animated Counter Component */
export function AnimatedCounter({ value, prefix = "", suffix = "" }) {
  const numericValue = typeof value === "number" ? value : parseFloat(value) || 0;
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    if (start === end) {
      setCount(end);
      return;
    }

    const duration = 1000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [numericValue]);

  const formatted =
    prefix === "$"
      ? `$${count.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `${prefix}${Math.round(count).toLocaleString()}${suffix}`;

  return <span>{formatted}</span>;
}

/* Stat Counter Card */
export function StatCard({ label, value, icon: Icon, colorClass, prefix = "", suffix = "", trend }) {
  return (
    <motion.div
      className="dash-stat-card"
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      <div className="dash-stat-info">
        <span className="dash-stat-label">{label}</span>
        <div className="dash-stat-value">
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
        </div>
        {trend && (
          <span className="dash-stat-trend">
            <span>↑</span> {trend}
          </span>
        )}
      </div>
      <div className={`dash-stat-icon-wrapper ${colorClass}`}>
        <Icon />
      </div>
    </motion.div>
  );
}

/* Quick Action Card */
export function QuickActionCard({ to, title, description, icon: Icon, iconBg, iconColor }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ height: "100%" }}
    >
      <Link to={to} className="dash-action-card">
        <div className="dash-action-icon" style={{ background: iconBg, color: iconColor }}>
          <Icon />
        </div>
        <div>
          <h3 className="dash-action-title">{title}</h3>
          <p className="dash-action-desc">{description}</p>
        </div>
      </Link>
    </motion.div>
  );
}

/* Recent Trip Card Item */
const DESTINATION_IMAGES = {
  paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80",
  tokyo: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80",
  "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80",
  london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80",
  default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80",
};

export function TripItem({ trip }) {
  const destLower = (trip.destinationName || "").toLowerCase();
  const matchedKey = Object.keys(DESTINATION_IMAGES).find((key) => destLower.includes(key)) || "default";
  const imageSrc = DESTINATION_IMAGES[matchedKey];

  const getStatusBadge = (status) => {
    const s = (status || "UPCOMING").toUpperCase();
    if (s === "COMPLETED") return <span className="dash-status-badge badge-completed">Completed</span>;
    if (s === "CANCELLED") return <span className="dash-status-badge badge-cancelled">Cancelled</span>;
    if (s === "ACTIVE") return <span className="dash-status-badge badge-active">Active</span>;
    return <span className="dash-status-badge badge-upcoming">Upcoming</span>;
  };

  return (
    <motion.div
      className="dash-trip-item"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="dash-trip-left">
        <img
          src={imageSrc}
          alt={trip.destinationName || trip.tripName}
          className="dash-trip-thumb"
          onError={(e) => {
            e.target.src = DESTINATION_IMAGES.default;
          }}
        />
        <div className="dash-trip-details">
          <Link to={`/trips/${trip.tripId}`} className="dash-trip-name">
            {trip.tripName}
          </Link>
          <div className="dash-trip-sub">
            <span>
              <FaMapMarkerAlt style={{ color: "#0EA5E9", marginRight: "4px" }} />
              {trip.destinationName || "Custom Destination"}
            </span>
            <span>•</span>
            <span>
              <FaCalendarAlt style={{ marginRight: "4px" }} />
              {trip.startDate} to {trip.endDate}
            </span>
          </div>
        </div>
      </div>

      <div className="dash-trip-right">
        <div className="dash-trip-budget">
          ${parseFloat(trip.budgetAllocated || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="dash-trip-budget-label">Allocated Budget</span>
        </div>
        <div>{getStatusBadge(trip.status)}</div>
        <Link to={`/trips/${trip.tripId}`} className="app-secondary-btn" style={{ height: "38px", padding: "0 14px", fontSize: "13px" }}>
          View Details
        </Link>
      </div>
    </motion.div>
  );
}

/* Empty State Illustration */
export function EmptyTripsState() {
  return (
    <motion.div
      className="dash-empty-state"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="dash-empty-icon-wrap">
        <FaCompass />
      </div>
      <h3 className="dash-empty-title">No Trips Yet</h3>
      <p className="dash-empty-subtitle">
        Create your first adventure to unlock itinerary schedules, budget tracking, and real-time travel analytics!
      </p>
      <Link to="/trips/create" className="app-primary-btn" style={{ gap: "8px" }}>
        <FaPlusCircle />
        <span>Plan Your First Trip</span>
      </Link>
    </motion.div>
  );
}

/* Timeline Item */
export function TimelineItem({ time, title, destination, status, icon: Icon = FaClock }) {
  return (
    <div className="dash-timeline-item">
      <div className="dash-timeline-dot"></div>
      <div className="dash-timeline-content">
        <div className="dash-timeline-time">
          <Icon />
          <span>{time}</span>
        </div>
        <div className="dash-timeline-title">{title}</div>
        <div className="dash-timeline-sub">
          <span>📍 {destination}</span> • <span style={{ color: "#0EA5E9", fontWeight: "600" }}>{status}</span>
        </div>
      </div>
    </div>
  );
}

/* Destination Suggestion Card */
export function DestinationCard({ title, country, rating, image, description }) {
  return (
    <motion.div
      className="dash-dest-card"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      <div className="dash-dest-img-wrap">
        <img src={image} alt={title} className="dash-dest-img" />
        <div className="dash-dest-rating">
          <FaStar />
          <span>{rating}</span>
        </div>
      </div>
      <div className="dash-dest-body">
        <div className="dash-dest-country">{title}, {country}</div>
        <div className="dash-dest-desc">{description}</div>
        <Link to="/destinations" className="app-secondary-btn" style={{ height: "36px", fontSize: "13px", marginTop: "8px" }}>
          <span>Explore</span>
          <FaArrowRight style={{ fontSize: "11px" }} />
        </Link>
      </div>
    </motion.div>
  );
}

/* Travel Tip Card */
export function TravelTipCard({ icon: Icon, title, description, badgeColor = "rgba(56, 189, 248, 0.15)" }) {
  return (
    <div className="dash-tip-card">
      <div className="dash-tip-header">
        <div className="dash-tip-icon" style={{ color: "#38BDF8" }}>
          <Icon />
        </div>
        <h4 className="dash-tip-title">{title}</h4>
      </div>
      <p className="dash-tip-text">{description}</p>
    </div>
  );
}

/* Loading Skeleton */
export function DashboardSkeleton() {
  return (
    <div className="d-flex flex-column gap-4 w-100">
      {/* Hero Skeleton */}
      <div className="dash-skeleton" style={{ height: "180px", borderRadius: "24px" }}></div>
      {/* Stat Skeleton Grid */}
      <div className="dash-stats-grid">
        <div className="dash-skeleton" style={{ height: "100px", borderRadius: "18px" }}></div>
        <div className="dash-skeleton" style={{ height: "100px", borderRadius: "18px" }}></div>
        <div className="dash-skeleton" style={{ height: "100px", borderRadius: "18px" }}></div>
        <div className="dash-skeleton" style={{ height: "100px", borderRadius: "18px" }}></div>
      </div>
      {/* Quick Actions Skeleton */}
      <div className="dash-actions-grid">
        <div className="dash-skeleton" style={{ height: "110px", borderRadius: "16px" }}></div>
        <div className="dash-skeleton" style={{ height: "110px", borderRadius: "16px" }}></div>
        <div className="dash-skeleton" style={{ height: "110px", borderRadius: "16px" }}></div>
        <div className="dash-skeleton" style={{ height: "110px", borderRadius: "16px" }}></div>
        <div className="dash-skeleton" style={{ height: "110px", borderRadius: "16px" }}></div>
      </div>
      {/* Main Grid Skeleton */}
      <div className="dash-main-grid">
        <div className="dash-skeleton" style={{ height: "340px", borderRadius: "18px" }}></div>
        <div className="dash-skeleton" style={{ height: "340px", borderRadius: "18px" }}></div>
      </div>
    </div>
  );
}
