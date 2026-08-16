import { useState, useEffect } from "react";
import api from "../api/axios";

const CATEGORIES = ["TRANSPORTATION", "HOTEL", "FOOD", "SHOPPING", "ENTERTAINMENT", "MISCELLANEOUS"];

function ProgressBar({ percent, colorClass }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function barColor(percent) {
  if (percent >= 100) return "bg-gradient-to-r from-rose-500 to-red-600";
  if (percent >= 80) return "bg-gradient-to-r from-amber-400 to-orange-500";
  return "bg-gradient-to-r from-emerald-400 to-teal-500";
}

export default function BudgetWidget({ tripId }) {
  const [budget, setBudget] = useState(null);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [totalBudget, setTotalBudget] = useState("");
  const [allocations, setAllocations] = useState({});

  const load = async () => {
    try {
      const res = await api.get(`/trips/${tripId}/budget`);
      setBudget(res.data);
      setError("");
    } catch (err) {
      setBudget(null);
      setError(err.response?.data?.error || "No budget set yet");
    }
  };

  useEffect(() => { load(); }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e) => {
    e.preventDefault();
    const categoryAllocations = Object.entries(allocations)
      .filter(([, amt]) => amt && Number(amt) > 0)
      .map(([category, allocatedAmount]) => ({ category, allocatedAmount: Number(allocatedAmount) }));

    try {
      await api.put(`/trips/${tripId}/budget`, { totalBudget: Number(totalBudget), categoryAllocations });
      setShowEdit(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save budget");
    }
  };

  const overallPercent = budget ? (budget.totalSpent / budget.totalBudget) * 100 : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-lg p-6">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-emerald-400/30 to-teal-400/20 rounded-full blur-2xl" />
      <div className="relative flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">💰 Budget</h2>
        <button
          onClick={() => setShowEdit(!showEdit)}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition"
        >
          {showEdit ? "Cancel" : budget ? "Edit" : "Set Budget"}
        </button>
      </div>

      {showEdit && (
        <form onSubmit={handleSave} className="relative space-y-3 mb-4 p-4 rounded-xl bg-white/70 border border-slate-200">
          <input
            type="number" placeholder="Total trip budget (₹)"
            value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)}
            className="w-full border border-slate-300 p-2 rounded-lg text-sm" required
          />
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <input
                key={cat} type="number" placeholder={cat.charAt(0) + cat.slice(1).toLowerCase()}
                value={allocations[cat] || ""}
                onChange={(e) => setAllocations((prev) => ({ ...prev, [cat]: e.target.value }))}
                className="border border-slate-300 p-2 rounded-lg text-xs"
              />
            ))}
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 rounded-lg text-sm font-medium">
            Save Budget
          </button>
        </form>
      )}

      {!budget ? (
        <p className="relative text-sm text-slate-500">{error || "No budget set for this trip yet."}</p>
      ) : (
        <div className="relative space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-700">
                ₹{budget.totalSpent.toFixed(0)} of ₹{budget.totalBudget.toFixed(0)}
              </span>
              <span className={`font-semibold ${overallPercent >= 100 ? "text-red-600" : overallPercent >= 80 ? "text-amber-600" : "text-emerald-600"}`}>
                {overallPercent.toFixed(0)}%
              </span>
            </div>
            <ProgressBar percent={overallPercent} colorClass={barColor(overallPercent)} />
          </div>

          {budget.categoryAllocations.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              {budget.categoryAllocations.map((c) => {
                const pct = c.allocatedAmount > 0 ? (c.spentAmount / c.allocatedAmount) * 100 : 0;
                return (
                  <div key={c.category}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>{c.category}</span>
                      <span>₹{c.spentAmount.toFixed(0)} / ₹{c.allocatedAmount.toFixed(0)}</span>
                    </div>
                    <ProgressBar percent={pct} colorClass={barColor(pct)} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
