import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import { getTripById } from '../services/trip.service';

const TripTimeline = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const data = await getTripById(id);
      setTrip(data);
    } catch (err) {
      setError('Failed to load trip timeline');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-root">
        <Navbar />
        <div className="page-content">
          <div className="loading-text">Loading timeline...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Trip Timeline 📅</h1>
          <p className="page-subtitle">{trip?.title} - {trip?.destination}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="section-card">
          <div className="timeline-container">
            {trip?.itineraries?.length === 0 ? (
              <div className="empty-state">
                <p>No itinerary planned yet. Add days to see your timeline.</p>
              </div>
            ) : (
              <div className="timeline">
                {trip?.itineraries?.map((day, index) => (
                  <div key={day.id} className="timeline-item">
                    <div className="timeline-marker">
                      <div className="timeline-number">{day.dayNumber}</div>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-date">
                        {day.date || `Day ${day.dayNumber}`}
                      </div>
                      {day.notes && <div className="timeline-notes">{day.notes}</div>}
                      
                      {day.activities?.length > 0 && (
                        <div className="timeline-activities">
                          {day.activities.map((activity) => (
                            <div key={activity.id} className="timeline-activity">
                              <div className="activity-time">
                                {activity.startTime && (
                                  <span className="time-badge">{activity.startTime}</span>
                                )}
                              </div>
                              <div className="activity-details">
                                <div className="activity-name">{activity.name}</div>
                                <div className="activity-meta">
                                  <span className="badge badge-activity">{activity.activityType}</span>
                                  {activity.location && <span>📍 {activity.location}</span>}
                                  {activity.cost && <span>💰 ₹{Number(activity.cost).toLocaleString()}</span>}
                                </div>
                                {activity.description && (
                                  <div className="activity-desc">{activity.description}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripTimeline;
