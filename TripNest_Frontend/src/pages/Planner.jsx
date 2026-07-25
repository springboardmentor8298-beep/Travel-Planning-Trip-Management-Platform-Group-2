import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getDatesInRange, formatDate } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import { 
  MapPin, 
  Clock, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Grab, 
  Map, 
  Compass,
  AlertCircle,
  Tag,
  DollarSign
} from 'lucide-react';

const Planner = () => {
  const { trips, updateItinerary } = useAppContext();

  // Selected Trip ID
  const [selectedTripId, setSelectedTripId] = useState(() => {
    return trips.length > 0 ? trips[0].id : '';
  });

  // Selected Day (defaults to Day 1)
  const [selectedDay, setSelectedDay] = useState(1);

  // New Activity Form State
  const [activityForm, setActivityForm] = useState({
    time: '09:00 AM',
    title: '',
    description: '',
    cost: '',
    type: 'Sightseeing' // Sightseeing, Dining, Transport, Relaxation, Meeting
  });

  const trip = trips.find(t => t.id === selectedTripId);

  // Re-generate list of days if trip changed
  const dates = trip ? getDatesInRange(trip.startDate, trip.endDate) : [];
  const totalDays = dates.length;

  // Sync selected day to bounds
  if (selectedDay > totalDays && totalDays > 0) {
    setSelectedDay(1);
  }

  // Get current day's activities
  const dayPlan = trip && trip.itinerary 
    ? trip.itinerary.find(item => item.day === selectedDay) 
    : null;
    
  const currentActivities = dayPlan ? dayPlan.activities : [];

  // Helper: Save updated activities list for the current trip and day
  const saveActivities = (updatedActivities) => {
    if (!trip) return;
    
    let newItinerary = trip.itinerary ? [...trip.itinerary] : [];
    const existingDayIndex = newItinerary.findIndex(item => item.day === selectedDay);

    if (existingDayIndex > -1) {
      newItinerary[existingDayIndex] = {
        ...newItinerary[existingDayIndex],
        activities: updatedActivities
      };
    } else {
      newItinerary.push({
        day: selectedDay,
        date: dates[selectedDay - 1],
        activities: updatedActivities
      });
    }

    // Sort itinerary by day number
    newItinerary.sort((a, b) => a.day - b.day);
    
    updateItinerary(trip.id, newItinerary);
  };

  // Add new activity
  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!activityForm.title) return;

    const newActivity = {
      id: `act-${Date.now()}`,
      time: activityForm.time,
      title: activityForm.title,
      description: activityForm.description,
      cost: activityForm.cost ? parseFloat(activityForm.cost) : 0,
      type: activityForm.type
    };

    const updated = [...currentActivities, newActivity];
    // Sort activities by time (standard string sort fits mostly, or let them place at bottom)
    saveActivities(updated);

    // Reset Form
    setActivityForm({
      time: '09:00 AM',
      title: '',
      description: '',
      cost: '',
      type: 'Sightseeing'
    });
  };

  // Delete Activity
  const handleDeleteActivity = (actId) => {
    const updated = currentActivities.filter(act => act.id !== actId);
    saveActivities(updated);
  };

  // Move Activity Up/Down (click reordering)
  const moveActivity = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentActivities.length - 1) return;

    const updated = [...currentActivities];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    saveActivities(updated);
  };

  // DRAG & DROP EVENT HANDLERS
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    // Needed for Firefox support
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...currentActivities];
    const draggedItem = updated[draggedIndex];
    
    // Remove the item from its old position
    updated.splice(draggedIndex, 1);
    // Insert the item into its new position
    updated.splice(targetIndex, 0, draggedItem);

    saveActivities(updated);
    setDraggedIndex(null);
  };

  const getCategoryColor = (type) => {
    switch (type) {
      case 'Sightseeing': return 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/50';
      case 'Dining': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50';
      case 'Transport': return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      case 'Relaxation': return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-sky-400 dark:border-indigo-900/50';
      case 'Meeting': return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-455 dark:border-rose-900/50';
      default: return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Trip Selector Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Select Journey to Plan</h2>
          {trips.length > 0 ? (
            <select
              value={selectedTripId}
              onChange={(e) => {
                setSelectedTripId(e.target.value);
                setSelectedDay(1);
              }}
              className="mt-1 text-lg font-black text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.destination})</option>
              ))}
            </select>
          ) : (
            <p className="text-sm font-semibold text-slate-400 mt-1">No trips available. Go create one first!</p>
          )}
        </div>

        {trip && (
          <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
            <MapPin className="w-5 h-5 text-indigo-500" />
            <div className="text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-350">{trip.destination}</p>
              <p className="text-slate-400 mt-0.5">{formatDate(trip.startDate)} &ndash; {formatDate(trip.endDate)}</p>
            </div>
          </div>
        )}
      </div>

      {!trip ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center dark:bg-slate-900 dark:border-slate-850">
          <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-spin-slow" />
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">No active trip selected</h3>
          <p className="text-sm text-slate-400 mt-1">Create or select a trip from the manager to begin daily itinerary planning.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Day Navigation Selector Bar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-850">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Day Directory</h3>
              <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 max-h-[450px] overflow-y-auto pr-1">
                {dates.map((dateStr, index) => {
                  const dayNum = index + 1;
                  const isSelected = selectedDay === dayNum;
                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedDay(dayNum)}
                      className={`flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left border text-sm font-bold transition-all duration-200 ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-50 to-indigo-50/50 border-indigo-200 text-indigo-700 dark:from-indigo-950/40 dark:to-sky-950/20 dark:border-indigo-900/40 dark:text-sky-400'
                          : 'bg-white border-slate-100 text-slate-650 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <p>Day {dayNum}</p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{formatDate(dateStr)}</p>
                      </div>
                      
                      {/* Count indicator */}
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>
                        {trip.itinerary && trip.itinerary.find(it => it.day === dayNum) 
                          ? trip.itinerary.find(it => it.day === dayNum).activities.length 
                          : 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Day Activities List & Add Activity form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Itinerary Schedule */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">Day {selectedDay} Itinerary</h3>
                  <p className="text-xs text-slate-400 font-semibold">{formatDate(dates[selectedDay - 1])}</p>
                </div>
                <div className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700 hidden sm:block">
                  Tip: Drag and drop cards to reorder activities.
                </div>
              </div>

              {currentActivities.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl dark:border-slate-800">
                  <Map className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs text-slate-450 italic">No scheduled activities for Day {selectedDay}.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Use the form below to plan your day.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-xl dark:bg-slate-805/40 dark:border-slate-800 flex items-start justify-between gap-3 cursor-grab active:cursor-grabbing transition-colors duration-150 ${
                        draggedIndex === index ? 'opacity-40 bg-slate-200 border-indigo-200' : ''
                      }`}
                    >
                      <div className="flex gap-2">
                        {/* Drag Handle indicator */}
                        <div className="text-slate-350 dark:text-slate-600 mt-0.5 hidden sm:block">
                          <Grab className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-xs font-bold text-indigo-655 dark:text-sky-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {activity.time}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase ${getCategoryColor(activity.type)}`}>
                              {activity.type}
                            </span>
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white mt-2">{activity.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 dark:text-slate-400 leading-normal max-w-xl">{activity.description}</p>
                          
                          {activity.cost > 0 && (
                            <span className="inline-block mt-2.5 text-[10px] font-bold text-slate-455 bg-white border border-slate-100 dark:bg-slate-850 dark:border-slate-800 px-2 py-0.5 rounded">
                              Cost: {formatCurrency(activity.cost)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Click Reordering controls + Delete */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Up arrow */}
                        <button
                          disabled={index === 0}
                          onClick={() => moveActivity(index, 'up')}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 disabled:opacity-30 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        
                        {/* Down arrow */}
                        <button
                          disabled={index === currentActivities.length - 1}
                          onClick={() => moveActivity(index, 'down')}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 disabled:opacity-30 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ml-1"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Activity Form */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Add Day Activity</h3>
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:30 AM"
                      value={activityForm.time}
                      onChange={(e) => setActivityForm({...activityForm, time: e.target.value})}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity Type</label>
                    <select
                      value={activityForm.type}
                      onChange={(e) => setActivityForm({...activityForm, type: e.target.value})}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350"
                    >
                      <option value="Sightseeing">Sightseeing</option>
                      <option value="Dining">Dining</option>
                      <option value="Transport">Transport</option>
                      <option value="Relaxation">Relaxation</option>
                      <option value="Meeting">Meeting</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Cost (₹)</label>
                     <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                       <input
                         type="number"
                         placeholder="0"
                         value={activityForm.cost}
                         onChange={(e) => setActivityForm({...activityForm, cost: e.target.value})}
                         className="w-full pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                       />
                     </div>
                   </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Visit Louvre Museum"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({...activityForm, title: e.target.value})}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brief Description</label>
                  <textarea
                    placeholder="Provide details, address or booking codes..."
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                    rows="3"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white text-sm font-semibold shadow transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Day Plan</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
