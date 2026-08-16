import { useState, useEffect } from "react";
import api from "../api/axios";

export default function SettlementWidget({ tripId, refreshKey }) {
  const [settlement, setSettlement] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/trips/${tripId}/insights/settlement`)
      .then((res) => setSettlement(res.data))
      .catch((err) => setError(err.response?.data?.error || "Settlement unavailable"));
  }, [tripId, refreshKey]);

  if (error) {
    return (
      <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-2">🤝 Who Owes Whom</h2>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  if (!settlement) return null;

  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-1">🤝 Who Owes Whom</h2>
      <p className="text-xs text-slate-500 mb-4">
        Fair share: ₹{settlement.fairSharePerMember.toFixed(0)} per person · {settlement.memberCount} members
      </p>

      <div className="space-y-2 mb-4">
        {settlement.balances.map((b) => (
          <div key={b.email} className="flex justify-between items-center text-sm p-2 rounded-lg bg-white/70">
            <span className="text-slate-700">{b.fullName}</span>
            <span className={`font-semibold ${b.netBalance > 0 ? "text-emerald-600" : b.netBalance < 0 ? "text-rose-600" : "text-slate-400"}`}>
              {b.netBalance > 0 ? `is owed ₹${b.netBalance.toFixed(0)}` : b.netBalance < 0 ? `owes ₹${Math.abs(b.netBalance).toFixed(0)}` : "settled"}
            </span>
          </div>
        ))}
      </div>

      {settlement.transactions.length === 0 ? (
        <p className="text-sm text-emerald-600 font-medium">✅ Everyone is settled up!</p>
      ) : (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Minimal transactions to settle
          </h3>
          <div className="space-y-2">
            {settlement.transactions.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                <span className="font-medium text-slate-700">{t.fromName}</span>
                <span className="text-emerald-400">→</span>
                <span className="font-medium text-slate-700">{t.toName}</span>
                <span className="ml-auto font-bold text-emerald-600">₹{t.amount.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
