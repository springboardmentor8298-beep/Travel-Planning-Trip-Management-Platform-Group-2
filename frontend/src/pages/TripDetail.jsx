import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { tripApi } from "../api/tripApi";

const emptyItineraryForm = {
  title: "",
  activityDate: "",
  startTime: "",
  endTime: "",
  activityType: "SIGHTSEEING",
  location: "",
  placeAddress: "",
  reminderAt: "",
  notes: "",
};

const emptyExpenseForm = {
  title: "",
  amount: "",
  category: "Food",
  expenseDate: "",
  notes: "",
};

const formatMoney = (value) =>
  `INR ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const activityTypes = [
  ["SIGHTSEEING", "Sightseeing"],
  ["TRANSPORTATION", "Transportation"],
  ["ACCOMMODATION", "Accommodation"],
  ["DINING", "Dining"],
  ["ADVENTURE", "Adventure Activities"],
  ["SHOPPING", "Shopping"],
  ["OTHER", "Other"],
];

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseReport, setExpenseReport] = useState({
    plannedBudget: null,
    totalSpent: 0,
    remainingBudget: null,
    expenseCount: 0,
    categoryTotals: {},
  });
  const [loading, setLoading] = useState(true);
  const [savingItinerary, setSavingItinerary] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState(null);
  const [itineraryForm, setItineraryForm] = useState(emptyItineraryForm);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);

  const loadTripPlanning = () => {
    setLoading(true);
    Promise.all([
      tripApi.getTrip(id),
      tripApi.getItinerary(id),
      tripApi.getExpenses(id),
      tripApi.getExpenseSummary(id),
    ])
      .then(([tripRes, itineraryRes, expensesRes, expenseReportRes]) => {
        setTrip(tripRes.data);
        setItinerary(itineraryRes.data || []);
        setExpenses(expensesRes.data || []);
        setExpenseReport({
          plannedBudget: expenseReportRes.data?.plannedBudget ?? null,
          totalSpent: Number(expenseReportRes.data?.totalSpent) || 0,
          remainingBudget: expenseReportRes.data?.remainingBudget ?? null,
          expenseCount: Number(expenseReportRes.data?.expenseCount) || 0,
          categoryTotals: expenseReportRes.data?.categoryTotals || {},
        });
        setItineraryForm((prev) => ({
          ...prev,
          activityDate: prev.activityDate || tripRes.data.startDate || "",
        }));
        setExpenseForm((prev) => ({
          ...prev,
          expenseDate: prev.expenseDate || tripRes.data.startDate || "",
        }));
      })
      .catch(() => setErrorMsg("Could not load this trip."))
      .finally(() => setLoading(false));
  };

  useEffect(loadTripPlanning, [id]);

  const expenseTotal = useMemo(
    () => Number(expenseReport.totalSpent) || expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0),
    [expenseReport.totalSpent, expenses],
  );

  const remainingBudget = useMemo(() => {
    if (!trip?.budget) return null;
    return Number(trip.budget) - expenseTotal;
  }, [expenseTotal, trip]);

  const itineraryByDay = useMemo(
    () =>
      itinerary.reduce((groups, item) => {
        const day = item.activityDate || "Unscheduled";
        return { ...groups, [day]: [...(groups[day] || []), item] };
      }, {}),
    [itinerary],
  );

  const refreshExpenseReport = async () => {
    const res = await tripApi.getExpenseSummary(id);
    setExpenseReport({
      plannedBudget: res.data?.plannedBudget ?? null,
      totalSpent: Number(res.data?.totalSpent) || 0,
      remainingBudget: res.data?.remainingBudget ?? null,
      expenseCount: Number(res.data?.expenseCount) || 0,
      categoryTotals: res.data?.categoryTotals || {},
    });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteMsg(null);
    try {
      const res = await tripApi.addTraveler(id, inviteEmail);
      setTrip(res.data);
      setInviteMsg({ type: "success", text: "Traveler added to the trip." });
      setInviteEmail("");
    } catch (err) {
      setInviteMsg({
        type: "error",
        text: err.response?.data?.message || "Could not add traveler.",
      });
    }
  };

  const handleItinerarySubmit = async (e) => {
    e.preventDefault();
    setSavingItinerary(true);
    try {
      const payload = {
        ...itineraryForm,
        startTime: itineraryForm.startTime || null,
        endTime: itineraryForm.endTime || null,
        reminderAt: itineraryForm.reminderAt || null,
      };
      const res = await tripApi.addItineraryItem(id, payload);
      setItinerary((prev) =>
        [...prev, res.data].sort((a, b) =>
          `${a.activityDate || ""}${a.startTime || ""}`.localeCompare(
            `${b.activityDate || ""}${b.startTime || ""}`,
          ),
        ),
      );
      setItineraryForm({
        ...emptyItineraryForm,
        activityDate: itineraryForm.activityDate,
      });
    } catch (err) {
      alert(err.response?.data?.message || "Could not add itinerary item.");
    } finally {
      setSavingItinerary(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setSavingExpense(true);
    try {
      const payload = {
        ...expenseForm,
        amount: Number(expenseForm.amount),
      };
      const res = await tripApi.addExpense(id, payload);
      setExpenses((prev) => [res.data, ...prev]);
      await refreshExpenseReport();
      setExpenseForm({
        ...emptyExpenseForm,
        expenseDate: expenseForm.expenseDate,
      });
    } catch (err) {
      alert(err.response?.data?.message || "Could not add expense.");
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDeleteItinerary = async (itemId) => {
    if (!window.confirm("Delete this itinerary item?")) return;
    await tripApi.deleteItineraryItem(id, itemId);
    setItinerary((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    await tripApi.deleteExpense(id, expenseId);
    setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
    await refreshExpenseReport();
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-10 text-slate-500">Loading...</div>;
  }

  if (errorMsg) {
    return <div className="max-w-6xl mx-auto px-4 py-10 text-red-600">{errorMsg}</div>;
  }

  if (!trip) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link to="/trips" className="text-sm text-brand-600 hover:underline mb-4 inline-block">
        Back to trips
      </Link>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{trip.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{trip.destination}</p>
          </div>
          <Link
            to={`/trips/${trip.id}/edit`}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Edit Trip
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Dates</p>
            <p className="text-slate-700 font-medium">
              {trip.startDate} to {trip.endDate}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Status</p>
            <p className="text-slate-700 font-medium">{trip.status}</p>
          </div>
          <div>
            <p className="text-slate-400">Budget</p>
            <p className="text-slate-700 font-medium">
              {trip.budget ? formatMoney(trip.budget) : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Spent</p>
            <p className="text-slate-700 font-medium">{formatMoney(expenseTotal)}</p>
          </div>
          <div>
            <p className="text-slate-400">Remaining</p>
            <p className={`font-medium ${remainingBudget < 0 ? "text-red-600" : "text-slate-700"}`}>
              {remainingBudget === null ? "No budget" : formatMoney(remainingBudget)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Organized by</p>
            <p className="text-slate-700 font-medium">{trip.ownerName}</p>
          </div>
          <div>
            <p className="text-slate-400">Fellow travelers</p>
            <p className="text-slate-700 font-medium">{trip.travelerCount}</p>
          </div>
          <div>
            <p className="text-slate-400">Activities</p>
            <p className="text-slate-700 font-medium">{itinerary.length}</p>
          </div>
        </div>

        {trip.description && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-slate-400 text-sm mb-1">Notes</p>
            <p className="text-slate-600 text-sm whitespace-pre-line">{trip.description}</p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-6">
        <section className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-1">Itinerary Planning</h2>
            <p className="text-sm text-slate-500 mb-5">
              Add day-wise activities, schedule reminders, manage places, and build a travel timeline.
            </p>

            <form onSubmit={handleItinerarySubmit} className="grid sm:grid-cols-2 gap-3 mb-6">
              <input
                required
                value={itineraryForm.title}
                onChange={(e) => setItineraryForm({ ...itineraryForm, title: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Activity title"
              />
              <select
                value={itineraryForm.activityType}
                onChange={(e) => setItineraryForm({ ...itineraryForm, activityType: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {activityTypes.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                required
                value={itineraryForm.activityDate}
                onChange={(e) => setItineraryForm({ ...itineraryForm, activityDate: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="time"
                value={itineraryForm.startTime}
                onChange={(e) => setItineraryForm({ ...itineraryForm, startTime: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="time"
                value={itineraryForm.endTime}
                onChange={(e) => setItineraryForm({ ...itineraryForm, endTime: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                value={itineraryForm.location}
                onChange={(e) => setItineraryForm({ ...itineraryForm, location: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Place name"
              />
              <input
                value={itineraryForm.placeAddress}
                onChange={(e) => setItineraryForm({ ...itineraryForm, placeAddress: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Place address"
              />
              <input
                type="datetime-local"
                value={itineraryForm.reminderAt}
                onChange={(e) => setItineraryForm({ ...itineraryForm, reminderAt: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                title="Reminder time"
              />
              <input
                value={itineraryForm.notes}
                onChange={(e) => setItineraryForm({ ...itineraryForm, notes: e.target.value })}
                className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Notes"
              />
              <button
                type="submit"
                disabled={savingItinerary}
                className="sm:col-span-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-md disabled:opacity-60"
              >
                {savingItinerary ? "Adding..." : "Add Activity"}
              </button>
            </form>

            {itinerary.length === 0 ? (
              <p className="text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg p-6 text-center">
                No itinerary activities yet.
              </p>
            ) : (
              <div className="space-y-5">
                {Object.entries(itineraryByDay).map(([day, items], index) => (
                  <div key={day} className="border-l-2 border-brand-100 pl-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 mb-2">
                      Day {index + 1} - {day}
                    </p>
                    <div className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <div key={item.id} className="py-4 flex gap-4 justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-slate-800">{item.title}</p>
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                                {activityTypes.find(([value]) => value === item.activityType)?.[1] || "Sightseeing"}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                              {item.startTime ? item.startTime : "Any time"}
                              {item.endTime ? ` to ${item.endTime}` : ""}
                            </p>
                            {item.location && <p className="text-sm text-slate-500">{item.location}</p>}
                            {item.placeAddress && <p className="text-sm text-slate-500">{item.placeAddress}</p>}
                            {item.reminderAt && (
                              <p className="text-sm text-amber-700 mt-1">Reminder: {item.reminderAt}</p>
                            )}
                            {item.notes && <p className="text-sm text-slate-600 mt-1">{item.notes}</p>}
                          </div>
                          <button
                            onClick={() => handleDeleteItinerary(item.id)}
                            className="text-sm text-red-600 font-medium hover:underline h-fit"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-1">Budget & Expenses</h2>
            <p className="text-sm text-slate-500 mb-5">
              Track trip spending and compare it with the planned budget.
            </p>

            <form onSubmit={handleExpenseSubmit} className="grid sm:grid-cols-2 gap-3 mb-6">
              <input
                required
                value={expenseForm.title}
                onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Expense title"
              />
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Amount"
              />
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option>Food</option>
                <option>Stay</option>
                <option>Transport</option>
                <option>Tickets</option>
                <option>Shopping</option>
                <option>Other</option>
              </select>
              <input
                type="date"
                required
                value={expenseForm.expenseDate}
                onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Notes"
              />
              <button
                type="submit"
                disabled={savingExpense}
                className="sm:col-span-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-md disabled:opacity-60"
              >
                {savingExpense ? "Adding..." : "Add Expense"}
              </button>
            </form>

            {expenses.length === 0 ? (
              <p className="text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg p-6 text-center">
                No expenses recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <div key={expense.id} className="py-4 flex gap-4 justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{expense.title}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {expense.category} on {expense.expenseDate} by {expense.paidByName}
                      </p>
                      {expense.notes && <p className="text-sm text-slate-600 mt-1">{expense.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{formatMoney(expense.amount)}</p>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-sm text-red-600 font-medium hover:underline mt-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-1">Trip Sharing</h2>
            <p className="text-sm text-slate-500 mb-4">
              Invite a fellow traveler by their TripNest account email.
            </p>

            {inviteMsg && (
              <div
                className={`mb-4 text-sm rounded-md px-3 py-2 border ${
                  inviteMsg.type === "success"
                    ? "text-green-700 bg-green-50 border-green-200"
                    : "text-red-700 bg-red-50 border-red-200"
                }`}
              >
                {inviteMsg.text}
              </div>
            )}

            <form onSubmit={handleInvite} className="grid gap-3">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="traveler@example.com"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md"
              >
                Invite
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4">Budget Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Planned</span>
                <span className="font-medium text-slate-800">
                  {trip.budget ? formatMoney(trip.budget) : "Not set"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Spent</span>
                <span className="font-medium text-slate-800">{formatMoney(expenseTotal)}</span>
              </div>
              <div className="flex justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-slate-500">Remaining</span>
                <span className={`font-semibold ${remainingBudget < 0 ? "text-red-600" : "text-slate-800"}`}>
                  {remainingBudget === null ? "No budget" : formatMoney(remainingBudget)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4">Expense Report</h2>
            {Object.keys(expenseReport.categoryTotals || {}).length === 0 ? (
              <p className="text-sm text-slate-500">No category expenses yet.</p>
            ) : (
              <div className="space-y-3 text-sm">
                {Object.entries(expenseReport.categoryTotals).map(([category, amount]) => (
                  <div key={category} className="flex justify-between gap-3">
                    <span className="text-slate-500">{category}</span>
                    <span className="font-medium text-slate-800">{formatMoney(amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
