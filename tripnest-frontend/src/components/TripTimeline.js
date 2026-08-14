import React from 'react';

const getActivityBadge = (type) => {
  const map = {
    Sightseeing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Transportation: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Accommodation: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Dining: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Adventure: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Shopping: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };
  return map[type] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
};

const TripTimeline = ({ itineraries = [] }) => {
  if (!itineraries || itineraries.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 bg-slate-800/40 border border-slate-700/60 rounded-2xl">
        <span className="text-3xl block mb-2">🗓️</span>
        <p className="font-semibold text-white">No Itinerary Days Added Yet</p>
        <p className="text-xs text-slate-400 mt-1">Add itinerary days to view the interactive trip timeline.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-700/60 space-y-10 my-4 ml-4">
      {itineraries.map((day) => (
        <div key={day.id} className="relative group">
          {/* Day Milestone Marker */}
          <div className="absolute -left-[31px] sm:-left-[39px] top-0 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-slate-900">
            D{day.dayNumber}
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 pb-3">
              <div>
                <h4 className="font-extrabold text-white text-base">Day {day.dayNumber}</h4>
                {day.date && <p className="text-xs text-slate-400 font-medium mt-0.5">📅 {day.date}</p>}
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                {day.activities?.length || 0} Activities
              </span>
            </div>

            {day.notes && (
              <p className="text-xs text-slate-300 mt-3 italic bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                📝 {day.notes}
              </p>
            )}

            {/* Activities within this day */}
            <div className="mt-4 space-y-3">
              {day.activities && day.activities.length > 0 ? (
                day.activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 bg-slate-900/60 border border-slate-700/40 rounded-xl hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border mt-0.5 ${getActivityBadge(act.activityType)}`}>
                        {act.activityType || 'Activity'}
                      </span>
                      <div>
                        <h5 className="font-bold text-white text-sm">{act.activityName}</h5>
                        {act.location && (
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <span>📍</span> {act.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400 self-end sm:self-auto">
                      {(act.startTime || act.endTime) && (
                        <span>⏰ {act.startTime || ''} {act.endTime ? `– ${act.endTime}` : ''}</span>
                      )}
                      {act.cost && (
                        <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          ₹{act.cost.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-2">No activities scheduled for this day.</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TripTimeline;
