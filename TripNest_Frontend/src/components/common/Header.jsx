import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Menu, Plus, Bell, Calendar, Search } from 'lucide-react';
import { getTripStatus } from '../../utils/date';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/currency';

const Header = ({ activePage, onMenuClick, onAddTripClick }) => {
  const { 
    profile, 
    trips, 
    systemNotifications = [], 
    markNotificationRead, 
    markAllNotificationsRead,
    pendingInvitations = [],
    acceptTripInvitation,
    declineTripInvitation
  } = useAppContext();
  const { t, i18n } = useTranslation();
  const [showNotifications, setShowNotifications] = React.useState(false);

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
          <div className="relative">
            <motion.button
              onClick={() => setShowNotifications(!showNotifications)}
              whileHover={{ rotate: -4, y: -2, backgroundColor: "rgba(14, 165, 233, 0.05)", boxShadow: "0 8px 16px -4px rgba(14,165,233,0.15)" }}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e2dd] bg-white/80 text-slate-500 hover:text-slate-800 shadow-sm transition-all duration-200 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {(systemNotifications.length > 0 || pendingInvitations.length > 0) && (
                <>
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#0e87da] z-20" />
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#0e87da] animate-ping opacity-75 z-10" />
                </>
              )}
            </motion.button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 border border-[#e5e2dd] dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">Notifications</h4>
                  {systemNotifications.length > 0 && (
                    <button 
                      onClick={() => {
                        markAllNotificationsRead();
                        setShowNotifications(false);
                      }} 
                      className="text-xs text-[#0e87da] font-bold hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {pendingInvitations.length > 0 && (
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Pending Invitations ({pendingInvitations.length})</p>
                      {pendingInvitations.map(inv => (
                        <div key={inv.id} className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/40 mb-2 last:mb-0">
                          <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Trip Invite: {inv.tripName}</h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">Invited by: {inv.name || 'Organizer'}</p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => acceptTripInvitation(inv.id)}
                              className="text-[10px] bg-[#0e87da] hover:bg-[#0c76c0] text-white px-2.5 py-1 rounded-lg font-bold"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => declineTripInvitation(inv.id)}
                              className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg font-bold"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {systemNotifications.length === 0 && pendingInvitations.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">No unread notifications</p>
                  ) : (
                    systemNotifications.map(n => (
                      <div key={n.id} className="flex justify-between items-start gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800">
                        <div className="min-w-0">
                          <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{n.title}</h5>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 leading-normal">{n.message}</p>
                        </div>
                        <button 
                          onClick={() => markNotificationRead(n.id)}
                          className="text-[10px] text-slate-400 hover:text-[#0e87da] dark:hover:text-sky-400 font-bold whitespace-nowrap"
                        >
                          Dismiss
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
