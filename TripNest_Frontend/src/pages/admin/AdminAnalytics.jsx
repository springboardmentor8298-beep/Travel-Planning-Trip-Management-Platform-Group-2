import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Luggage, 
  Calendar, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Activity, 
  PieChart, 
  Sparkles,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { getAdminAnalytics } from '../../services/adminService';
import { formatCurrency } from '../../utils/currency';

// CountUp Component for stats number animation
const CountUp = ({ value, isCurrency = false }) => {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    if (end === 0) {
      setDisplayVal(0);
      return;
    }
    const duration = 800; // ms
    const startTime = performance.now();

    function updateNumber(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const ease = progress * (2 - progress);
      const current = start + ease * (end - start);
      setDisplayVal(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayVal(end);
      }
    }

    requestAnimationFrame(updateNumber);
  }, [value]);

  if (isCurrency) {
    return <span>{formatCurrency(displayVal)}</span>;
  }
  return <span>{Math.round(displayVal)}</span>;
};

// Custom SVG Donut Chart Component
const DonutChart = ({ data, size = 200, strokeWidth = 24 }) => {
  const { t } = useTranslation();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0);
  
  let currentOffset = 0;
  
  const segments = data.map((item) => {
    const value = item.value || 0;
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const strokeLength = (percentage / 100) * circumference;
    const strokeOffset = circumference - strokeLength + currentOffset;
    currentOffset -= strokeLength;
    
    return {
      ...item,
      percentage,
      strokeLength,
      strokeOffset
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
      {/* SVG Circle */}
      <div className="relative" style={{ width: size, height: size }}>
        {total === 0 ? (
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
            />
          </svg>
        ) : (
          <svg width={size} height={size} className="transform -rotate-90">
            {segments.map((seg, idx) => (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={seg.strokeOffset}
                className="transition-all duration-500 ease-out"
              />
            ))}
          </svg>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-800 dark:text-white leading-none">
            {total}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">
            {t('analytics.totalTrips', { defaultValue: 'Trips' })}
          </span>
        </div>
      </div>

      {/* Legends */}
      <div className="space-y-3">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <div className="text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                {seg.label}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {seg.value} ({seg.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminAnalytics = ({ setActivePage }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminAnalytics();
      if (response?.data?.success) {
        setData(response.data.data);
      } else {
        setError('Failed to fetch platform metrics');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'API request failed. Unable to fetch analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="h-8 w-8 text-[#0ea5e9] animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Loading platform telemetry & charts...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="p-4 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Telemetry Fetch Failed
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">{error}</p>
        <button 
          onClick={loadAnalytics}
          className="mt-6 px-4 py-2 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="p-4 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          No Data Available
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          There are currently no users or itineraries registered in the platform database.
        </p>
      </div>
    );
  }

  // Clamped budget utilization calculation
  const utilizationPercentage = data.budgetUtilizationPercentage || 0;
  
  // Custom Status chart details
  const statusData = [
    { label: 'ACTIVE', value: data.activeTrips || 0, color: '#10b981' },
    { label: 'UPCOMING', value: data.upcomingTrips || 0, color: '#8b5cf6' },
    { label: 'COMPLETED', value: data.completedTrips || 0, color: '#f43f5e' }
  ];

  // Expense distribution array
  const expenses = data.expenseCategoryDistribution ? Object.keys(data.expenseCategoryDistribution).map(key => ({
    category: key,
    amount: data.expenseCategoryDistribution[key] || 0
  })) : [];
  const totalExpensesSum = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Destination distribution mapping
  const destinations = data.destinationDistribution ? Object.keys(data.destinationDistribution).map(key => ({
    name: key,
    count: data.destinationDistribution[key] || 0
  })).sort((a, b) => b.count - a.count) : [];

  return (
    <div className="space-y-8 pb-12 text-left">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e2dd]/60 dark:border-slate-800/60 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Analytics Studio
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Platform-wide TripNest analytics, financial overview, and telemetry details.
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 self-start md:self-auto px-4 py-2.5 text-xs font-bold rounded-xl border border-[#e5e2dd] bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Trips Stats */}
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Total Trips</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">
              <CountUp value={data.totalTrips} />
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/20 text-sky-500">
            <Luggage className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Active Trips</span>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-500">
              <CountUp value={data.activeTrips} />
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Upcoming Trips</span>
            <h3 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-500">
              <CountUp value={data.upcomingTrips} />
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Completed Trips</span>
            <h3 className="text-3xl font-extrabold text-fuchsia-600 dark:text-fuchsia-500">
              <CountUp value={data.completedTrips} />
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-950/20 text-fuchsia-500">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Finance Stats */}
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Total Allocated Budget</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              <CountUp value={data.totalBudget} isCurrency={true} />
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-500">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Total Platform Spend</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              <CountUp value={data.totalSpent} isCurrency={true} />
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Remaining Capital</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              <CountUp value={data.remainingBudget} isCurrency={true} />
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Estimated Itinerary Cost</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              <CountUp value={data.totalEstimatedItineraryCost} isCurrency={true} />
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/20 text-purple-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 2: Financial Utilization & Expense breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Budget Utilization Ring */}
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
              Budget Utilization
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Percentage of allocated capital spent on platform itineraries.
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6">
            {/* SVG Utilization Circle */}
            <div className="relative w-40 h-40">
              <svg width="160" height="160" className="transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="14"
                  className="dark:stroke-slate-800"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="transparent"
                  stroke="#0ea5e9"
                  strokeWidth="14"
                  strokeDasharray={2 * Math.PI * 64}
                  strokeDashoffset={2 * Math.PI * 64 - (utilizationPercentage / 100) * (2 * Math.PI * 64)}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
                  {utilizationPercentage.toFixed(1)}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  UTILIZED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 w-full text-center">
              <div className="text-left border-r border-slate-100 dark:border-slate-800 pr-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Allocated</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(data.totalBudget || 0)}</p>
              </div>
              <div className="text-right pl-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Spent</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(data.totalSpent || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
              Expense breakdown by Category
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Distribution of expenses registered across all platform budgets.
            </p>
          </div>

          <div className="space-y-4.5 flex-1 flex flex-col justify-center">
            {expenses.length === 0 || totalExpensesSum === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No expense entries registered in database.
              </div>
            ) : (
              expenses.map((exp, idx) => {
                const percent = totalExpensesSum > 0 ? (exp.amount / totalExpensesSum) * 100 : 0;
                let barColor = 'bg-sky-500';
                if (exp.category === 'Transport') barColor = 'bg-amber-500';
                else if (exp.category === 'Lodging' || exp.category === 'Accommodation') barColor = 'bg-emerald-500';
                else if (exp.category === 'Activities') barColor = 'bg-indigo-500';
                else if (exp.category === 'Food') barColor = 'bg-rose-500';
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-350">{exp.category}</span>
                      <span className="text-slate-900 dark:text-white">
                        {formatCurrency(exp.amount)} ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Status Breakdown & Destination Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status breakdown */}
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
              Itinerary Status Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Count of active, upcoming and completed itineraries globally.
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center py-6">
            <DonutChart data={statusData} />
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
              Top Destinations
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Most frequently visited destinations according to platform itineraries.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center divide-y divide-slate-100 dark:divide-slate-800/60">
            {destinations.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No trips destinations registered in database.
              </div>
            ) : (
              destinations.slice(0, 5).map((dest, idx) => (
                <div key={idx} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/20 text-sky-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {dest.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-550 bg-slate-50 dark:bg-slate-950/30 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    {dest.count} {dest.count === 1 ? 'Trip' : 'Trips'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
