import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { getTripStatus, formatDateRange, getRelativeTime } from '../utils/date';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/currency';
import {
  Luggage,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Plus,
  Activity,
  MapPin,
  Users,
  RefreshCw,
  Trash2,
  User
} from 'lucide-react';
import { getDashboard } from "../services/dashboardService";

// CountUp Component for stats number animation
const CountUp = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1] 
    });
    return rounded.on("change", (latest) => setDisplayVal(latest));
  }, [value]);

  return <span>{displayVal}</span>;
};

const Dashboard = ({ setActivePage, setSelectedTripId, onAddTripClick }) => {
  const { trips, recentActivity } = useAppContext();
  const { t, i18n } = useTranslation();

  const [dashboard, setDashboard] = useState({
    totalTrips: 0,
    activeTrips: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const response = await getDashboard();
      const data = response?.data?.data || {};
      setDashboard({
        totalTrips: data.totalTrips || 0,
        activeTrips: data.ongoingTrips || 0,
        upcomingTrips: data.upcomingTrips || 0,
        completedTrips: data.completedTrips || 0,
        totalBudget: data.totalBudget || 0,
        totalSpent: data.totalSpent || 0,
        remainingBudget: data.remainingBudget || 0
      });
    } catch (err) {
      console.log(err);
    }
  }

  // Calculate dynamic trip lists for rendering
  const upcomingTrips = trips.filter(trip =>
    (trip.status ? trip.status === 'UPCOMING' : getTripStatus(trip.startDate, trip.endDate) === 'Upcoming')
  );

  const activeTrips = trips.filter(trip =>
    (trip.status ? trip.status === 'ACTIVE' : getTripStatus(trip.startDate, trip.endDate) === 'Active')
  );

  // Statistics derived directly from backend dashboard API
  const totalTrips = dashboard.totalTrips;
  const totalBudgetAllocated = dashboard.totalBudget;
  const totalExpenses = dashboard.totalSpent;

  const budgetUsagePercent = totalBudgetAllocated > 0
    ? Math.round((totalExpenses / totalBudgetAllocated) * 100)
    : 0;

  // Status Breakdown Percentages using backend statistics
  const activePercent = totalTrips > 0 ? Math.round((dashboard.activeTrips / totalTrips) * 100) : 0;
  const upcomingPercent = totalTrips > 0 ? Math.round((dashboard.upcomingTrips / totalTrips) * 100) : 0;
  const completedPercent = totalTrips > 0 ? Math.round((dashboard.completedTrips / totalTrips) * 100) : 0;

  // Activity Icon helpers based on events
  const getActivityIcon = (type) => {
    switch (type) {
      case 'create':
        return <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'edit':
      case 'activity':
        return <RefreshCw className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />;
      case 'delete':
        return <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      case 'budget':
        return <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'profile':
        return <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />;
    }
  };

  const getActivityBg = (type) => {
    switch (type) {
      case 'create': return 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40';
      case 'delete': return 'bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/40';
      case 'budget': return 'bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40';
      case 'profile': return 'bg-sky-50 border border-sky-200 dark:bg-sky-950/20 dark:border-sky-800/40';
      default: return 'bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800';
    }
  };

  const handleViewTrip = (id) => {
    setSelectedTripId(id);
    setActivePage('trip-details');
  };

  const getLocalizedTripDateRange = (start, end) => {
    if (!start || !end) return '';
    const currentLang = i18n.language;
    let locale = 'en-IN';
    if (currentLang === 'hi') locale = 'hi-IN';
    else if (currentLang === 'te') locale = 'te-IN';
    else if (currentLang === 'ta') locale = 'ta-IN';

    const sDate = new Date(start);
    const eDate = new Date(end);

    const sMonth = sDate.toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' });
    const sDay = sDate.toLocaleDateString(locale, { day: 'numeric', timeZone: 'UTC' });
    const sYear = sDate.toLocaleDateString(locale, { year: 'numeric', timeZone: 'UTC' });

    const eMonth = eDate.toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' });
    const eDay = eDate.toLocaleDateString(locale, { day: 'numeric', timeZone: 'UTC' });
    const eYear = eDate.toLocaleDateString(locale, { year: 'numeric', timeZone: 'UTC' });

    if (sYear !== eYear) {
      return `${sMonth} ${sDay}, ${sYear} – ${eMonth} ${eDay}, ${eYear}`;
    }
    if (sMonth !== eMonth) {
      return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${sYear}`;
    }
    if (sDay === eDay) {
      return `${sMonth} ${sDay}, ${sYear}`;
    }
    return `${sMonth} ${sDay} – ${eDay}, ${sYear}`;
  };

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.35 } }
  };

  const kpis = [
    { label: t('dashboard.totalTrips', { defaultValue: 'Total Trips' }), value: dashboard.totalTrips, icon: Luggage, badge: '+1 mo' },
    { label: t('dashboard.activeNow', { defaultValue: 'Active Now' }), value: dashboard.activeTrips, icon: Activity, badge: 'live', isBlue: true },
    { label: t('dashboard.upcoming', { defaultValue: 'Upcoming' }), value: dashboard.upcomingTrips, icon: Calendar, badge: '7 days' },
    { label: t('dashboard.completed', { defaultValue: 'Completed' }), value: dashboard.completedTrips, icon: CheckCircle, badge: '-' }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 p-1 sm:p-2"
    >
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              variants={itemVariants}
              whileHover={{ 
                y: -4, 
                borderColor: "rgba(14, 165, 233, 0.4)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              className="group rounded-2xl border border-[#e5e2dd] bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0c1017] flex flex-col justify-between overflow-hidden relative transition-colors duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                    {item.label}
                  </p>
                  <h3 className={`text-4xl font-extrabold tracking-tight ${item.isBlue ? 'text-[#0e87da]' : 'text-slate-900 dark:text-white'}`}>
                    <CountUp value={item.value} />
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                  <div className="h-9 w-9 flex items-center justify-center rounded-full border border-[#e5e2dd] bg-[#fcfbf9]/60 text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 group-hover:rotate-[-6deg] group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-4.5 w-4.5 stroke-[1.8]" />
                  </div>
                </div>
              </div>
              <div className="mt-5 h-1 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((item.value / (dashboard.totalTrips || 5)) * 100, 100)}%` }}
                  transition={{ delay: 0.15, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-[#0e87da] rounded-full" 
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Row 1: Trips currently in motion & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trips currently in motion */}
        <motion.div
          variants={itemVariants}
          whileHover={{ 
            y: -3,
            borderColor: "rgba(14, 165, 233, 0.25)",
            boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.05)"
          }}
          className="lg:col-span-2 rounded-2xl border border-[#e5e2dd] bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0c1017] flex flex-col transition-all duration-300"
        >
          <div className="flex items-center justify-between border-b border-[#e5e2dd]/60 dark:border-slate-800/60 pb-4 mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                {t('dashboard.liveInFocus', { defaultValue: 'Live - In Focus' })}
              </p>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {t('dashboard.tripsInMotion', { defaultValue: 'Trips currently in motion' })}
              </h2>
            </div>
            <button
              onClick={() => setActivePage('trips')}
              className="text-xs font-bold text-[#0e87da] hover:underline flex items-center gap-1"
            >
              {t('dashboard.viewAllTrips', { defaultValue: 'View all trips' })} <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {activeTrips.length === 0 && upcomingTrips.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-900">
                  <Luggage className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-400">
                  {t('dashboard.noTripsScheduled', { defaultValue: 'No active or upcoming trips scheduled.' })}
                </p>
                <button
                  onClick={onAddTripClick}
                  className="mt-3 text-xs font-bold text-[#0e87da] hover:underline"
                >
                  {t('dashboard.planFirstTrip', { defaultValue: 'Plan your first trip' })}
                </button>
              </div>
            ) : (
              [...activeTrips, ...upcomingTrips].slice(0, 2).map((trip) => {
                const status = trip.status ? (trip.status.charAt(0).toUpperCase() + trip.status.slice(1).toLowerCase()) : getTripStatus(trip.startDate, trip.endDate);
                const tripTotalExpenses = trip.expenses ? trip.expenses.reduce((s, e) => s + e.amount, 0) : 0;
                
                const tripLength = Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) || 1;

                return (
                  <div
                    key={trip.id}
                    className="border border-[#e5e2dd] bg-[#fcfbf9]/60 dark:border-slate-800 dark:bg-slate-900/10 rounded-xl p-4 mb-3 last:mb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/25 hover:border-[#0e87da]/40 transition-all duration-200"
                  >
                    <div className="space-y-1 md:w-1/3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400'
                        }`}>
                          {status === 'Active' ? t('dashboard.activeNow', { defaultValue: 'Active' }) : t('dashboard.upcoming', { defaultValue: 'Upcoming' })}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {getLocalizedTripDateRange(trip.startDate, trip.endDate)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{trip.title}</h4>
                      
                      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3" />
                          {trip.destination ? trip.destination.split(",")[0] : "No Destination"}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <Users className="h-3 w-3" />
                          {trip.travelers?.length || 1} {t('dashboard.travelers', { defaultValue: 'travelers' })}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <DollarSign className="h-3 w-3" />
                          {trip.destination?.includes('India') || trip.destination?.includes('IN') ? 'INR' : 'USD'}
                        </span>
                      </div>
                    </div>

                    {/* Timeline representation */}
                    <div className="flex-1 flex items-center justify-between px-3 md:px-6">
                      <span className="text-[10px] font-bold text-slate-400">{t('dashboard.day', { defaultValue: 'Day' })} 0</span>
                      <div className="flex-1 px-4 flex items-center justify-center relative">
                        <div className="w-full border-t border-[#e5e2dd] dark:border-slate-800 absolute" />
                        <div className="z-10 bg-[#0e87da] text-white rounded-full p-1.5 shadow-sm">
                          <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{t('dashboard.day', { defaultValue: 'Day' })} {tripLength}</span>
                    </div>

                    {/* Budget */}
                    <div className="text-right flex items-center md:flex-col justify-between md:justify-center gap-2 md:w-1/4">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Budget</p>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 whitespace-nowrap">
                          {formatCurrency(tripTotalExpenses)} / {formatCurrency(trip.budget)}
                        </h5>
                      </div>
                      <button
                        onClick={() => handleViewTrip(trip.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#e5e2dd] bg-white text-slate-400 group-hover:text-[#0e87da] group-hover:border-[#0e87da]/30 dark:border-slate-800 dark:bg-slate-900 transition-all duration-200"
                      >
                        <ChevronRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform duration-200" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Trip status distribution */}
        <motion.div
          variants={itemVariants}
          whileHover={{ 
            y: -3,
            borderColor: "rgba(14, 165, 233, 0.25)",
            boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.05)"
          }}
          className="rounded-2xl border border-[#e5e2dd] bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0c1017] flex flex-col justify-between transition-all duration-300"
        >
          <div className="flex items-center justify-between border-b border-[#e5e2dd]/60 dark:border-slate-800/60 pb-4 mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                {t('dashboard.portfolio', { defaultValue: 'Portfolio' })}
              </p>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {t('dashboard.tripStatusDistribution', { defaultValue: 'Trip status distribution' })}
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-400">{totalTrips} {t('dashboard.total', { defaultValue: 'total' })}</span>
          </div>

          {totalTrips === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              {t('dashboard.noMetrics', { defaultValue: 'No trips found to compile metrics.' })}
            </p>
          ) : (
            <div className="space-y-4 py-2">
              <div>
                <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>{t('dashboard.activeTripsLabel', { defaultValue: 'ACTIVE TRIPS' })} ({activeTrips.length})</span>
                  <span>{activePercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${activePercent}%` }} 
                    transition={{ delay: 0.2, duration: 0.45 }}
                    className="h-full rounded-full bg-[#0e87da]" 
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>{t('dashboard.upcomingTripsLabel', { defaultValue: 'UPCOMING TRIPS' })} ({upcomingTrips.length})</span>
                  <span>{upcomingPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${upcomingPercent}%` }} 
                    transition={{ delay: 0.25, duration: 0.45 }}
                    className="h-full rounded-full bg-[#0e87da]/60" 
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>{t('dashboard.completedTripsLabel', { defaultValue: 'COMPLETED TRIPS' })} ({dashboard.completedTrips})</span>
                  <span>{completedPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${completedPercent}%` }} 
                    transition={{ delay: 0.3, duration: 0.45 }}
                    className="h-full rounded-full bg-[#a1a1aa]" 
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

      </div>

      {/* Row 2: Financial Portfolio & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Financial Portfolio */}
        <motion.div
          variants={itemVariants}
          whileHover={{ 
            y: -3,
            borderColor: "rgba(14, 165, 233, 0.25)",
            boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.05)"
          }}
          className="lg:col-span-2 rounded-2xl border border-[#e5e2dd] bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0c1017] flex flex-col justify-between transition-all duration-300"
        >
          <div className="flex items-center justify-between border-b border-[#e5e2dd]/60 dark:border-slate-800/60 pb-4 mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                {t('dashboard.capital', { defaultValue: 'Capital' })} &bull; ₹ INR
              </p>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {t('dashboard.financialPortfolio', { defaultValue: 'Financial portfolio' })}
              </h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
              ON TRACK
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span>{t('dashboard.overallBudget', { defaultValue: 'Overall Budget Consumption' })}</span>
                <span className="text-[#0e87da]">{budgetUsagePercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
                  transition={{ delay: 0.2, duration: 0.45 }}
                  className={`h-full rounded-full ${budgetUsagePercent > 90 ? 'bg-rose-500' : 'bg-[#0e87da]'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-[#e5e2dd] bg-[#fcfbf9]/60 dark:border-slate-800 dark:bg-slate-900/10 p-4">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t('dashboard.totalAllocated', { defaultValue: 'Total Allocated' })}
                </p>
                <h4 className="mt-2 text-xl font-extrabold text-slate-800 dark:text-slate-200">{formatCurrency(totalBudgetAllocated)}</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  {totalTrips === 1 ? (
                    t('dashboard.acrossTrips', { count: totalTrips, defaultValue: `across ${totalTrips} trip` })
                  ) : (
                    t('dashboard.acrossTrips_plural', { count: totalTrips, defaultValue: `across ${totalTrips} trips` })
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-[#e5e2dd] bg-[#fcfbf9]/60 dark:border-slate-800 dark:bg-slate-900/10 p-4">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t('dashboard.expensesLogged', { defaultValue: 'Expenses Logged' })}
                </p>
                <h4 className="mt-2 text-xl font-extrabold text-slate-800 dark:text-slate-200">{formatCurrency(totalExpenses)}</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  {totalExpenses > 0 
                    ? t('dashboard.loggedFromReceipts', { defaultValue: 'logged from receipts' }) 
                    : t('dashboard.noEntriesYet', { defaultValue: 'no entries yet' })}
                </p>
              </div>

              {/* Glowing Available Capital */}
              <div className="rounded-xl border-2 border-[#0e87da]/60 bg-sky-50/10 dark:border-[#0e87da]/40 dark:bg-slate-900/30 p-4 relative shadow-sm shadow-[#0e87da]/5">
                <p className="text-[10px] font-bold text-[#0e87da] uppercase tracking-wider">
                  {t('dashboard.availableCapital', { defaultValue: 'Available Capital' })}
                </p>
                <h4 className="mt-2 text-xl font-extrabold text-[#0e87da]">{formatCurrency(totalBudgetAllocated - totalExpenses)}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 leading-snug font-medium">
                  {t('dashboard.readyToDeploy', { defaultValue: 'Ready to deploy across planned journeys.' })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={itemVariants}
          whileHover={{ 
            y: -3,
            borderColor: "rgba(14, 165, 233, 0.25)",
            boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.05)"
          }}
          className="rounded-2xl border border-[#e5e2dd] bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0c1017] flex flex-col justify-between transition-all duration-300"
        >
          <div className="flex items-center justify-between border-b border-[#e5e2dd]/60 dark:border-slate-800/60 pb-4 mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                {t('dashboard.timeline', { defaultValue: 'Timeline' })}
              </p>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {t('dashboard.recentActivity', { defaultValue: 'Recent activity' })}
              </h2>
            </div>
            <button className="text-[10px] font-bold text-slate-400 bg-[#f8f7f4] border border-[#e5e2dd] dark:bg-slate-900 dark:border-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
              {t('dashboard.allEvents', { defaultValue: 'ALL EVENTS' })}
            </button>
          </div>

          <div className="relative max-h-[220px] min-h-[180px] space-y-4.5 overflow-y-auto pl-7 flex-1">
            <div className="absolute bottom-1 left-[11px] top-1 w-[1px] border-l border-dashed border-[#e5e2dd] dark:border-slate-800" />

            {recentActivity.filter(act => act && act.message).length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                {t('dashboard.noLogs', { defaultValue: 'No logs generated yet.' })}
              </p>
            ) : (
              recentActivity
                .filter(act => act && act.message)
                .slice(0, 5)
                .map((activity) => (
                  <div
                    key={activity.id}
                    className="relative flex flex-col text-left justify-center group cursor-pointer p-1 rounded-lg -ml-1 hover:bg-[#fcfbf9]/90 dark:hover:bg-slate-900/50 transition-all duration-200"
                  >
                    <div className={`absolute -left-[23px] z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-[#0c1017] ${getActivityBg(activity.type)} group-hover:rotate-12 group-hover:scale-110 transition-all duration-200`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="pl-3">
                      <p className="text-[11px] font-bold leading-normal text-slate-700 dark:text-slate-300 group-hover:text-[#0e87da] transition-colors duration-200">
                        {activity.message}
                      </p>
                      <span className="mt-0.5 block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        {getRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </motion.div>

      </div>

      {/* Footer Branding */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between border-t border-[#e5e2dd]/60 dark:border-slate-800/50 pt-5 mt-4"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
          TripNest &bull; Travel OS &bull; V2.6
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
          {t('dashboard.syncedJustNow', { defaultValue: 'Synced Just Now' })}
        </span>
      </motion.div>

    </motion.div>
  );
};

export default Dashboard;
