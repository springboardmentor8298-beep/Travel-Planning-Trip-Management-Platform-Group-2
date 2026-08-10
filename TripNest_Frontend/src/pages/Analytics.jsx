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
  RefreshCw
} from 'lucide-react';
import { getAnalyticsOverview } from '../services/analyticsService';
import { formatCurrency } from '../utils/currency';

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
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedPercent = 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
            {t('analytics.noData', { defaultValue: 'No Data Available' })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {data.map((item, index) => {
            const percentage = item.value / total;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percentage;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                fill="transparent"
                strokeLinecap="round"
                className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                title={`${item.label}: ${item.value}`}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800 dark:text-white">
            {total}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {t('analytics.total', { defaultValue: 'Total' })}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {data.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={index} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-[80px]">
                {item.label}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {item.value} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Analytics = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAnalyticsOverview();
      if (response?.data?.success) {
        setData(response.data.data);
      } else {
        setError(response?.data?.message || t('analytics.failedLoad', { defaultValue: 'Failed to Load Analytics' }));
      }
    } catch (err) {
      console.error('Error fetching analytics overview:', err);
      setError(err?.response?.data?.message || t('analytics.failedLoad', { defaultValue: 'Failed to Load Analytics' }));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="h-8 w-8 text-[#0ea5e9] animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {t('analytics.analyzing', { defaultValue: 'Analyzing database records...' })}
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
          {t('analytics.failedLoad', { defaultValue: 'Failed to Load Analytics' })}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">{error}</p>
        <button 
          onClick={loadAnalytics}
          className="mt-6 px-4 py-2 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-semibold transition-colors"
        >
          {t('analytics.tryAgain', { defaultValue: 'Try Again' })}
        </button>
      </div>
    );
  }

  const kpis = [
    {
      title: t('analytics.totalTrips', { defaultValue: 'Total Trips' }),
      value: data?.totalTrips || 0,
      icon: Luggage,
      colorClass: 'from-blue-500 to-indigo-500 shadow-blue-500/10',
      textClass: 'text-blue-500',
      bgClass: 'bg-blue-50 dark:bg-blue-950/20',
      isCurrency: false
    },
    {
      title: t('analytics.activeTrips', { defaultValue: 'Active Trips' }),
      value: data?.activeTrips || 0,
      icon: Activity,
      colorClass: 'from-emerald-500 to-teal-500 shadow-emerald-500/10',
      textClass: 'text-emerald-500',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/20',
      isCurrency: false
    },
    {
      title: t('analytics.upcomingTrips', { defaultValue: 'Upcoming Trips' }),
      value: data?.upcomingTrips || 0,
      icon: Calendar,
      colorClass: 'from-violet-500 to-purple-500 shadow-violet-500/10',
      textClass: 'text-violet-500',
      bgClass: 'bg-violet-50 dark:bg-violet-950/20',
      isCurrency: false
    },
    {
      title: t('analytics.completedTrips', { defaultValue: 'Completed Trips' }),
      value: data?.completedTrips || 0,
      icon: CheckCircle,
      colorClass: 'from-fuchsia-500 to-pink-500 shadow-fuchsia-500/10',
      textClass: 'text-fuchsia-500',
      bgClass: 'bg-fuchsia-50 dark:bg-fuchsia-950/20',
      isCurrency: false
    },
    {
      title: t('analytics.totalBudget', { defaultValue: 'Total Budget' }),
      value: data?.totalBudget || 0,
      icon: DollarSign,
      colorClass: 'from-amber-500 to-orange-500 shadow-amber-500/10',
      textClass: 'text-amber-500',
      bgClass: 'bg-amber-50 dark:bg-amber-950/20',
      isCurrency: true
    },
    {
      title: t('analytics.totalSpent', { defaultValue: 'Total Spent' }),
      value: data?.totalSpent || 0,
      icon: TrendingUp,
      colorClass: 'from-rose-500 to-red-500 shadow-rose-500/10',
      textClass: 'text-rose-500',
      bgClass: 'bg-rose-50 dark:bg-rose-950/20',
      isCurrency: true
    },
    {
      title: t('analytics.remainingBudget', { defaultValue: 'Remaining Budget' }),
      value: data?.remainingBudget || 0,
      icon: AlertCircle,
      colorClass: 'from-cyan-500 to-sky-500 shadow-cyan-500/10',
      textClass: 'text-cyan-500',
      bgClass: 'bg-cyan-50 dark:bg-cyan-950/20',
      isCurrency: true
    },
    {
      title: t('analytics.itineraryCost', { defaultValue: 'Itinerary Cost (Est.)' }),
      value: data?.estimatedItineraryCost || 0,
      icon: Sparkles,
      colorClass: 'from-teal-500 to-indigo-500 shadow-teal-500/10',
      textClass: 'text-teal-500',
      bgClass: 'bg-teal-50 dark:bg-teal-950/20',
      isCurrency: true
    }
  ];

  // Map trip status distribution to chart structure
  const statusData = [
    { label: t('analytics.active', { defaultValue: 'Active' }), value: data?.tripStatusDistribution?.ACTIVE || 0, color: '#10b981' },
    { label: t('analytics.upcoming', { defaultValue: 'Upcoming' }), value: data?.tripStatusDistribution?.UPCOMING || 0, color: '#8b5cf6' },
    { label: t('analytics.completed', { defaultValue: 'Completed' }), value: data?.tripStatusDistribution?.COMPLETED || 0, color: '#f43f5e' },
    { label: t('analytics.cancelled', { defaultValue: 'Cancelled' }), value: data?.tripStatusDistribution?.CANCELLED || 0, color: '#64748b' }
  ];

  // Map expense category distribution
  const totalSpentVal = data?.totalSpent || 0;
  const expenseCategories = Object.entries(data?.expenseCategoryDistribution || {})
    .map(([cat, amount]) => {
      const percentage = totalSpentVal > 0 ? Math.round((amount / totalSpentVal) * 100) : 0;
      return { category: cat, amount, percentage };
    })
    .sort((a, b) => b.amount - a.amount);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'TRANSPORTATION': return 'bg-blue-500';
      case 'HOTEL': return 'bg-purple-500';
      case 'FOOD': return 'bg-amber-500';
      case 'SHOPPING': return 'bg-pink-500';
      case 'ENTERTAINMENT': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const utilization = data?.budgetUtilization || 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {t('analytics.title', { defaultValue: 'Analytics Studio' })}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t('analytics.subtitle', { defaultValue: 'Real-time insights compiled from your trips, activities, budgets and expenses.' })}
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 self-start md:self-auto px-4 py-2 text-xs font-bold rounded-xl border border-[#e5e2dd] bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t('analytics.refresh', { defaultValue: 'Refresh Stats' })}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between group hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] transition-all"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">
                  {kpi.title}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  <CountUp value={kpi.value} isCurrency={kpi.isCurrency} />
                </h3>
              </div>
              <div className={`p-3.5 rounded-2xl ${kpi.bgClass} ${kpi.textClass} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-6 w-6 stroke-[1.8]" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Budget Utilization Progress Bar & Info */}
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              {t('analytics.budgetUtilization', { defaultValue: 'Budget Utilization' })}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {t('analytics.budgetUtilizationDesc', { defaultValue: 'Percentage of total budget allocated that has been spent.' })}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 my-4">
            {/* Circular Progress Gauge */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background track */}
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="14"
                  fill="transparent"
                />
                {/* Active progress ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  stroke="url(#progressGradient)"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 64}`}
                  strokeDashoffset={`${2 * Math.PI * 64 * (1 - utilization / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
                  {Math.round(utilization)}%
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider">
                  {t('analytics.spent', { defaultValue: 'Spent' })}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">{t('analytics.totalSpent', { defaultValue: 'Total Spent' })}</span>
              <span className="text-slate-800 dark:text-slate-200">{formatCurrency(data?.totalSpent)}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#0ea5e9] h-full rounded-full transition-all duration-1000"
                style={{ width: `${utilization}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>{t('analytics.utilization', { defaultValue: '{{percent}}% utilization', percent: Math.round(utilization) })}</span>
              <span>{t('analytics.limit', { defaultValue: 'Limit: {{value}}', value: formatCurrency(data?.totalBudget) })}</span>
            </div>
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {t('analytics.expenseBreakdown', { defaultValue: 'Expense Breakdown' })}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            {t('analytics.expenseBreakdownDesc', { defaultValue: 'Distribution of expenses across standard categories.' })}
          </p>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {expenseCategories.length === 0 || totalSpentVal === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                <PieChart className="h-8 w-8 mb-2 stroke-[1.5]" />
                {t('analytics.noExpenses', { defaultValue: 'No expenses logged yet.' })}
              </div>
            ) : (
              expenseCategories.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(item.category)}`} />
                      <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wide text-[10px]">
                        {t(`th.${item.category.toLowerCase()}`, { defaultValue: item.category })}
                      </span>
                    </div>
                    <span className="text-slate-800 dark:text-slate-100 font-bold">
                      {formatCurrency(item.amount)} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${getCategoryColor(item.category)}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trip Status Breakdown */}
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              {t('analytics.tripStatusBreakdown', { defaultValue: 'Trip Status Breakdown' })}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {t('analytics.tripStatusBreakdownDesc', { defaultValue: 'Distribution of current, upcoming and historical trips.' })}
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <DonutChart data={statusData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
