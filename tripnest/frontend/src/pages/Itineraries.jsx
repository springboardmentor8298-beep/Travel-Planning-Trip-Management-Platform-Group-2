import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

import itineraryService from "../services/itineraryService";
import activityService from "../services/activityService";

const Itineraries = () => {

    // ==========================================
    // TEMPORARY TRIP ID
    // ==========================================

    const TRIP_ID = 2;

    // ==========================================
    // STATE
    // ==========================================

    const [days, setDays] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // Day modal
    const [showDayModal, setShowDayModal] =
        useState(false);

    const [dayForm, setDayForm] = useState({
        date: "",
        notes: ""
    });

    // Activity modal
    const [showActivityModal, setShowActivityModal] =
        useState(false);

    const [activityMode, setActivityMode] =
        useState("add");

    const [selectedDayId, setSelectedDayId] =
        useState(null);

    const [selectedActivityId, setSelectedActivityId] =
        useState(null);

    const [activityForm, setActivityForm] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        location: "",
        type: "SIGHTSEEING",
        cost: ""
    });

    // ==========================================
    // LOAD ITINERARY
    // ==========================================

    const loadItinerary = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await itineraryService.getTripItineraries(
                    TRIP_ID
                );

            const itineraryDays =
                response.data || [];

            const formattedDays =
                itineraryDays.map((day, index) => ({

                    id: day.id,

                    day: index + 1,

                    date: day.date,

                    notes: day.notes || "",

                    tripTitle:
                        day.tripTitle || "",

                    activities:
                        (day.activities || []).map(
                            (activity) => ({

                                id: activity.id,

                                title:
                                    activity.title || "",

                                description:
                                    activity.description || "",

                                startTime:
                                    activity.startTime || "",

                                endTime:
                                    activity.endTime || "",

                                location:
                                    activity.location || "",

                                type:
                                    activity.type ||
                                    "OTHER",

                                cost:
                                    activity.cost ??
                                    null
                            })
                        )
                }));

            setDays(formattedDays);

        } catch (err) {

            console.error(
                "Error loading itinerary:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load itinerary."
            );

        } finally {

            setLoading(false);
        }
    };

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        loadItinerary();

    }, []);

    // ==========================================
    // DAY MODAL
    // ==========================================

    const openDayModal = () => {

        setDayForm({
            date: "",
            notes: ""
        });

        setShowDayModal(true);
    };

    const closeDayModal = () => {

        setShowDayModal(false);

        setDayForm({
            date: "",
            notes: ""
        });
    };

    // ==========================================
    // DAY FORM CHANGE
    // ==========================================

    const handleDayChange = (e) => {

        setDayForm({
            ...dayForm,
            [e.target.name]: e.target.value
        });
    };

    // ==========================================
    // CREATE DAY
    // ==========================================

    const handleCreateDay = async (e) => {

        e.preventDefault();

        try {

            if (!dayForm.date) {

                alert("Please select a date.");

                return;
            }

            await itineraryService.createItinerary({

                tripId: TRIP_ID,

                date: dayForm.date,

                notes: dayForm.notes

            });

            closeDayModal();

            await loadItinerary();

        } catch (err) {

            console.error(
                "Error creating itinerary:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Unable to create itinerary."
            );
        }
    };

    // ==========================================
    // ACTIVITY MODAL
    // ==========================================

    const openAddActivity = (dayId) => {

        setActivityMode("add");

        setSelectedDayId(dayId);

        setSelectedActivityId(null);

        setActivityForm({

            title: "",

            description: "",

            startTime: "",

            endTime: "",

            location: "",

            type: "SIGHTSEEING",

            cost: ""
        });

        setShowActivityModal(true);
    };

    // ==========================================
    // EDIT ACTIVITY
    // ==========================================

    const openEditActivity = (
        dayId,
        activity
    ) => {

        setActivityMode("edit");

        setSelectedDayId(dayId);

        setSelectedActivityId(
            activity.id
        );

        setActivityForm({

            title:
                activity.title || "",

            description:
                activity.description || "",

            startTime:
                activity.startTime || "",

            endTime:
                activity.endTime || "",

            location:
                activity.location || "",

            type:
                activity.type || "OTHER",

            cost:
                activity.cost ?? ""
        });

        setShowActivityModal(true);
    };

    // ==========================================
    // CLOSE ACTIVITY MODAL
    // ==========================================

    const closeActivityModal = () => {

        setShowActivityModal(false);

        setSelectedDayId(null);

        setSelectedActivityId(null);
    };

    // ==========================================
    // ACTIVITY FORM CHANGE
    // ==========================================

    const handleActivityChange = (e) => {

        setActivityForm({

            ...activityForm,

            [e.target.name]:
                e.target.value
        });
    };

    // ==========================================
    // SAVE ACTIVITY
    // ==========================================

    const handleSaveActivity = async (e) => {

        e.preventDefault();

        try {

            if (!activityForm.title.trim()) {

                alert(
                    "Activity title is required."
                );

                return;
            }

            if (
                activityForm.startTime &&
                activityForm.endTime &&
                activityForm.endTime <
                    activityForm.startTime
            ) {

                alert(
                    "End time cannot be before start time."
                );

                return;
            }

            const data = {

                itineraryId:
                    selectedDayId,

                title:
                    activityForm.title,

                description:
                    activityForm.description,

                startTime:
                    activityForm.startTime ||
                    null,

                endTime:
                    activityForm.endTime ||
                    null,

                location:
                    activityForm.location,

                type:
                    activityForm.type,

                cost:
                    activityForm.cost === ""
                        ? null
                        : Number(
                            activityForm.cost
                        )
            };

            if (
                activityMode === "edit"
            ) {

                await activityService
                    .updateActivity(
                        selectedActivityId,
                        data
                    );

            } else {

                await activityService
                    .createActivity(data);
            }

            closeActivityModal();

            await loadItinerary();

        } catch (err) {

            console.error(
                "Error saving activity:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Unable to save activity."
            );
        }
    };

    // ==========================================
    // DELETE ACTIVITY
    // ==========================================

    const handleDeleteActivity = async (
        activityId
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this activity?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await activityService
                .deleteActivity(
                    activityId
                );

            await loadItinerary();

        } catch (err) {

            console.error(
                "Error deleting activity:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Unable to delete activity."
            );
        }
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "";
        }

        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    };

    // ==========================================
    // ACTIVITY ICON
    // ==========================================

    const getActivityIcon = (type) => {

        switch (type) {

            case "SIGHTSEEING":
                return "📸";

            case "TRANSPORTATION":
                return "🚆";

            case "ACCOMMODATION":
                return "🏨";

            case "DINING":
                return "🍽️";

            case "ADVENTURE":
                return "🏔️";

            case "SHOPPING":
                return "🛍️";

            default:
                return "📍";
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div style={styles.container}>

                <Sidebar />

                <main style={styles.main}>

                    <div
                        className="glass-card"
                        style={styles.loading}
                    >
                        Loading itinerary...
                    </div>

                </main>

            </div>
        );
    }

    // ==========================================
    // MAIN UI
    // ==========================================

    return (

        <div style={styles.container}>

            <Sidebar />

            <main style={styles.main}>

                {/* HEADER */}

                <div style={styles.header}>

                    <div>

                        <p style={styles.eyebrow}>
                            TRIPNEST PLANNER
                        </p>

                        <h1 style={styles.title}>
                            📅 Itineraries
                        </h1>

                        <p style={styles.subtitle}>
                            Plan your trip day by day
                            and organize every activity.
                        </p>

                    </div>

                    <button
                        className="btn-aurora"
                        onClick={openDayModal}
                    >
                        + Add Day
                    </button>

                </div>

                {/* ERROR */}

                {error && (

                    <div style={styles.error}>
                        ⚠️ {error}
                    </div>

                )}

                {/* EMPTY */}

                {days.length === 0 ? (

                    <div
                        className="glass-card"
                        style={styles.empty}
                    >

                        <div
                            style={
                                styles.emptyIcon
                            }
                        >
                            📅
                        </div>

                        <h2>
                            No itinerary yet
                        </h2>

                        <p>
                            Start planning your
                            trip day by day.
                        </p>

                        <button
                            className="btn-aurora"
                            onClick={
                                openDayModal
                            }
                        >
                            + Create First Day
                        </button>

                    </div>

                ) : (

                    <div>

                        {days.map((day) => (

                            <div
                                key={day.id}
                                className="glass-card"
                                style={
                                    styles.dayCard
                                }
                            >

                                {/* DAY HEADER */}

                                <div
                                    style={
                                        styles.dayHeader
                                    }
                                >

                                    <div>

                                        <span
                                            style={
                                                styles.dayBadge
                                            }
                                        >
                                            DAY {day.day}
                                        </span>

                                        <h2
                                            style={
                                                styles.dayTitle
                                            }
                                        >
                                            {
                                                formatDate(
                                                    day.date
                                                )
                                            }
                                        </h2>

                                        {day.notes && (

                                            <p
                                                style={
                                                    styles.dayNotes
                                                }
                                            >
                                                {day.notes}
                                            </p>

                                        )}

                                    </div>

                                    <button
                                        className="btn-ghost"
                                        onClick={() =>
                                            openAddActivity(
                                                day.id
                                            )
                                        }
                                    >
                                        + Activity
                                    </button>

                                </div>

                                {/* ACTIVITIES */}

                                {day.activities.length ===
                                0 ? (

                                    <div
                                        style={
                                            styles.noActivities
                                        }
                                    >

                                        <span>
                                            📌
                                        </span>

                                        <p>
                                            No activities
                                            planned for
                                            this day.
                                        </p>

                                        <button
                                            className="btn-ghost"
                                            onClick={() =>
                                                openAddActivity(
                                                    day.id
                                                )
                                            }
                                        >
                                            + Add Activity
                                        </button>

                                    </div>

                                ) : (

                                    <div>

                                        {day.activities.map(
                                            (activity) => (

                                                <div
                                                    key={
                                                        activity.id
                                                    }
                                                    style={
                                                        styles.activity
                                                    }
                                                >

                                                    {/* ICON */}

                                                    <div
                                                        style={
                                                            styles.activityIcon
                                                        }
                                                    >
                                                        {
                                                            getActivityIcon(
                                                                activity.type
                                                            )
                                                        }
                                                    </div>

                                                    {/* CONTENT */}

                                                    <div
                                                        style={
                                                            styles.activityContent
                                                        }
                                                    >

                                                        <h3
                                                            style={
                                                                styles.activityTitle
                                                            }
                                                        >
                                                            {
                                                                activity.title
                                                            }
                                                        </h3>

                                                        {activity.location && (

                                                            <p
                                                                style={
                                                                    styles.location
                                                                }
                                                            >
                                                                📍{" "}
                                                                {
                                                                    activity.location
                                                                }
                                                            </p>

                                                        )}

                                                        <div
                                                            style={
                                                                styles.meta
                                                            }
                                                        >

                                                            {activity.startTime && (

                                                                <span>
                                                                    🕒{" "}
                                                                    {
                                                                        activity.startTime
                                                                    }

                                                                    {activity.endTime &&
                                                                        ` - ${activity.endTime}`}
                                                                </span>

                                                            )}

                                                            <span
                                                                style={
                                                                    styles.type
                                                                }
                                                            >
                                                                {
                                                                    activity.type
                                                                }
                                                            </span>

                                                            {activity.cost !==
                                                                null &&
                                                                activity.cost !==
                                                                    undefined && (

                                                                    <span>
                                                                        💰 ₹
                                                                        {Number(
                                                                            activity.cost
                                                                        ).toLocaleString(
                                                                            "en-IN"
                                                                        )}
                                                                    </span>

                                                                )}

                                                        </div>

                                                        {activity.description && (

                                                            <p
                                                                style={
                                                                    styles.description
                                                                }
                                                            >
                                                                {
                                                                    activity.description
                                                                }
                                                            </p>

                                                        )}

                                                    </div>

                                                    {/* ACTIONS */}

                                                    <div
                                                        style={
                                                            styles.actions
                                                        }
                                                    >

                                                        <button
                                                            style={
                                                                styles.editButton
                                                            }
                                                            onClick={() =>
                                                                openEditActivity(
                                                                    day.id,
                                                                    activity
                                                                )
                                                            }
                                                        >
                                                            ✏️
                                                        </button>

                                                        <button
                                                            style={
                                                                styles.deleteButton
                                                            }
                                                            onClick={() =>
                                                                handleDeleteActivity(
                                                                    activity.id
                                                                )
                                                            }
                                                        >
                                                            🗑️
                                                        </button>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                            </div>

                        ))}

                    </div>

                )}

            </main>

            {/* ==================================
                ADD DAY MODAL
            ================================== */}

            {showDayModal && (

                <div
                    style={styles.overlay}
                    onClick={closeDayModal}
                >

                    <div
                        className="glass-card"
                        style={styles.modal}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <h2
                            style={
                                styles.modalTitle
                            }
                        >
                            📅 Add Itinerary Day
                        </h2>

                        <form
                            onSubmit={
                                handleCreateDay
                            }
                        >

                            <label
                                style={
                                    styles.label
                                }
                            >
                                Date
                            </label>

                            <input
                                type="date"
                                name="date"
                                value={
                                    dayForm.date
                                }
                                onChange={
                                    handleDayChange
                                }
                                required
                                style={
                                    styles.input
                                }
                            />

                            <label
                                style={
                                    styles.label
                                }
                            >
                                Notes
                            </label>

                            <textarea
                                name="notes"
                                value={
                                    dayForm.notes
                                }
                                onChange={
                                    handleDayChange
                                }
                                placeholder="What are you planning for this day?"
                                rows="4"
                                style={
                                    styles.textarea
                                }
                            />

                            <div
                                style={
                                    styles.modalActions
                                }
                            >

                                <button
                                    type="button"
                                    style={
                                        styles.cancelButton
                                    }
                                    onClick={
                                        closeDayModal
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn-aurora"
                                >
                                    Create Day
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* ==================================
                ACTIVITY MODAL
            ================================== */}

            {showActivityModal && (

                <div
                    style={styles.overlay}
                    onClick={
                        closeActivityModal
                    }
                >

                    <div
                        className="glass-card"
                        style={
                            styles.activityModal
                        }
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <h2
                            style={
                                styles.modalTitle
                            }
                        >
                            {activityMode === "edit"
                                ? "✏️ Edit Activity"
                                : "✨ Add Activity"}
                        </h2>

                        <form
                            onSubmit={
                                handleSaveActivity
                            }
                        >

                            <div
                                style={
                                    styles.grid
                                }
                            >

                                {/* TITLE */}

                                <div>

                                    <label
                                        style={
                                            styles.label
                                        }
                                    >
                                        Activity Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={
                                            activityForm.title
                                        }
                                        onChange={
                                            handleActivityChange
                                        }
                                        placeholder="Visit Marina Beach"
                                        required
                                        style={
                                            styles.input
                                        }
                                    />

                                </div>

                                {/* TYPE */}

                                <div>

                                    <label
                                        style={
                                            styles.label
                                        }
                                    >
                                        Activity Type
                                    </label>

                                    <select
                                        name="type"
                                        value={
                                            activityForm.type
                                        }
                                        onChange={
                                            handleActivityChange
                                        }
                                        style={
                                            styles.input
                                        }
                                    >

                                        <option value="SIGHTSEEING">
                                            📸 Sightseeing
                                        </option>

                                        <option value="TRANSPORTATION">
                                            🚆 Transportation
                                        </option>

                                        <option value="ACCOMMODATION">
                                            🏨 Accommodation
                                        </option>

                                        <option value="DINING">
                                            🍽️ Dining
                                        </option>

                                        <option value="ADVENTURE">
                                            🏔️ Adventure
                                        </option>

                                        <option value="SHOPPING">
                                            🛍️ Shopping
                                        </option>

                                        <option value="OTHER">
                                            📌 Other
                                        </option>

                                    </select>

                                </div>

                                {/* START TIME */}

                                <div>

                                    <label
                                        style={
                                            styles.label
                                        }
                                    >
                                        Start Time
                                    </label>

                                    <input
                                        type="time"
                                        name="startTime"
                                        value={
                                            activityForm.startTime
                                        }
                                        onChange={
                                            handleActivityChange
                                        }
                                        style={
                                            styles.input
                                        }
                                    />

                                </div>

                                {/* END TIME */}

                                <div>

                                    <label
                                        style={
                                            styles.label
                                        }
                                    >
                                        End Time
                                    </label>

                                    <input
                                        type="time"
                                        name="endTime"
                                        value={
                                            activityForm.endTime
                                        }
                                        onChange={
                                            handleActivityChange
                                        }
                                        style={
                                            styles.input
                                        }
                                    />

                                </div>

                                {/* LOCATION */}

                                <div>

                                    <label
                                        style={
                                            styles.label
                                        }
                                    >
                                        Location
                                    </label>

                                    <input
                                        type="text"
                                        name="location"
                                        value={
                                            activityForm.location
                                        }
                                        onChange={
                                            handleActivityChange
                                        }
                                        placeholder="Chennai"
                                        style={
                                            styles.input
                                        }
                                    />

                                </div>

                                {/* COST */}

                                <div>

                                    <label
                                        style={
                                            styles.label
                                        }
                                    >
                                        Cost
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="cost"
                                        value={
                                            activityForm.cost
                                        }
                                        onChange={
                                            handleActivityChange
                                        }
                                        placeholder="500"
                                        style={
                                            styles.input
                                        }
                                    />

                                </div>

                            </div>

                            {/* DESCRIPTION */}

                            <label
                                style={
                                    styles.label
                                }
                            >
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={
                                    activityForm.description
                                }
                                onChange={
                                    handleActivityChange
                                }
                                placeholder="Describe the activity..."
                                rows="4"
                                style={
                                    styles.textarea
                                }
                            />

                            {/* BUTTONS */}

                            <div
                                style={
                                    styles.modalActions
                                }
                            >

                                <button
                                    type="button"
                                    style={
                                        styles.cancelButton
                                    }
                                    onClick={
                                        closeActivityModal
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn-aurora"
                                >
                                    {activityMode === "edit"
                                        ? "Update Activity"
                                        : "Add Activity"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


// ==========================================
// STYLES
// ==========================================

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

    loading: {
        padding: "50px",
        textAlign: "center",
        color: "#94a3b8"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        gap: "20px"
    },

    eyebrow: {
        color: "#7c3aed",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "1.5px",
        marginBottom: "7px"
    },

    title: {
        color: "#f1f5f9",
        fontSize: "30px",
        fontWeight: "700",
        margin: 0,
        fontFamily:
            "'Space Grotesk', sans-serif"
    },

    subtitle: {
        color: "#94a3b8",
        fontSize: "14px",
        marginTop: "8px"
    },

    error: {
        background:
            "rgba(239,68,68,0.1)",
        border:
            "1px solid rgba(239,68,68,0.3)",
        color: "#fca5a5",
        padding: "13px",
        borderRadius: "9px",
        marginBottom: "20px"
    },

    empty: {
        padding: "70px 30px",
        textAlign: "center",
        color: "#94a3b8"
    },

    emptyIcon: {
        fontSize: "50px",
        marginBottom: "12px"
    },

    dayCard: {
        padding: "24px",
        marginBottom: "20px"
    },

    dayHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        paddingBottom: "18px",
        marginBottom: "18px",
        borderBottom:
            "1px solid rgba(255,255,255,0.08)"
    },

    dayBadge: {
        display: "inline-block",
        background:
            "linear-gradient(135deg,#7c3aed,#06b6d4)",
        color: "#fff",
        fontSize: "10px",
        fontWeight: "800",
        padding: "6px 10px",
        borderRadius: "7px",
        letterSpacing: "1px",
        marginBottom: "8px"
    },

    dayTitle: {
        color: "#f1f5f9",
        fontSize: "20px",
        margin: 0
    },

    dayNotes: {
        color: "#94a3b8",
        fontSize: "13px",
        marginTop: "7px"
    },

    noActivities: {
        padding: "35px",
        textAlign: "center",
        color: "#64748b",
        border:
            "1px dashed rgba(255,255,255,0.1)",
        borderRadius: "12px"
    },

    activity: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "17px",
        marginBottom: "12px",
        borderRadius: "12px",
        background:
            "rgba(255,255,255,0.035)",
        border:
            "1px solid rgba(255,255,255,0.06)"
    },

    activityIcon: {
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background:
            "rgba(124,58,237,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        flexShrink: 0
    },

    activityContent: {
        flex: 1,
        minWidth: 0
    },

    activityTitle: {
        color: "#f1f5f9",
        fontSize: "15px",
        margin: 0
    },

    location: {
        color: "#94a3b8",
        fontSize: "12px",
        marginTop: "5px"
    },

    meta: {
        display: "flex",
        gap: "15px",
        flexWrap: "wrap",
        color: "#22d3ee",
        fontSize: "11px",
        marginTop: "8px"
    },

    type: {
        color: "#a78bfa"
    },

    description: {
        color: "#94a3b8",
        fontSize: "12px",
        lineHeight: "1.5",
        marginTop: "8px"
    },

    actions: {
        display: "flex",
        gap: "7px"
    },

    editButton: {
        background:
            "rgba(124,58,237,0.1)",
        border:
            "1px solid rgba(124,58,237,0.25)",
        borderRadius: "7px",
        padding: "8px 10px",
        cursor: "pointer"
    },

    deleteButton: {
        background:
            "rgba(239,68,68,0.1)",
        border:
            "1px solid rgba(239,68,68,0.25)",
        borderRadius: "7px",
        padding: "8px 10px",
        cursor: "pointer"
    },

    overlay: {
        position: "fixed",
        inset: 0,
        background:
            "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000,
        overflowY: "auto"
    },

    modal: {
        width: "100%",
        maxWidth: "500px",
        padding: "28px"
    },

    activityModal: {
        width: "100%",
        maxWidth: "700px",
        padding: "28px"
    },

    modalTitle: {
        color: "#f1f5f9",
        fontSize: "21px",
        marginBottom: "22px"
    },

    label: {
        display: "block",
        color: "#cbd5e1",
        fontSize: "12px",
        fontWeight: "600",
        marginBottom: "7px"
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "11px 12px",
        marginBottom: "16px",
        borderRadius: "8px",
        border:
            "1px solid rgba(255,255,255,0.1)",
        background: "#111827",
        color: "#f1f5f9",
        outline: "none"
    },

    textarea: {
        width: "100%",
        boxSizing: "border-box",
        padding: "11px 12px",
        marginBottom: "16px",
        borderRadius: "8px",
        border:
            "1px solid rgba(255,255,255,0.1)",
        background: "#111827",
        color: "#f1f5f9",
        outline: "none",
        resize: "vertical"
    },

    grid: {
        display: "grid",
        gridTemplateColumns:
            "1fr 1fr",
        gap: "0 15px"
    },

    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "5px"
    },

    cancelButton: {
        padding: "10px 16px",
        borderRadius: "8px",
        border:
            "1px solid rgba(255,255,255,0.1)",
        background:
            "rgba(255,255,255,0.04)",
        color: "#94a3b8",
        cursor: "pointer"
    }
};

export default Itineraries;