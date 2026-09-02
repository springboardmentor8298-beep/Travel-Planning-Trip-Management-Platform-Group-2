import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUserFriends,
  FaWallet,
  FaMapMarkerAlt,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaShareAlt,
  FaCopy,
  FaArchive,
  FaClock
} from "react-icons/fa";
import "../styles/AppLayout.css";

const DESTINATION_COVERS = {
  paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
  maldives: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80",
  tokyo: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
  "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
  default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80"
};

function TripCard({ trip, onDeleteClick, onShareClick, onDuplicateClick, onArchiveClick }) {
  const getCoverImage = () => {
    if (trip.coverImage && trip.coverImage.trim() !== "") {
      return trip.coverImage;
    }
    if (!trip.city && !trip.destinationName) return DESTINATION_COVERS.default;
    const keyStr = (trip.city || trip.destinationName || "").toLowerCase().trim();
    for (const key in DESTINATION_COVERS) {
      if (keyStr.includes(key)) {
        return DESTINATION_COVERS[key];
      }
    }
    return DESTINATION_COVERS.default;
  };

  const getStatusColorClass = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "bg-success text-white";
      case "ONGOING":
      case "ACTIVE":
        return "bg-primary text-white";
      case "CANCELLED":
        return "bg-danger text-white";
      case "ARCHIVED":
        return "bg-secondary text-white";
      case "PLANNING":
        return "bg-info text-white";
      default:
        return "bg-warning text-dark"; // UPCOMING
    }
  };

  const calculateDuration = () => {
    if (trip.durationDays && trip.durationDays > 0) return trip.durationDays;
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 1;
    }
    return 1;
  };

  const duration = calculateDuration();
  const progress = trip.progressPercentage !== undefined ? trip.progressPercentage : 0;

  return (
    <div className="card app-glass-card h-100 p-0 overflow-hidden border-0" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Cover Image Header */}
      <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
        <img
          src={getCoverImage()}
          alt={trip.destinationName || "Trip Destination"}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          className="trip-cover-img"
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(2, 6, 17, 0.7))'
        }} />
        
        <span
          className={`badge ${getStatusColorClass(trip.status)}`}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '700',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            textTransform: 'uppercase'
          }}
        >
          {trip.status || "UPCOMING"}
        </span>

        <span
          className="badge bg-dark text-white border border-secondary"
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <FaClock style={{ color: '#38BDF8' }} /> {duration} Day{duration > 1 ? 's' : ''}
        </span>
      </div>

      {/* Card Body */}
      <div className="card-body p-4" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <h3 className="card-title h5 text-white mb-1" style={{ fontWeight: '700' }}>
          {trip.tripName}
        </h3>
        
        <p className="text-muted d-flex align-items-center gap-2 mb-2" style={{ fontSize: '0.9rem' }}>
          <FaMapMarkerAlt className="text-primary" />
          {trip.destinationId ? (
            <Link
              to={`/destinations/${trip.destinationId}`}
              className="text-primary text-decoration-none hover-underline"
              style={{ fontWeight: '600' }}
            >
              {trip.destinationName || "View Destination"}
            </Link>
          ) : (
            <span>{trip.destinationName || "Destination Not Specified"}</span>
          )}
        </p>

        {trip.description && (
          <p className="text-muted mb-2" style={{
            fontSize: '0.85rem',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {trip.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="my-2">
          <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            <span>Itinerary Progress</span>
            <span className="text-white font-weight-bold">{progress}%</span>
          </div>
          <div className="progress" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>
            <div
              className="progress-bar bg-primary"
              role="progressbar"
              style={{ width: `${progress}%`, borderRadius: '3px' }}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>

        {/* Dates and Budget Specs */}
        <div className="mt-auto pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.85rem' }}>
            <span className="d-flex align-items-center gap-1">
              <FaCalendarAlt /> {trip.startDate}
            </span>
            <span className="d-flex align-items-center gap-1">
              <FaUserFriends /> {trip.numberOfTravelers} traveler{trip.numberOfTravelers > 1 ? 's' : ''}
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
            <span className="d-flex align-items-center gap-1 text-white" style={{ fontWeight: '700', fontSize: '1.05rem' }}>
              <FaWallet className="text-success" /> ${trip.budgetAllocated}
            </span>
            
            {/* Quick Actions Buttons: View, Edit, Delete, Share, Duplicate, Archive */}
            <div className="d-flex gap-1 flex-wrap">
              <Link
                to={`/trips/${trip.tripId}`}
                className="btn btn-sm btn-outline-light"
                style={{ borderRadius: '8px', padding: '4px 8px' }}
                title="View Details"
              >
                <FaEye />
              </Link>
              <Link
                to={`/trips/edit/${trip.tripId}`}
                className="btn btn-sm btn-outline-primary"
                style={{ borderRadius: '8px', padding: '4px 8px' }}
                title="Edit Trip"
              >
                <FaEdit />
              </Link>
              <button
                onClick={() => onShareClick && onShareClick(trip)}
                className="btn btn-sm btn-outline-info"
                style={{ borderRadius: '8px', padding: '4px 8px' }}
                type="button"
                title="Share Trip"
              >
                <FaShareAlt />
              </button>
              <button
                onClick={() => onDuplicateClick && onDuplicateClick(trip.tripId)}
                className="btn btn-sm btn-outline-warning"
                style={{ borderRadius: '8px', padding: '4px 8px' }}
                type="button"
                title="Duplicate Trip"
              >
                <FaCopy />
              </button>
              <button
                onClick={() => onArchiveClick && onArchiveClick(trip.tripId)}
                className="btn btn-sm btn-outline-secondary"
                style={{ borderRadius: '8px', padding: '4px 8px' }}
                type="button"
                title={trip.status === "ARCHIVED" ? "Unarchive Trip" : "Archive Trip"}
              >
                <FaArchive />
              </button>
              <button
                onClick={() => onDeleteClick(trip.tripId, trip.tripName)}
                className="btn btn-sm btn-outline-danger"
                style={{ borderRadius: '8px', padding: '4px 8px' }}
                type="button"
                title="Delete Trip"
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripCard;

