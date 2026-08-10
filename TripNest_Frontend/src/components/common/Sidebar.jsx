import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  LayoutDashboard,
  Map,
  Calendar,
  User,
  Settings,
  Luggage,
  X,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Globe,
  BarChart3
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { getTripStatus } from '../../utils/date';

const Sidebar = ({ activePage, setActivePage, isOpen, setIsOpen }) => {
  const { profile, logoutUser, settings, updateSettings, trips } = useAppContext();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { t, i18n } = useTranslation();

  const isDarkMode = settings?.appearance === 'dark';

  const handleLogout = () => {
    logoutUser();
    setShowLogoutModal(false);
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const navItems = [
    { id: 'dashboard', label: t('sidebar.dashboard', { defaultValue: 'Dashboard' }), icon: LayoutDashboard },
    { id: 'trips', label: t('sidebar.myTrips', { defaultValue: 'My Trips' }), icon: Luggage },
    { id: 'planner', label: t('sidebar.itineraryPlanner', { defaultValue: 'Itinerary Planner' }), icon: Map },
    { id: 'destinations', label: t('sidebar.destinations', { defaultValue: 'Destinations' }), icon: Globe },
    { id: 'calendar', label: t('sidebar.calendar', { defaultValue: 'Calendar' }), icon: Calendar },
    { id: 'analytics', label: t('sidebar.analytics', { defaultValue: 'Analytics' }), icon: BarChart3 },
    { id: 'profile', label: t('sidebar.travelProfile', { defaultValue: 'Travel Profile' }), icon: User },
    { id: 'settings', label: t('sidebar.settings', { defaultValue: 'Settings' }), icon: Settings },
  ];

  // Dynamically calculate next departure information from active/upcoming trips
  const activeOrUpcomingTrip = trips?.find(t => getTripStatus(t.startDate, t.endDate) === 'Active') 
    || trips?.find(t => getTripStatus(t.startDate, t.endDate) === 'Upcoming')
    || trips?.[0];

  const getAirportCode = (dest) => {
    if (!dest) return '???';
    const lDest = dest.toLowerCase();
    if (lDest.includes('delhi')) return 'DEL';
    if (lDest.includes('rome') || lDest.includes('italy')) return 'FCO';
    if (lDest.includes('swiss') || lDest.includes('zermatt')) return 'ZRH';
    if (lDest.includes('tokyo') || lDest.includes('japan')) return 'HND';
    return '???';
  };

  const getLocalizedDepartureDate = (dateStr) => {
    if (!dateStr) return '';
    const currentLang = i18n.language;
    let locale = 'en-IN';
    if (currentLang === 'hi') locale = 'hi-IN';
    else if (currentLang === 'te') locale = 'te-IN';
    else if (currentLang === 'ta') locale = 'ta-IN';
    
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(dateStr));
  };

  const nextDeparture = activeOrUpcomingTrip ? {
    origin: 'DEL',
    dest: getAirportCode(activeOrUpcomingTrip.destination),
    start: getLocalizedDepartureDate(activeOrUpcomingTrip.startDate),
    end: getLocalizedDepartureDate(activeOrUpcomingTrip.endDate),
  } : {
    origin: 'DEL',
    dest: '???',
    start: 'Jul 23',
    end: 'Jul 30',
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 border-r border-[#e5e2dd] bg-[#fcfbf9]/95 dark:border-slate-800/80 dark:bg-[#0b0e14]/95 px-5 py-6 shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e5e2dd] bg-white text-[#0ea5e9] shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              <Compass className="h-5 w-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Travel - OS</p>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                TripNest
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden dark:hover:bg-slate-800/50"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace Title */}
        <div className="px-3 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            {t('sidebar.workspace', { defaultValue: 'Workspace' })}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setIsOpen(false);
                }}
                whileHover={{ x: 2 }}
                transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#0e87da] text-white shadow-[0_4px_20px_-2px_rgba(14,165,233,0.35)] dark:bg-[#0e87da] dark:text-white'
                    : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/40 dark:hover:text-slate-200'
                }`}
              >
                {/* Left accent bar */}
                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r bg-[#38bdf8] opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0" />
                
                <div className="flex items-center gap-3.5">
                  <Icon className={`h-4.5 w-4.5 stroke-[1.8] transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-[#38bdf8]'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white block" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="space-y-5 pt-4 border-t border-[#e5e2dd] dark:border-slate-800/80">
          
          {/* Next Departure Card */}
          <div className="rounded-2xl border border-[#e5e2dd] bg-[#f8f7f4] dark:border-slate-800/60 dark:bg-slate-900/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-3">
              {t('sidebar.nextDeparture', { defaultValue: 'Next Departure' })}
            </p>
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{nextDeparture.origin}</h4>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">{nextDeparture.start}</p>
              </div>
              
              <div className="flex-1 px-4 flex items-center justify-center relative">
                <div className="w-full border-t border-dashed border-[#e5e2dd] dark:border-slate-800 absolute" />
                <div className="z-10 bg-[#0e87da] text-white rounded-full p-1 shadow-sm">
                  <ChevronRight className="h-3 w-3 stroke-[3]" />
                </div>
              </div>

              <div className="text-right">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{nextDeparture.dest}</h4>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">{nextDeparture.end}</p>
              </div>
            </div>
          </div>

          {/* Theme Toggle SWITCH - Smooth 300ms Sliding Thumb */}
          <div className="flex items-center justify-between rounded-xl bg-[#f0eee9] dark:bg-[#121820] p-1 relative z-0">
            <motion.div 
              animate={{ x: isDarkMode ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 300, damping: 26, duration: 0.3 }}
              className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white dark:bg-[#1e293b] shadow-sm z-10 pointer-events-none"
            />
            <button
              onClick={() => updateSettings?.({ appearance: 'light' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-colors duration-300 relative z-20 ${
                !isDarkMode
                  ? 'text-slate-900'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>{t('sidebar.light', { defaultValue: 'Light' })}</span>
            </button>
            <button
              onClick={() => updateSettings?.({ appearance: 'dark' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-colors duration-300 relative z-20 ${
                isDarkMode
                  ? 'text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              <span>{t('sidebar.dark', { defaultValue: 'Dark' })}</span>
            </button>
          </div>

          {/* User Card */}
          <div className="flex items-center justify-between gap-3 bg-[#f8f7f4]/50 dark:bg-slate-900/10 p-2 rounded-xl">
            <button
              onClick={() => setActivePage('profile')}
              className="flex items-center gap-3 text-left group min-w-0"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#e5e2dd] bg-gradient-to-tr from-sky-400 to-[#0e87da] text-sm font-semibold text-white shadow-sm dark:border-slate-800">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {profile.name}
                </p>
                <p className="truncate text-[10px] font-medium text-slate-400 mt-0.5">
                  {profile.email}
                </p>
              </div>
            </button>

            <motion.button
              onClick={() => setShowLogoutModal(true)}
              whileHover={{ rotate: -4, y: -2, backgroundColor: "rgba(239, 68, 68, 0.05)" }}
              whileTap={{ scale: 0.95 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 transition-colors duration-200"
              title={t('logout.title', { defaultValue: 'Sign Out' })}
            >
              <LogOut className="h-4.5 w-4.5" />
            </motion.button>
          </div>
        </div>
      </aside>

      {/* Simulated Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-[#e5e2dd] bg-white p-6 text-center shadow-xl dark:border-slate-800 dark:bg-[#0c1017]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
              <LogOut className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('logout.title', { defaultValue: 'Sign Out?' })}
              </h3>
              <p className="mt-2 text-xs text-slate-400">
                {t('logout.message', { defaultValue: 'This will reset all custom trip itineraries, profile changes, and budget expenses back to seed defaults.' })}
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-xl border border-slate-200/80 bg-white py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {t('logout.cancel', { defaultValue: 'Cancel' })}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/10 hover:shadow-lg active:scale-95"
              >
                {t('logout.confirm', { defaultValue: 'Yes, Sign Out' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
