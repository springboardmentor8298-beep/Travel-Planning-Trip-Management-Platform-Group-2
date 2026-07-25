import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Menu, Plus, Bell, Calendar, Search } from 'lucide-react';
import { getTripStatus } from '../../utils/date';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/currency';

const Header = ({ activePage, onMenuClick, onAddTripClick }) => {
  const { profile, trips } = useAppContext();
  const { t, i18n } = useTranslation();

  // 1. Calculate active trips and capital available dynamically
  const activeTripsCount = trips.filter(trip =>
    getTripStatus(trip.startDate, trip.endDate) === 'Active'
  ).length;

  const totalBudgetAllocated = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
  const totalExpenses = trips.reduce((sum, trip) => {
    const tripExpenses = trip.expenses ? trip.expenses.reduce((s, e) => s + e.amount, 0) : 0;
    return sum + tripExpenses;
  }, 0);
  const availableCapital = totalBudgetAllocated - totalExpenses;

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return t('header.greeting.morning', { defaultValue: 'Good morning' });
    if (hrs < 17) return t('header.greeting.afternoon', { defaultValue: 'Good afternoon' });
    return t('header.greeting.evening', { defaultValue: 'Good evening' });
  };

  const getLocalizedDate = () => {
    const currentLang = i18n.language;
    let locale = 'en-IN';
    if (currentLang === 'hi') locale = 'hi-IN';
    else if (currentLang === 'te') locale = 'te-IN';
    else if (currentLang === 'ta') locale = 'ta-IN';

    // Format like "22 July 2026"
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
  };

  const getLocalizedMonthYear = () => {
    const currentLang = i18n.language;
    let locale = 'en-IN';
    if (currentLang === 'hi') locale = 'hi-IN';
    else if (currentLang === 'te') locale = 'te-IN';
    else if (currentLang === 'ta') locale = 'ta-IN';

    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      year: 'numeric'
    }).format(new Date()).toUpperCase();
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  return (
    <header className="px-4 pt-6 sm:px-6 lg:px-8 bg-transparent">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between border-b border-[#e5e2dd]/60 dark:border-slate-800/50 pb-6">
        
        {/* Left Side: Overview & Greeting */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0e87da]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
              {t('header.overview', { defaultValue: 'Overview' })} &bull; {getLocalizedMonthYear()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {getGreeting()}, {profile.name.split(' ')[0]}.
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {activeTripsCount === 1 ? (
                t('header.subtext', { 
                  count: activeTripsCount, 
                  capital: formatCurrency(availableCapital), 
                  defaultValue: `You have ${activeTripsCount} active trip and ${formatCurrency(availableCapital)} of capital still available across your journeys.`
                })
              ) : (
                t('header.subtext_plural', { 
                  count: activeTripsCount, 
                  capital: formatCurrency(availableCapital), 
                  defaultValue: `You have ${activeTripsCount} active trips and ${formatCurrency(availableCapital)} of capital still available across your journeys.`
                })
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e2dd] bg-white/80 text-slate-600 transition-colors lg:hidden dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search bar */}
          <motion.div 
            whileHover={{ y: -1 }}
            className="relative flex items-center group cursor-text"
          >
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-[#38bdf8] transition-colors" />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder', { defaultValue: 'Search trips' })}
              className="h-10 rounded-xl border border-[#e5e2dd] bg-white/80 pl-10 pr-12 text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all hover:bg-sky-50/10 focus:border-[#0e87da] focus:bg-white w-44 sm:w-52 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:placeholder-slate-500"
            />
            <div className="absolute right-2.5 hidden sm:flex items-center gap-0.5 rounded border border-[#e5e2dd] bg-[#f8f7f4] px-1.5 py-0.5 text-[9px] font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-800">
              <span>⌘</span><span>K</span>
            </div>
          </motion.div>

          {/* Date Picker Button */}
          <motion.div 
            whileHover={{ y: -1 }}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#e5e2dd] bg-white/80 px-3.5 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span>{getLocalizedDate()}</span>
          </motion.div>

          {/* Notification Button */}
          <motion.button
            whileHover={{ rotate: -4, y: -2, backgroundColor: "rgba(14, 165, 233, 0.05)", boxShadow: "0 8px 16px -4px rgba(14,165,233,0.15)" }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e2dd] bg-white/80 text-slate-500 hover:text-slate-800 shadow-sm transition-all duration-200 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#0e87da] z-20" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#0e87da] animate-ping opacity-75 z-10" />
          </motion.button>

          {/* New Trip Button - Lift, Glow, Tap scale, Shine Sweep */}
          <motion.button
            onClick={onAddTripClick}
            whileHover={{ 
              y: -2, 
              boxShadow: "0 0 16px rgba(14, 165, 233, 0.45)",
              transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
            }}
            whileTap={{ scale: 0.97 }}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#0e87da] hover:bg-[#0c76c0] px-4 text-xs font-bold text-white shadow-sm transition-colors duration-300 relative overflow-hidden group"
          >
            {/* shine sweep */}
            <span className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none" />
            
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>{t('header.newTrip', { defaultValue: 'New Trip' })}</span>
          </motion.button>

        </div>
      </div>
    </header>
  );
};

export default Header;
