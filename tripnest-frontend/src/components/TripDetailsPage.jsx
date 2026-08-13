import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/TripPlan.css";

function TripDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [trip, setTrip] = useState(null);
    const [itineraries, setItineraries] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("itinerary");

    // Itinerary Form State
    const [newItinerary, setNewItinerary] = useState({
        day: "Day 1",
        timeSlot: "Morning",
        activity: "",
    });

    // Expense Form State
    const [newExpense, setNewExpense] = useState({
        expenseName: "",
        amount: "",
        category: "Accommodation",
    });

    // Collaborator Invite State
    const [inviteEmail, setInviteEmail] = useState("");

    useEffect(() => {
        fetchTripDetails();
    }, [id]);

    const fetchTripDetails = async () => {
        try {
            setLoading(true);
            const tripRes = await API.get(`/trips/${id}`);
            setTrip(tripRes.data);

            const itinRes = await API.get(`/itinerary/trip/${id}`);
            setItineraries(itinRes.data || []);

            const expRes = await API.get(`/expense/trip/${id}`);
            setExpenses(expRes.data || []);
        } catch (error) {
            console.error("Error loading trip details:", error);
            alert("Could not load trip details.");
        } finally {
            setLoading(false);
        }
    };

    const handleInviteCollaborator = async (e) => {
        e.preventDefault();
        if (!inviteEmail || !inviteEmail.trim()) {
            alert("Please enter a valid email address!");
            return;
        }

        try {
            const res = await API.post(`/trips/${id}/collaborators/invite`, {
                email: inviteEmail.trim(),
            });
            setTrip(res.data);
            setInviteEmail("");
            alert("👥 Co-traveler invited successfully!");
        } catch (error) {
            console.error("Invite Collaborator Error:", error);
            alert("Failed to invite collaborator.");
        }
    };

    const handleRemoveCollaborator = async (email) => {
        if (!window.confirm(`Remove ${email} from this trip group?`)) return;

        try {
            const res = await API.delete(`/trips/${id}/collaborators/remove?email=${encodeURIComponent(email)}`);
            setTrip(res.data);
            alert("Collaborator removed successfully.");
        } catch (error) {
            console.error("Remove Collaborator Error:", error);
            alert("Failed to remove collaborator.");
        }
    };

    const handleAddItinerary = async (e) => {
        e.preventDefault();
        if (!newItinerary.activity) {
            alert("Please enter activity details!");
            return;
        }

        try {
            const res = await API.post(`/itinerary/trip/${id}`, newItinerary);
            setItineraries([...itineraries, res.data]);
            setNewItinerary({ day: "Day 1", timeSlot: "Morning", activity: "" });
            alert("✅ Activity added to Itinerary!");
        } catch (error) {
            console.error("Add Itinerary Error:", error);
            alert("Failed to add itinerary activity.");
        }
    };

    const handleDeleteItinerary = async (itinId) => {
        try {
            await API.delete(`/itinerary/delete/${itinId}`);
            setItineraries(itineraries.filter((item) => item.id !== itinId));
        } catch (error) {
            console.error("Delete Itinerary Error:", error);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!newExpense.expenseName || !newExpense.amount) {
            alert("Please enter expense name and valid amount!");
            return;
        }

        try {
            const payload = {
                ...newExpense,
                amount: parseFloat(newExpense.amount),
            };
            const res = await API.post(`/expense/trip/${id}`, payload);
            setExpenses([...expenses, res.data]);
            setNewExpense({ expenseName: "", amount: "", category: "Accommodation" });
            alert("💵 Expense logged successfully!");
        } catch (error) {
            console.error("Add Expense Error:", error);
            alert("Failed to log expense.");
        }
    };

    const handleDeleteExpense = async (expId) => {
        try {
            await API.delete(`/expense/delete/${expId}`);
            setExpenses(expenses.filter((item) => item.id !== expId));
        } catch (error) {
            console.error("Delete Expense Error:", error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const budgetRemaining = (trip?.budget || 0) - totalSpent;
    const isOverBudget = budgetRemaining < 0;

    // Expense category breakdown logic
    const categoryTotals = expenses.reduce((acc, exp) => {
        const cat = exp.category || "Other";
        acc[cat] = (acc[cat] || 0) + (exp.amount || 0);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <div className="container text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="mt-2">Loading trip details...</p>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <div className="container text-center py-5">
                    <h3>Trip Not Found</h3>
                    <button className="btn btn-primary mt-3" onClick={() => navigate("/my-trips")}>
                        Back to My Trips
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <Navbar />

            <div className="container py-5">
                {/* Budget Warning Banner if over budget */}
                {isOverBudget && (
                    <div className="alert alert-danger alert-dismissible fade show rounded-4 shadow-sm mb-4" role="alert">
                        <div className="d-flex align-items-center gap-2">
                            <span className="fs-3">⚠️</span>
                            <div>
                                <h5 className="alert-heading fw-bold mb-1">Over Budget Warning!</h5>
                                <p className="mb-0">
                                    Your total expenses of <strong>₹{totalSpent.toLocaleString()}</strong> have exceeded your budget allocation of <strong>₹{trip.budget?.toLocaleString()}</strong> by <strong>₹{Math.abs(budgetRemaining).toLocaleString()}</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Trip Banner Card */}
                <div className="trip-banner-card mb-4 p-4 rounded-4 shadow-lg text-white">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div>
                            <span className="badge bg-light text-dark mb-2 fs-6">Trip # {trip.id}</span>
                            <h1 className="fw-bold display-5">{trip.destination}</h1>
                            <p className="lead mb-2">From: <strong>{trip.fromLocation}</strong></p>
                            <p className="mb-0">
                                📅 <strong>{trip.startDate}</strong> to <strong>{trip.endDate}</strong> | 👥 <strong>{trip.travellers} Travellers</strong> | 👑 <strong>Owner: {trip.user?.email || "You"}</strong>
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-warning text-dark fw-bold" onClick={handlePrint}>
                                🖨️ Export Summary
                            </button>
                            <button className="btn btn-light" onClick={() => navigate("/my-trips")}>
                                ⬅️ Back to My Trips
                            </button>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="row g-3 mt-4 pt-3 border-top border-white-50">
                        <div className="col-md-4">
                            <div className="stat-box p-3 rounded-3 bg-white bg-opacity-10 text-white">
                                <small className="text-uppercase text-white-50">Allocated Budget</small>
                                <h3>₹{trip.budget?.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-box p-3 rounded-3 bg-white bg-opacity-10 text-white">
                                <small className="text-uppercase text-white-50">Total Expenses Logged</small>
                                <h3>₹{totalSpent.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-box p-3 rounded-3 bg-white bg-opacity-10 text-white">
                                <small className="text-uppercase text-white-50">Remaining Budget</small>
                                <h3 className={budgetRemaining < 0 ? "text-warning fw-bold" : "text-white"}>
                                    ₹{budgetRemaining.toLocaleString()}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="d-flex gap-2 mb-4 flex-wrap">
                    <button
                        className={`btn btn-lg ${activeTab === "itinerary" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setActiveTab("itinerary")}
                    >
                        🗓️ Day-by-Day Itinerary ({itineraries.length})
                    </button>
                    <button
                        className={`btn btn-lg ${activeTab === "expense" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setActiveTab("expense")}
                    >
                        💳 Expenses & Analytics ({expenses.length})
                    </button>
                    <button
                        className={`btn btn-lg ${activeTab === "collaborators" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setActiveTab("collaborators")}
                    >
                        👥 Group Collaborators ({trip.collaboratorEmails?.length || 0})
                    </button>
                </div>

                {/* Tab 1: Itinerary */}
                {activeTab === "itinerary" && (
                    <div className="row g-4">
                        <div className="col-lg-5">
                            <div className="card shadow-sm border-0 p-4 rounded-3">
                                <h3>➕ Add Itinerary Activity</h3>
                                <form onSubmit={handleAddItinerary} className="mt-3">
                                    <div className="mb-3">
                                        <label className="form-label">Select Day</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Day 1, Day 2..."
                                            value={newItinerary.day}
                                            onChange={(e) => setNewItinerary({ ...newItinerary, day: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Time Slot</label>
                                        <select
                                            className="form-select"
                                            value={newItinerary.timeSlot}
                                            onChange={(e) => setNewItinerary({ ...newItinerary, timeSlot: e.target.value })}
                                        >
                                            <option value="Morning">Morning 🌅</option>
                                            <option value="Afternoon">Afternoon ☀️</option>
                                            <option value="Evening">Evening 🌆</option>
                                            <option value="Night">Night 🌙</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Activity Details</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="e.g. Visit Baga Beach & Scuba Diving"
                                            value={newItinerary.activity}
                                            onChange={(e) => setNewItinerary({ ...newItinerary, activity: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-success w-100 btn-lg">
                                        📌 Add Activity
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="card shadow-sm border-0 p-4 rounded-3">
                                <h3>🗺️ Scheduled Activities</h3>
                                {itineraries.length === 0 ? (
                                    <p className="text-muted mt-3">No itinerary activities planned yet. Use the form to add activities.</p>
                                ) : (
                                    <div className="timeline mt-3">
                                        {itineraries.map((item) => (
                                            <div key={item.id} className="timeline-item p-3 mb-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="badge bg-primary me-2">{item.day}</span>
                                                    <span className="badge bg-secondary me-2">{item.timeSlot}</span>
                                                    <p className="mb-0 mt-2 fs-6">{item.activity}</p>
                                                </div>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItinerary(item.id)}>
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Expenses & Category Analytics */}
                {activeTab === "expense" && (
                    <div className="row g-4">
                        <div className="col-lg-5">
                            <div className="card shadow-sm border-0 p-4 rounded-3 mb-4">
                                <h3>➕ Add New Expense</h3>
                                <form onSubmit={handleAddExpense} className="mt-3">
                                    <div className="mb-3">
                                        <label className="form-label">Expense Description</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Hotel Stay Payment"
                                            value={newExpense.expenseName}
                                            onChange={(e) => setNewExpense({ ...newExpense, expenseName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="e.g. 5000"
                                            value={newExpense.amount}
                                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Category</label>
                                        <select
                                            className="form-select"
                                            value={newExpense.category}
                                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                        >
                                            <option value="Accommodation">🏨 Accommodation</option>
                                            <option value="Food & Dining">🍲 Food & Dining</option>
                                            <option value="Transportation">🚕 Transportation</option>
                                            <option value="Activities">🏄 Activities & Entry Tickets</option>
                                            <option value="Shopping">🛍️ Shopping</option>
                                            <option value="Other">📦 Other</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-success w-100 btn-lg">
                                        💵 Log Expense
                                    </button>
                                </form>
                            </div>

                            {/* Category Analytics */}
                            <div className="card shadow-sm border-0 p-4 rounded-3">
                                <h4 className="fw-bold mb-3">📈 Category Analytics</h4>
                                {Object.keys(categoryTotals).length === 0 ? (
                                    <p className="text-muted small mb-0">No expense categories yet.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {Object.entries(categoryTotals).map(([cat, amt]) => {
                                            const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
                                            return (
                                                <div key={cat}>
                                                    <div className="d-flex justify-content-between small mb-1">
                                                        <span className="fw-bold">{cat}</span>
                                                        <span>₹{amt.toLocaleString()} ({pct}%)</span>
                                                    </div>
                                                    <div className="progress" style={{ height: "8px" }}>
                                                        <div
                                                            className="progress-bar bg-primary"
                                                            role="progressbar"
                                                            style={{ width: `${pct}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="card shadow-sm border-0 p-4 rounded-3">
                                <h3>📊 Expense Ledger</h3>
                                {expenses.length === 0 ? (
                                    <p className="text-muted mt-3">No expenses logged yet.</p>
                                ) : (
                                    <div className="table-responsive mt-3">
                                        <table className="table table-hover align-middle">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>Category</th>
                                                    <th>Description</th>
                                                    <th>Amount</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expenses.map((exp) => (
                                                    <tr key={exp.id}>
                                                        <td><span className="badge bg-info text-dark">{exp.category || "General"}</span></td>
                                                        <td>{exp.expenseName}</td>
                                                        <td className="fw-bold">₹{exp.amount?.toLocaleString()}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteExpense(exp.id)}>
                                                                🗑️
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 3: Group Collaborators */}
                {activeTab === "collaborators" && (
                    <div className="row g-4">
                        <div className="col-lg-5">
                            <div className="card shadow-sm border-0 p-4 rounded-3">
                                <h3>👥 Invite Co-Traveler</h3>
                                <p className="text-muted small">
                                    Invite friends and family by email to collaborate, view itineraries, and log expenses for this trip.
                                </p>
                                <form onSubmit={handleInviteCollaborator} className="mt-3">
                                    <div className="mb-3">
                                        <label className="form-label">Co-Traveler Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="e.g. friend@example.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 btn-lg">
                                        📩 Send Group Invitation
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="card shadow-sm border-0 p-4 rounded-3">
                                <h3>🌍 Trip Group Members</h3>
                                <div className="mt-3">
                                    {/* Trip Owner */}
                                    <div className="p-3 mb-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="fs-3">👑</span>
                                            <div>
                                                <span className="badge bg-warning text-dark mb-1">Trip Owner</span>
                                                <p className="mb-0 fw-bold">{trip.user?.email || "Owner"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Collaborators List */}
                                    {(!trip.collaboratorEmails || trip.collaboratorEmails.length === 0) ? (
                                        <p className="text-muted">No co-travelers invited yet. Use the invitation form to add group members.</p>
                                    ) : (
                                        trip.collaboratorEmails.map((email, idx) => (
                                            <div key={idx} className="p-3 mb-2 border rounded-3 bg-white d-flex justify-content-between align-items-center shadow-sm">
                                                <div className="d-flex align-items-center gap-3">
                                                    <span className="fs-3">👤</span>
                                                    <div>
                                                        <span className="badge bg-info text-dark mb-1">Co-Traveler</span>
                                                        <p className="mb-0 fw-bold">{email}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Remove member"
                                                    onClick={() => handleRemoveCollaborator(email)}
                                                >
                                                    ❌ Remove
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default TripDetailsPage;
