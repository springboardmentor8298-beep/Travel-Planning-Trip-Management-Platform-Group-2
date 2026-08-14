import React, { useEffect, useState } from 'react';
import { getTripSplits } from '../services/trip.service';
import { Users, CreditCard, ArrowRight, ArrowLeftRight, CheckCircle2, Wallet, Check } from 'lucide-react';

const ExpenseSplits = ({ tripId }) => {
  const [splitData, setSplitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settling, setSettling] = useState(null);
  const [settledHistory, setSettledHistory] = useState([]);

  useEffect(() => {
    fetchSplits();
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSplits = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTripSplits(tripId);
      setSplitData(data);
    } catch (err) {
      console.error('Failed to load expense splits:', err);
      setError('Could not calculate expense splits.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = (settlement) => {
    setSettling(settlement);
    // Simulate instantaneous settlement
    setTimeout(() => {
      setSettledHistory(prev => [...prev, `${settlement.fromFullName} paid ₹${settlement.amount} to ${settlement.toFullName}`]);
      setSettling(null);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Calculating group expense splits and balances...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
        {error}
      </div>
    );
  }

  if (!splitData) return null;

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet size={14} className="text-slate-400" />
            <span>Total Trip Spent</span>
          </span>
          <span className="text-2xl font-black text-white mt-1 block">₹{splitData.totalTripSpent?.toLocaleString() || '0'}</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users size={14} className="text-slate-400" />
            <span>Group Members</span>
          </span>
          <span className="text-2xl font-black text-white mt-1 block">{splitData.totalMembers} Travelers</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-5">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard size={14} className="text-emerald-400" />
            <span>Equal Share / Person</span>
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">₹{splitData.equalSharePerMember?.toLocaleString() || '0'}</span>
        </div>
      </div>

      {/* Member Balances Table */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users size={18} className="text-indigo-400" />
          <span>Individual Member Balances</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/60 text-slate-400 border-b border-slate-700/60">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Total Paid</th>
                <th className="py-3 px-4">Share</th>
                <th className="py-3 px-4">Net Balance</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {splitData.memberBalances?.map((m) => (
                <tr key={m.userId} className="hover:bg-slate-700/20">
                  <td className="py-3 px-4 font-semibold text-white">
                    {m.fullName} <span className="text-xs text-slate-400">(@{m.username})</span>
                  </td>
                  <td className="py-3 px-4">₹{m.totalPaid?.toLocaleString()}</td>
                  <td className="py-3 px-4">₹{splitData.equalSharePerMember?.toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold">
                    <span className={m.netBalance > 0 ? 'text-emerald-400' : m.netBalance < 0 ? 'text-rose-400' : 'text-slate-400'}>
                      {m.netBalance > 0 ? `+₹${m.netBalance?.toLocaleString()}` : m.netBalance < 0 ? `-₹${Math.abs(m.netBalance)?.toLocaleString()}` : '₹0'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {m.status === 'GETS_BACK' && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Gets Back
                      </span>
                    )}
                    {m.status === 'OWES' && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Owes
                      </span>
                    )}
                    {m.status === 'SETTLED' && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-700 text-slate-300">
                        Settled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggested Settlement Transactions (Splitwise style) */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <ArrowLeftRight size={18} className="text-emerald-400" />
          <span>Suggested Debt Settlements</span>
        </h4>
        <p className="text-xs text-slate-400 mb-5">
          Calculated using the minimal transfer graph algorithm to resolve all debts with fewest transactions.
        </p>

        {splitData.suggestedSettlements?.length === 0 ? (
          <div className="text-center py-6 text-emerald-400 font-medium bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2">
            <CheckCircle2 size={18} />
            <span>All trip expenses are completely settled! No payments required.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {splitData.suggestedSettlements?.map((s, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="text-rose-400 font-bold">{s.fromFullName}</span>
                    <ArrowRight size={14} className="text-slate-400" />
                    <span className="text-emerald-400 font-bold">{s.toFullName}</span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">To settle outstanding balance</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-white">₹{s.amount?.toLocaleString()}</span>
                  <button
                    onClick={() => handleSettle(s)}
                    disabled={settling === s}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    {settling === s ? (
                      <span className="spinner" style={{ width: '12px', height: '12px' }}></span>
                    ) : (
                      <>
                        <Check size={13} />
                        <span>Settle</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {settledHistory.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-700/60">
            <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>Recent Settlements (Session)</span>
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {settledHistory.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseSplits;
