import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDate } from '../utils/date';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Luggage, ArrowUpRight } from 'lucide-react';

const Calendar = ({ setActivePage, setSelectedTripId }) => {
  const { trips } = useAppContext();

  // Local calendar date focus (defaults to today's month/year)
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed (0 = Jan, 11 = Dec)

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper: Get days in a month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get starting day of the week for a month (0 = Sun, 6 = Sat)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Compile grid cells (prefix blank cells + days)
  const cells = [];
  // Blank cells
  for (let i = 0; i < firstDay; i++) {
    cells.push({ type: 'empty', id: `empty-${i}` });
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    // Generate date string in local YYYY-MM-DD
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ type: 'day', day, dateStr });
  }

  // Check if a specific trip overlaps with a date
  const getTripsForDate = (dateStr) => {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0,0,0,0);

    return trips.filter(trip => {
      const start = new Date(trip.startDate);
      start.setHours(0,0,0,0);
      const end = new Date(trip.endDate);
      end.setHours(23,59,59,999);
      
      return targetDate >= start && targetDate <= end;
    });
  };

  const handleTripClick = (id) => {
    setSelectedTripId(id);
    setActivePage('trip-details');
  };

  // Compile all unique trips that occur during this active month
  const tripsThisMonth = trips.filter(trip => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const firstOfMonth = new Date(currentYear, currentMonth, 1);
    const lastOfMonth = new Date(currentYear, currentMonth + 1, 0);

    return (start <= lastOfMonth && end >= firstOfMonth);
  });

  // Assign distinct aesthetic border/bg color gradients to trips for tracking
  const getTripColorStyle = (index) => {
    const palettes = [
      'bg-sky-500/10 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/50',
      'bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-sky-300 dark:border-indigo-900/50',
      'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50',
      'bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50',
      'bg-rose-500/10 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-455 dark:border-rose-900/50'
    ];
    return palettes[index % palettes.length];
  };

  const getTripFlatColor = (index) => {
    const dots = ['bg-sky-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
    return dots[index % dots.length];
  };

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* 1. Main Calendar Grid */}
      <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-850 space-y-6">
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
              }}
              className="px-2.5 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg text-slate-650 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-350 dark:hover:bg-slate-850"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">
          {weekdayNames.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Day Grid Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-[90px] sm:auto-rows-[110px]">
          {cells.map((cell, idx) => {
            if (cell.type === 'empty') {
              return (
                <div key={cell.id} className="bg-slate-50/40 rounded-xl dark:bg-slate-850/10 border border-transparent" />
              );
            }

            // Detect matching trips for cell's date
            const dateTrips = getTripsForDate(cell.dateStr);
            const isToday = 
              today.getDate() === cell.day && 
              today.getMonth() === currentMonth && 
              today.getFullYear() === currentYear;

            return (
              <div 
                key={cell.dateStr} 
                className={`p-1.5 rounded-xl border border-slate-100 bg-white flex flex-col justify-between overflow-hidden dark:bg-slate-900 dark:border-slate-800 ${
                  isToday ? 'ring-2 ring-indigo-500 border-transparent dark:ring-sky-500' : ''
                }`}
              >
                {/* Date number */}
                <span className={`text-xs font-bold ${
                  isToday 
                    ? 'bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center dark:bg-sky-500' 
                    : 'text-slate-400'
                }`}>
                  {cell.day}
                </span>

                {/* Overlapping Trip Items */}
                <div className="flex-1 flex flex-col gap-1 mt-1 justify-end overflow-hidden">
                  {dateTrips.map((trip) => {
                    const tripIndex = trips.findIndex(t => t.id === trip.id);
                    return (
                      <button
                        key={trip.id}
                        onClick={() => handleTripClick(trip.id)}
                        className={`w-full text-left truncate text-[8px] sm:text-[10px] font-bold px-1 py-0.5 rounded border border-transparent ${getTripColorStyle(tripIndex)}`}
                        title={`${trip.title} (${trip.destination})`}
                      >
                        {trip.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Side Panel list: Trips this month */}
      <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-850 h-fit space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Active this Month</h3>
        
        {tripsThisMonth.length === 0 ? (
          <div className="text-center py-8">
            <Luggage className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-450 italic">No trips scheduled for this month.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tripsThisMonth.map((trip) => {
              const tripIndex = trips.findIndex(t => t.id === trip.id);
              return (
                <button
                  key={trip.id}
                  onClick={() => handleTripClick(trip.id)}
                  className="w-full text-left p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/70 transition-colors flex items-start gap-2.5 dark:bg-slate-800/40 dark:border-slate-800"
                >
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${getTripFlatColor(tripIndex)}`} />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate flex items-center gap-0.5">
                      <span>{trip.title}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </h4>
                    <p className="text-[10px] text-slate-450 truncate mt-0.5 dark:text-slate-500">{trip.destination}</p>
                    <p className="text-[9px] text-indigo-600 font-semibold mt-1 dark:text-sky-400">
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
