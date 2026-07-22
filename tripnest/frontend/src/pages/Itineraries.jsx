import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

import AddDayModal from "../components/AddDayModal";
import AddActivityModal from "../components/AddActivityModal";
import EditActivityModal from "../components/EditActivityModal";
import DeleteActivityModal from "../components/DeleteActivityModal";
import itineraryService from "../services/itineraryService";
import activityService from "../services/activityService";

const Itineraries = () => {

  // -----------------------------
  // Trip Context
  // -----------------------------

  // TODO: replace with the real trip id (e.g. from route params / context)
  const TRIP_ID = 1;

  // -----------------------------
  // Itinerary Data (now loaded from backend, not hardcoded)
  // -----------------------------

  const [days, setDays] = useState([]);

  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Modal States
  // -----------------------------

  const [showAddDay, setShowAddDay] = useState(false);

  const [showAddActivity, setShowAddActivity] =
    useState(false);

  const [showEditActivity, setShowEditActivity] =
    useState(false);

  const [showDeleteActivity, setShowDeleteActivity] =
    useState(false);

  // -----------------------------
  // Selected Day
  // -----------------------------

  const [selectedDayIndex, setSelectedDayIndex] =
    useState(null);

  // -----------------------------
  // Selected Activity
  // -----------------------------

  const [selectedActivityIndex, setSelectedActivityIndex] =
    useState(null);

  const [selectedActivity, setSelectedActivity] =
    useState(null);

  // -----------------------------
  // Load itinerary + activities from backend
  // -----------------------------

  const loadItinerary = async () => {

    try {

      setLoading(true);

      const itineraryRes =
        await itineraryService.getTripItineraries(TRIP_ID);

      const itineraryDays = itineraryRes.data;

      const finalDays = [];

      for (const day of itineraryDays) {

        const activityRes =
          await activityService.getActivities(day.id);

        finalDays.push({
          id: day.id,
          day: finalDays.length + 1,
          description: day.notes,
          activities: activityRes.data.map((a) => ({
            id: a.id,
            title: a.title,
            location: a.location,
            time: a.startTime,
            type: a.type,
            notes: a.description,
          })),
        });
      }

      setDays(finalDays);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    loadItinerary();

  }, []);

  // -----------------------------
  // Open Add Day
  // -----------------------------

  const openAddDay = () => {
    setShowAddDay(true);
  };

  // -----------------------------
  // Save Day -> backend
  // -----------------------------

  const handleAddDay = async (data) => {

    try {

      await itineraryService.createItinerary({
        tripId: TRIP_ID,
        date: new Date().toISOString().split("T")[0],
        notes: data.description,
      });

      setShowAddDay(false);

      await loadItinerary();

    } catch (err) {

      console.log(err);

      alert("Unable to create itinerary day.");

    }
  };

  // -----------------------------
  // Open Add Activity
  // -----------------------------

  const openAddActivity = (dayIndex) => {

    setSelectedDayIndex(dayIndex);

    setShowAddActivity(true);
  };

  // -----------------------------
  // Save Activity -> backend
  // -----------------------------

  const handleAddActivity = async (activity) => {

    try {

      const itineraryId = days[selectedDayIndex].id;

      await activityService.createActivity({
        itineraryId,
        title: activity.title,
        location: activity.location,
        startTime: activity.time,
        type: activity.type,
        description: activity.notes,
      });

      setShowAddActivity(false);

      await loadItinerary();

    } catch (err) {

      console.log(err);

      alert("Unable to add activity.");

    }
  };

  // -----------------------------
  // Open Edit
  // -----------------------------

  const openEditActivity = (
    dayIndex,
    activityIndex
  ) => {

    setSelectedDayIndex(dayIndex);

    setSelectedActivityIndex(activityIndex);

    setSelectedActivity(
      days[dayIndex].activities[activityIndex]
    );

    setShowEditActivity(true);
  };

  // -----------------------------
  // Update Activity -> backend
  // -----------------------------

  const handleUpdateActivity = async (updatedActivity) => {

    try {

      const activityId = selectedActivity.id;

      await activityService.updateActivity(activityId, {
        title: updatedActivity.title,
        location: updatedActivity.location,
        startTime: updatedActivity.time,
        type: updatedActivity.type,
        description: updatedActivity.notes,
      });

      setShowEditActivity(false);

      await loadItinerary();

    } catch (err) {

      console.log(err);

      alert("Unable to update activity.");

    }
  };

  // -----------------------------
  // Open Delete
  // -----------------------------

  const openDeleteActivity = (
    dayIndex,
    activityIndex
  ) => {

    setSelectedDayIndex(dayIndex);

    setSelectedActivityIndex(activityIndex);

    setSelectedActivity(
      days[dayIndex].activities[activityIndex]
    );

    setShowDeleteActivity(true);
  };

  // -----------------------------
  // Delete Activity -> backend
  // -----------------------------

  const handleDeleteActivity = async () => {

    try {

      const activityId = selectedActivity.id;

      await activityService.deleteActivity(activityId);

      setShowDeleteActivity(false);

      await loadItinerary();

    } catch (err) {

      console.log(err);

      alert("Unable to delete activity.");

    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />

      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Trip Itinerary 🗓️</h1>
            <p style={styles.subtitle}>
              Plan and organize your trip activities
            </p>
          </div>

          <button
            className="btn-aurora"
            onClick={openAddDay}
          >
            + Add Day
          </button>
        </div>

        {/* Day Cards */}

        {loading ? (
          <div style={styles.emptyCard}>
            <h2>Loading itinerary...</h2>
          </div>
        ) : days.length === 0 ? (
          <div style={styles.emptyCard}>
            <h2>No itinerary created</h2>

            <p>Create your first itinerary day.</p>

            <button
              className="btn-aurora"
              onClick={openAddDay}
            >
              Create Day
            </button>
          </div>
        ) : (
          days.map((day, dayIndex) => (
            <div
              key={day.id}
              style={styles.dayCard}
              className="glass-card"
            >
              {/* Day Header */}

              <div style={styles.dayHeader}>
                <div>
                  <h2 style={styles.dayTitle}>
                    Day {day.day}
                  </h2>

                  <p style={styles.dayDescription}>
                    {day.description}
                  </p>
                </div>

                <button
                  className="btn-ghost"
                  onClick={() =>
                    openAddActivity(dayIndex)
                  }
                >
                  + Add Activity
                </button>
              </div>

              {/* Activities */}

              {day.activities.length === 0 ? (
                <div style={styles.noActivity}>
                  No activities added.
                </div>
              ) : (
                day.activities.map(
                  (activity, activityIndex) => (
                    <div
                      key={activity.id}
                      style={styles.activityCard}
                    >
                      <div style={styles.left}>
                        <div style={styles.icon}>
                          📍
                        </div>

                        <div>
                          <h3
                            style={
                              styles.activityTitle
                            }
                          >
                            {activity.title}
                          </h3>

                          <p
                            style={
                              styles.activityLocation
                            }
                          >
                            {activity.location}
                          </p>

                          <div
                            style={
                              styles.activityInfo
                            }
                          >
                            <span>
                              🕒 {activity.time}
                            </span>

                            <span>
                              {activity.type}
                            </span>
                          </div>

                          {activity.notes && (
                            <p
                              style={
                                styles.activityNotes
                              }
                            >
                              {activity.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Buttons */}

                      <div style={styles.buttons}>
                        <button
                          className="btn-ghost"
                          onClick={() =>
                            openEditActivity(
                              dayIndex,
                              activityIndex
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          style={styles.deleteButton}
                          onClick={() =>
                            openDeleteActivity(
                              dayIndex,
                              activityIndex
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          ))
        )}

        {/* Add Day Modal */}

        <AddDayModal
          isOpen={showAddDay}
          onClose={() =>
            setShowAddDay(false)
          }
          onSave={handleAddDay}
          nextDay={days.length + 1}
        />

        {/* Add Activity Modal */}

        <AddActivityModal
          isOpen={showAddActivity}
          onClose={() =>
            setShowAddActivity(false)
          }
          onSave={handleAddActivity}
        />

        {/* Edit Modal */}

        <EditActivityModal
          isOpen={showEditActivity}
          onClose={() =>
            setShowEditActivity(false)
          }
          onUpdate={handleUpdateActivity}
          activity={selectedActivity}
        />

        {/* Delete Modal */}

        <DeleteActivityModal
          isOpen={showDeleteActivity}
          onClose={() =>
            setShowDeleteActivity(false)
          }
          onConfirm={handleDeleteActivity}
          activityName={
            selectedActivity?.title || ""
          }
        />
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#0a0f1e",
  },

  main: {
    marginLeft: "260px",
    flex: 1,
    padding: "32px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  title: {
    fontSize: "34px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "6px",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "15px",
  },

  emptyCard: {
    textAlign: "center",
    padding: "60px",
    borderRadius: "18px",
    background: "#1e293b",
    color: "white",
  },

  dayCard: {
    background: "#1e293b",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "25px",
    border: "1px solid rgba(255,255,255,.08)",
  },

  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
  },

  dayTitle: {
    color: "#fff",
    fontSize: "24px",
    fontWeight: "700",
  },

  dayDescription: {
    color: "#94a3b8",
    marginTop: "4px",
  },

  noActivity: {
    padding: "20px",
    textAlign: "center",
    color: "#94a3b8",
    border: "1px dashed #475569",
    borderRadius: "12px",
  },

  activityCard: {
    background: "#0f172a",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  left: {
    display: "flex",
    gap: "18px",
    alignItems: "flex-start",
  },

  icon: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#7c3aed22",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
  },

  activityTitle: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "5px",
  },

  activityLocation: {
    color: "#94a3b8",
    marginBottom: "8px",
  },

  activityInfo: {
    display: "flex",
    gap: "20px",
    color: "#22d3ee",
    fontSize: "14px",
    marginBottom: "8px",
  },

  activityNotes: {
    color: "#cbd5e1",
    fontSize: "14px",
  },

  buttons: {
    display: "flex",
    gap: "10px",
  },

  deleteButton: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default Itineraries;