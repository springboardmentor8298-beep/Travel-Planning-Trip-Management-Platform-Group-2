import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Luggage, 
  Activity, 
  Calendar, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  RefreshCw, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { getAdminDashboard } from '../../services/adminService';
import { formatCurrency } from '../../utils/currency';

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
            No Data Available
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
            Total Trips
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {data.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={index} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-[100px]">
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

const AdminDashboard = ({ setActivePage }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    activeTrips: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalBudget: 0,
    totalExpenses: 0,
    totalDocuments: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminDashboard();
      if (response?.data?.success) {
        setStats(response.data.data);
      } else {
        setError(response?.data?.message || 'Failed to load admin stats');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to connect to admin dashboard API');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="h-8 w-8 text-[#0ea5e9] animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Loading platform dashboard metrics...
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
          Access Denied or Error Occurred
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">{error}</p>
        <button 
          onClick={loadStats}
          className="mt-6 px-4 py-2 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-semibold transition-colors animate-pulse"
        >
          Try Again
        </button>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Registered Users',
      value: stats.totalUsers,
      icon: Users,
      bgClass: 'bg-blue-50 dark:bg-blue-950/20',
      textClass: 'text-blue-500',
      isCurrency: false,
      onClick: () => setActivePage('admin-users')
    },
    {
      title: 'Total Platform Trips',
      value: stats.totalTrips,
      icon: Luggage,
      bgClass: 'bg-indigo-50 dark:bg-indigo-950/20',
      textClass: 'text-indigo-500',
      isCurrency: false,
      onClick: () => setActivePage('admin-trips')
    },
    {
      title: 'Active Trips Now',
      value: stats.activeTrips,
      icon: Activity,
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/20',
      textClass: 'text-emerald-500',
      isCurrency: false,
      onClick: () => setActivePage('admin-trips')
    },
    {
      title: 'Upcoming Trips',
      value: stats.upcomingTrips,
      icon: Calendar,
      bgClass: 'bg-violet-50 dark:bg-violet-950/20',
      textClass: 'text-violet-500',
      isCurrency: false,
      onClick: () => setActivePage('admin-trips')
    },
    {
      title: 'Completed Trips',
      value: stats.completedTrips,
      icon: CheckCircle,
      bgClass: 'bg-fuchsia-50 dark:bg-fuchsia-950/20',
      textClass: 'text-fuchsia-500',
      isCurrency: false,
      onClick: () => setActivePage('admin-trips')
    },
    {
      title: 'Total Budget Allocated',
      value: stats.totalBudget,
      icon: DollarSign,
      bgClass: 'bg-amber-50 dark:bg-amber-950/20',
      textClass: 'text-amber-500',
      isCurrency: true
    },
    {
      title: 'Total Platform Expenses',
      value: stats.totalExpenses,
      icon: TrendingUp,
      bgClass: 'bg-rose-50 dark:bg-rose-950/20',
      textClass: 'text-rose-500',
      isCurrency: true
    },
    {
      title: 'Travel Documents Uploaded',
      value: stats.totalDocuments,
      icon: FileText,
      bgClass: 'bg-cyan-50 dark:bg-cyan-950/20',
      textClass: 'text-cyan-500',
      isCurrency: false
    }
  ];

  const statusData = [
    { label: 'Active', value: stats.activeTrips, color: '#10b981' },
    { label: 'Upcoming', value: stats.upcomingTrips, color: '#8b5cf6' },
    { label: 'Completed', value: stats.completedTrips, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            🛡 Administrative Control Center
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            System overview and telemetry details for the TripNest Platform.
          </p>
        </div>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 self-start md:self-auto px-4 py-2 text-xs font-bold rounded-xl border border-[#e5e2dd] bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Control Center
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isClickable = !!kpi.onClick;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              onClick={kpi.onClick}
              className={`bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between group transition-all duration-300 ${
                isClickable ? 'cursor-pointer hover:border-[#0ea5e9] hover:shadow-md' : ''
              }`}
            >
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {kpi.title}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {kpi.isCurrency ? formatCurrency(kpi.value) : kpi.value}
                </h3>
                {isClickable && (
                  <span className="text-[10px] text-sky-500 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Manage <ChevronRight className="h-3 w-3" />
                  </span>
                )}
              </div>
              <div className={`p-3.5 rounded-2xl ${kpi.bgClass} ${kpi.textClass} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-6 w-6 stroke-[1.8]" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Row 2: Status Breakdown and System Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trip Status Breakdown Donut Chart */}
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              Trip Status Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Distribution of current, upcoming and completed trips across the system database.
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center py-6">
            <DonutChart data={statusData} />
          </div>
        </div>

        {/* Quick Operations Links */}
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              Quick Operations
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Quick administrative access shortcuts.
            </p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <button
              onClick={() => setActivePage('admin-users')}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-[#e5e2dd] dark:border-slate-800 hover:border-sky-500 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-white dark:hover:bg-slate-900 group transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-500">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">User Management</h4>
                  <p className="text-[10px] text-slate-400">View and audit platform users</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setActivePage('admin-trips')}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-[#e5e2dd] dark:border-slate-800 hover:border-sky-500 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-white dark:hover:bg-slate-900 group transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500">
                  <Luggage className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Trip Auditing</h4>
                  <p className="text-[10px] text-slate-400">Audit all trips and budgets</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="border-t border-[#e5e2dd]/60 dark:border-slate-800/50 pt-4 mt-6">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 block text-center">
              SYSTEM MONITORING ACTIVE
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
