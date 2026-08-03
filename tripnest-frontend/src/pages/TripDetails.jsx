import { useEffect, useState } from "react";

import "../styles/TripDetails.css";

import { useParams } from "react-router-dom";

import { getTripById } from "../services/tripService";

import { getTripImage } from "../utils/tripImage";

import BudgetSummary from "../components/BudgetSummary";

import ExpenseCard from "../components/ExpenseCard";

import ExpenseModal from "../components/ExpenseModal";

import { toast } from "react-toastify";

import {
    getItinerariesByTrip,
    createItinerary
} from "../services/itineraryService";

import {
    getActivitiesByItinerary,
    createActivity,
    updateActivity,
    deleteActivity
} from "../services/activityService";

import {
    getExpensesByTrip,
    createExpense,
    updateExpense,
    deleteExpense
} from "../services/expenseService";

function TripDetails() {

    const { id } = useParams();

    const [trip, setTrip] = useState(null);

    const [itineraries, setItineraries] = useState([]);

    const [activityForm, setActivityForm] = useState({
        title: "",
        location: "",
        startTime: "",
        endTime: "",
        description: ""
    });

    const [formData, setFormData] = useState({
        dayNumber: "",
        date: "",
        notes: ""
    });

    const [selectedItineraryId, setSelectedItineraryId] = useState(null);
    const [editingActivityId, setEditingActivityId] = useState(null);

    const [showDayForm, setShowDayForm] = useState(false);

    const [expenses, setExpenses] = useState([]);

    const [editingExpense, setEditingExpense] = useState(null);

    const [expenseForm, setExpenseForm] = useState({
        title: "",
        amount: "",
        category: "FOOD",
        expenseDate: "",
        notes: ""
    });

    const handleExpenseChange = (event) => {

        const { name, value } = event.target;

        setExpenseForm({

            ...expenseForm,

            [name]: value

        });

    };

    const handleEditExpense = (expense) => {

        setEditingExpense(expense);

        setExpenseForm({

            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            expenseDate: expense.expenseDate,
            notes: expense.notes

        });

        setShowExpenseForm(true);

    };

    const handleDeleteExpense = async (expenseId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this expense?"
        );

        if (!confirmDelete) return;

        try {

            await deleteExpense(expenseId);

            const updatedExpenses = await getExpensesByTrip(id);

            setExpenses(updatedExpenses);

            toast.success("Expense deleted successfully!");

        } catch (error) {

            console.error(error);

            toast.error("Failed to delete expense.");

        }

    };

    const handleExpenseSubmit = async (event) => {

    event.preventDefault();

    try {

        try {

          const expenseData = {

              ...expenseForm,

              trip: {

                  id: Number(id)

              }

          };

          if (editingExpense) {

              await updateExpense(
                  editingExpense.id,
                  expenseData
              );

          } else {

              await createExpense(expenseData);

          }

          const updatedExpenses = await getExpensesByTrip(id);

          setExpenses(updatedExpenses);

          setExpenseForm({

              title: "",

              amount: "",

              category: "FOOD",

              expenseDate: "",

              notes: ""

          });

          setEditingExpense(null);

          setShowExpenseForm(false);

      } catch (error) {

          console.error(error);

          toast.error("Failed to save expense.");

      }

        const expenseData = await getExpensesByTrip(id);

        setExpenses(expenseData);

        setExpenseForm({

            title: "",

            amount: "",

            category: "FOOD",

            expenseDate: "",

            notes: ""

        });

        setShowExpenseForm(false);

    } catch (error) {

        console.error(error);

        toast.error("Failed to add expense.");

    }

};

    const [showExpenseForm, setShowExpenseForm] = useState(false);

   // const [editingExpenseId, setEditingExpenseId] = useState(null);


    useEffect(() => {

        const fetchTrip = async () => {

            try {

                const data = await getTripById(id);

                setTrip(data);

                const expenseData = await getExpensesByTrip(id);

                setExpenses(expenseData);

                const itineraryData = await getItinerariesByTrip(id);

                const itinerariesWithActivities = await Promise.all(

                    itineraryData.map(async (itinerary) => {

                        const activities = await getActivitiesByItinerary(itinerary.id);

                        return {
                            ...itinerary,
                            activities
                        };

                    })

                );

                setItineraries(itinerariesWithActivities);

            } catch (error) {

                console.error(error);

                toast.error("Failed to load trip.");

            }

        };

        fetchTrip();

    }, [id]);

    const handleChange = (event) => {

        setFormData({

            ...formData,

            [event.target.name]: event.target.value

        });

    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            const itineraryData = {

                ...formData,

                dayNumber: Number(formData.dayNumber),

                trip: {
                    id: trip.id
                }

            };

            const newItinerary = await createItinerary(itineraryData);

            setItineraries([...itineraries, newItinerary]);

            setFormData({
                dayNumber: "",
                date: "",
                notes: ""
            });

            setShowDayForm(false);

            toast.success("Itinerary added successfully!");

        } catch (error) {

            console.error(error);

            toast.error("Failed to create itinerary.");

        }

    };

    const handleActivityChange = (e) => {

        setActivityForm({
            ...activityForm,
            [e.target.name]: e.target.value
        });

    };

    const handleActivitySubmit = async (event, itineraryId) => {

    event.preventDefault();

    try {

        const activityData = {

            ...activityForm,

            itinerary: {
                id: itineraryId
            }

        };

        const newActivity = await createActivity(activityData);

        setItineraries(

            itineraries.map((itinerary) =>

                itinerary.id === itineraryId

                    ? {
                        ...itinerary,
                        activities: [...itinerary.activities, newActivity]
                    }

                    : itinerary

            )

        );

        setActivityForm({
            title: "",
            location: "",
            startTime: "",
            endTime: "",
            description: ""
        });

        setSelectedItineraryId(null);

        toast.success("Activity added successfully!");

        

    } catch (error) {

        console.error(error);

        toast.error("Failed to create activity.");

    }
  };

  const handleEditClick = (activity) => {

    setEditingActivityId(activity.id);

    setActivityForm({

        title: activity.title,
        location: activity.location,
        startTime: activity.startTime,
        endTime: activity.endTime,
        description: activity.description

    });

  };

  const handleActivityUpdate = async (event, activityId) => {

    event.preventDefault();

    try {

        const updatedActivity = {

            ...activityForm

        };

        const response = await updateActivity(activityId, updatedActivity);

        setItineraries(

            itineraries.map((itinerary) => ({

                ...itinerary,

                activities: itinerary.activities.map((activity) =>

                    activity.id === activityId

                        ? response

                        : activity

                )

            }))

        );

        setEditingActivityId(null);

        alert("Activity updated successfully!");

    } catch (error) {

        console.error(error);

        toast.error("Failed to update activity.");

    }

  };

  const handleDeleteActivity = async (activityId) => {

    const confirmDelete = window.confirm(
        "Are you sure you want to delete this activity?"
    );

    if (!confirmDelete) return;

    try {

        await deleteActivity(activityId);

        setItineraries(

            itineraries.map((itinerary) => ({

                ...itinerary,

                activities: itinerary.activities.filter(

                    (activity) => activity.id !== activityId

                )

            }))

        );

        toast.success("Activity deleted successfully!");

    } catch (error) {

        console.error(error);

        toast.error("Failed to delete activity.");

    }

  };

  const formatDate = (date) => {

    return new Date(date).toLocaleDateString("en-IN", {

        day: "numeric",
        month: "short",
        year: "numeric"

    });

};

    if (!trip) {

        return <h2>Loading...</h2>;

    }

    const totalSpent = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );

    const remainingBudget = trip
        ? trip.budget - totalSpent
        : 0;

    const budgetPercentage = trip && trip.budget > 0
        ? (totalSpent / trip.budget) * 100
        : 0;

    return (
      <div className="trip-details">
        {/* <h1>{trip.title}</h1>

        <h3>📍 {trip.destination}</h3>

        <p>
          📅 {trip.startDate} - {trip.endDate}
        </p>

        <p>💰 Budget : ₹{trip.budget}</p>

        <p>📝 {trip.description}</p> */}

        <div className="trip-hero">
          <img
            src={getTripImage(trip.destination)}
            alt={trip.destination}
            className="trip-banner"
          />

          <div className="trip-overlay">
            <h1 className="trip-details-title">{trip.title}</h1>
            <div className="trip-info-grid">
              <div className="info-card">
                <span className="info-icon">📍</span>

                <small>Destination</small>

                <h4>{trip.destination}</h4>
              </div>

              <div className="info-card">
                <span className="info-icon">📅</span>

                <small>Duration</small>

                <h4>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </h4>
              </div>

              <div className="info-card">
                <span className="info-icon">💰</span>

                <small>Budget</small>

                <h4>₹{trip.budget.toLocaleString("en-IN")}</h4>
              </div>

              <div className="info-card">
                <span className="info-icon">🟢</span>

                <small>Status</small>

                <h4>
                  <span className={`trip-status ${trip.status.toLowerCase()}`}>
                    {trip.status}
                  </span>
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div className="trip-description">
          <h2>About this Trip</h2>

          <p>{trip.description}</p>
        </div>

        <BudgetSummary

            budget={trip.budget}

            totalSpent={totalSpent}

            remainingBudget={remainingBudget}

            budgetPercentage={budgetPercentage}

        />

        <div className="expense-section">
          <div className="expense-header">

            <h2>💰 Expenses</h2>

            <button
                className="add-expense-btn"
                onClick={() => setShowExpenseForm(true)}
            >
                + Add Expense
            </button>

        </div>

          {expenses.length === 0 ? (
            <div className="no-expense">

              <div className="empty-expense">

                  <h3>💸 No Expenses Yet</h3>

                  <p>

                      Start tracking your trip expenses.

                  </p>

              </div>
              

          </div>
          ) : (
            expenses.map((expense) => (

              <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={handleEditExpense}
                  onDelete={handleDeleteExpense}
              />

          ))
          )}
        </div>

        <ExpenseModal
            showExpenseForm={showExpenseForm}
            setShowExpenseForm={setShowExpenseForm}
            expenseForm={expenseForm}
            handleExpenseChange={handleExpenseChange}
            handleExpenseSubmit={handleExpenseSubmit}
            editingExpense={editingExpense}
            editingExpense={editingExpense}

            setEditingExpense={setEditingExpense}
        />

        {!showDayForm ? (
          <div
            className="add-day-placeholder"
            onClick={() => setShowDayForm(true)}
          >
            <span className="plus-icon">＋</span>

            <h3>Add New Day</h3>

            <p>Create a new itinerary day for your trip</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="add-day-card">
              <h2>➕ Add New Day</h2>
              <div className="form-group">
                <label>Day Number</label>
                <input
                  type="number"
                  name="dayNumber"
                  placeholder="Day Number"
                  value={formData.dayNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Date</label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  placeholder="Notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button type="submit" className="save-day-btn">
              Save Day
            </button>

            <button
              type="button"
              className="cancel-day-btn"
              onClick={() => setShowDayForm(false)}
            >
              {" "}
              Cancel
            </button>
          </form>
        )}

        <h2>Itinerary</h2>

        {itineraries.length > 0 ? (
          itineraries.map((itinerary) => (
            <div key={itinerary.id} className="itinerary-card">
              <div className="day-header">
                <div>
                  <h3>Day {itinerary.dayNumber}</h3>
                  <span>{formatDate(itinerary.date)}</span>
                </div>

                <div className="day-badge">📅 Day {itinerary.dayNumber}</div>
              </div>

              <p className="day-notes">📝 {itinerary.notes}</p>

              <h4>Activities</h4>

              {itinerary.activities.length === 0 ? (
                <p>No activities yet.</p>
              ) : (
                itinerary.activities.map((activity) => (
                  <div key={activity.id} className="activity-card">
                    {editingActivityId === activity.id ? (
                      <form
                        className="activity-form"
                        onSubmit={(e) => handleActivityUpdate(e, activity.id)}
                      >
                        <div className="form-group">
                          <label>Activity Title</label>

                          <input
                            type="text"
                            name="title"
                            value={activityForm.title}
                            onChange={handleActivityChange}
                          />
                        </div>

                        <div className="form-group">
                          <label>Location</label>

                          <input
                            type="text"
                            name="location"
                            value={activityForm.location}
                            onChange={handleActivityChange}
                          />
                        </div>

                        <div className="time-row">
                          <div className="form-group">
                            <label>Start Time</label>

                            <input
                              type="time"
                              name="startTime"
                              value={activityForm.startTime}
                              onChange={handleActivityChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>End Time</label>

                            <input
                              type="time"
                              name="endTime"
                              value={activityForm.endTime}
                              onChange={handleActivityChange}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Description</label>

                          <textarea
                            name="description"
                            value={activityForm.description}
                            onChange={handleActivityChange}
                          />
                        </div>

                        <div className="activity-form-buttons">
                          <button type="submit" className="save-activity-btn">
                            💾 Update Activity
                          </button>

                          <button
                            type="button"
                            className="cancel-activity-btn"
                            onClick={() => setEditingActivityId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="activity-top">
                          <h5>{activity.title}</h5>

                          <span>
                            {activity.startTime} - {activity.endTime}
                          </span>
                        </div>

                        <p>📍 {activity.location}</p>

                        <p className="activity-description">
                          {activity.description}
                        </p>

                        <div className="activity-actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditClick(activity)}
                          >
                            ✏ Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteActivity(activity.id)}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}

              <button
                className="show-activity-btn"
                onClick={() => setSelectedItineraryId(itinerary.id)}
              >
                ➕ Add Activity
              </button>

              {selectedItineraryId === itinerary.id && (
                <form
                  className="activity-form"
                  onSubmit={(e) => handleActivitySubmit(e, itinerary.id)}
                >
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Title"
                      value={activityForm.title}
                      onChange={handleActivityChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>

                    <input
                      type="text"
                      name="location"
                      placeholder="Location"
                      value={activityForm.location}
                      onChange={handleActivityChange}
                    />
                  </div>

                  <div className="time-row">
                    <div className="form-group">
                      <label>Start Time</label>
                      <input
                        type="time"
                        name="startTime"
                        value={activityForm.startTime}
                        onChange={handleActivityChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={activityForm.endTime}
                        onChange={handleActivityChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={activityForm.description}
                      onChange={handleActivityChange}
                    />
                  </div>

                  <div className="activity-form-buttons">
                    <button type="submit" className="save-activity-btn">
                      💾 Save
                    </button>

                    <button
                      type="button"
                      className="cancel-activity-btn"
                      onClick={() => setSelectedItineraryId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))
        ) : (
          <p>No itinerary added yet.</p>
        )}
      </div>
    );

}

export default TripDetails;