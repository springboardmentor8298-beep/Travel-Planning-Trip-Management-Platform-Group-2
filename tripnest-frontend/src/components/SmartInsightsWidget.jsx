import { useState, useEffect } from "react";
import api from "../api/axios";

const RISK_STYLES = {
  SAFE: {
    ring: "from-emerald-400 to-teal-500",
    badge: "bg-emerald-100 text-emerald-700",
    label: "On Track",
  },
  WARNING: {
    ring: "from-amber-400 to-orange-500",
    badge: "bg-amber-100 text-amber-700",
    label: "Watch Spending",
  },
  CRITICAL: {
    ring: "from-rose-500 to-red-600",
    badge: "bg-red-100 text-red-700",
    label: "Over Budget Risk",
  },
};

export default function SmartInsightsWidget({ tripId, refreshKey }) {
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/trips/${tripId}/insights/budget`)
      .then((res) => setInsights(res.data))
      .catch((err) => setError(err.response?.data?.error || "Insights unavailable"));
  }, [tripId, refreshKey]);

  if (error) {
    return (
      <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-2">🤖 Smart Insights</h2>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  if (!insights) return null;

  const style = RISK_STYLES[insights.riskLevel] || RISK_STYLES.SAFE;
  const gaugePercent = Math.min(100, insights.projectedUtilizationPercent);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl p-6">
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-tr from-emerald-500/30 to-teal-500/10 rounded-full blur-3xl" />
      <div className="relative flex justify-between items-start mb-5">
        <div>
          <h2 className="text-lg font-bold">🤖 Smart Budget Insights</h2>
          <p className="text-xs text-slate-400">AI-driven burn-rate prediction</p>
        </div>
        <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${style.badge}`}>
          {style.label}
        </span>
      </div>

      <div className="relative grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl bg-white/10 p-3">
          <div className="text-2xl font-bold">₹{insights.dailyBurnRate.toFixed(0)}</div>
          <div className="text-[11px] text-slate-400">Daily burn rate</div>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <div className="text-2xl font-bold">₹{insights.projectedTotalSpend.toFixed(0)}</div>
          <div className="text-[11px] text-slate-400">Projected total spend</div>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <div className="text-2xl font-bold">{insights.daysRemaining}</div>
          <div className="text-[11px] text-slate-400">Days remaining</div>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <div className={`text-2xl font-bold ${insights.projectedOverspendAmount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
            {insights.projectedOverspendAmount > 0 ? "+" : ""}₹{insights.projectedOverspendAmount.toFixed(0)}
          </div>
          <div className="text-[11px] text-slate-400">Projected over/under</div>
        </div>
      </div>

      <div className="relative mb-3">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>Projected budget utilization</span>
          <span>{insights.projectedUtilizationPercent.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full rounded-full bg-gradient-to-r ${style.ring}`} style={{ width: `${gaugePercent}%` }} />
        </div>
      </div>

      <p className="relative text-xs text-slate-300 leading-relaxed">{insights.riskMessage}</p>
    </div>
  );
}
