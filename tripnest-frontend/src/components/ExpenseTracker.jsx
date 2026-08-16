import { useState, useEffect } from "react";
import api from "../api/axios";

const CATEGORIES = ["TRANSPORTATION", "HOTEL", "FOOD", "SHOPPING", "ENTERTAINMENT", "MISCELLANEOUS"];

const CATEGORY_STYLES = {
  TRANSPORTATION: "bg-blue-100 text-blue-700",
  HOTEL: "bg-purple-100 text-purple-700",
  FOOD: "bg-orange-100 text-orange-700",
  SHOPPING: "bg-pink-100 text-pink-700",
  ENTERTAINMENT: "bg-teal-100 text-teal-700",
  MISCELLANEOUS: "bg-slate-100 text-slate-700",
};

export default function ExpenseTracker({ tripId, onChanged }) {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [category, setCategory] = useState("FOOD");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));

  const load = async () => {
    try {
      const res = await api.get(`/trips/${tripId}/expenses`);
      setExpenses(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load expenses");
    }
  };

  useEffect(() => { load(); }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/trips/${tripId}/expenses`, {
        category, amount: Number(amount), description, expenseDate,
      });
      setAmount(""); setDescription("");
      setShowForm(false);
      load();
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add expense");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      load();
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete expense");
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">🧾 Expenses</h2>
          <p className="text-xs text-slate-500">Total logged: ₹{total.toFixed(0)}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition"
        >
          {showForm ? "Cancel" : "+ Log Expense"}
        </button>
      </div>

      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      {showForm && (
        <form onSubmit={handleAdd} className="space-y-2 mb-4 p-4 rounded-xl bg-white/70 border border-slate-200">
          <div className="flex gap-2">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-slate-300 p-2 rounded-lg text-sm flex-1">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Amount ₹" value={amount} onChange={(e) => setAmount(e.target.value)} className="border border-slate-300 p-2 rounded-lg text-sm w-28" required />
          </div>
          <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-slate-300 p-2 rounded-lg text-sm" />
          <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="w-full border border-slate-300 p-2 rounded-lg text-sm" required />
          <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 rounded-lg text-sm font-medium">
            Add Expense
          </button>
        </form>
      )}

      {expenses.length === 0 ? (
        <p className="text-sm text-slate-500">No expenses logged yet.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {expenses.map((exp) => (
            <div key={exp.id} className="flex justify-between items-center p-3 rounded-xl bg-white/70 border border-slate-100">
              <div>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mr-2 ${CATEGORY_STYLES[exp.category]}`}>
                  {exp.category}
                </span>
                <span className="text-sm text-slate-700">{exp.description || "—"}</span>
                <div className="text-xs text-slate-400">{exp.expenseDate} · paid by {exp.paidByName}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-800">₹{exp.amount.toFixed(0)}</span>
                <button onClick={() => handleDelete(exp.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
