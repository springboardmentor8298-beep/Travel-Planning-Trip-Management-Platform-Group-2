import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarPlus,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Bell,
  Pencil,
  Trash2,
  Loader2,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/common/Button';
import ItineraryDayFormModal from '../components/trips/ItineraryDayFormModal';
import ActivityFormModal from '../components/trips/ActivityFormModal';
import { tripApi } from '../api/tripApi';
import { itineraryApi } from '../api/itineraryApi';
import { activityApi } from '../api/activityApi';

const statusStyles = {
  PLANNING: 'bg-sky-300/30 text-voyage-600',
  UPCOMING: 'bg-sunset-100 text-sunset-600',
  ONGOING: 'bg-voyage-50 text-voyage-600',
  COMPLETED: 'bg-voyage-100 text-voyage-700',
  CANCELLED: 'bg-red-50 text-red-500'
};

const activityTypeStyles = {
  SIGHTSEEING: 'bg-voyage-50 text-voyage-600',
  TRANSPORTATION: 'bg-sky-300/30 text-voyage-600',
  ACCOMMODATION: 'bg-sunset-100 text-sunset-600',
  DINING: 'bg-sunset-100 text-sunset-600',
  ADVENTURE: 'bg-voyage-100 text-voyage-700',
  SHOPPING: 'bg-sky-300/30 text-voyage-600',
  OTHER: 'bg-voyage-50 text-ink-soft'
};

export default function TripDetailPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [days, setDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dayModal, setDayModal] = useState({ open: false, day: null });
  const [activityModal, setActivityModal] = useState({ open: false, dayId: null, activity: null });
  const [isGenerating, setIsGenerating] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tripRes, daysRes] = await Promise.all([
        tripApi.getById(tripId),
        itineraryApi.listDays(tripId)
      ]);
      setTrip(tripRes.data.data);
      setDays(daysRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load this trip');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data } = await itineraryApi.generate(tripId);
      setDays(data.data);
      toast.success('Itinerary generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDay = async (day) => {
    if (!window.confirm(`Delete Day ${day.dayNumber}? Its activities will be removed too.`)) return;
    try {
      await itineraryApi.removeDay(tripId, day.id);
      setDays((prev) => prev.filter((d) => d.id !== day.id));
      toast.success('Day removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove day');
    }
  };

  const handleDayModalSaved = (savedDay) => {
    setDayModal({ open: false, day: null });
    setDays((prev) => {
      const exists = prev.some((d) => d.id === savedDay.id);
      const next = exists ? prev.map((d) => (d.id === savedDay.id ? savedDay : d)) : [...prev, savedDay];
      return [...next].sort((a, b) => a.dayNumber - b.dayNumber);
    });
  };

  const handleDeleteActivity = async (day, activity) => {
    if (!window.confirm(`Remove "${activity.title}"?`)) return;
    try {
      await activityApi.remove(tripId, day.id, activity.id);
      setDays((prev) =>
        prev.map((d) =>
          d.id === day.id ? { ...d, activities: d.activities.filter((a) => a.id !== activity.id) } : d
        )
      );
      toast.success('Activity removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove activity');
    }
  };

  const handleActivityModalSaved = (savedActivity) => {
    const dayId = activityModal.dayId;
    setActivityModal({ open: false, dayId: null, activity: null });
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        const exists = d.activities.some((a) => a.id === savedActivity.id);
        const activities = exists
          ? d.activities.map((a) => (a.id === savedActivity.id ? savedActivity : a))
          : [...d.activities, savedActivity];
        activities.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
        return { ...d, activities };
      })
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-voyage-500" />
        </div>
      </AppLayout>
    );
  }

  if (!trip) {
    return (
      <AppLayout>
        <p className="text-sm text-ink-soft">Trip not found.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link
        to="/dashboard/trips"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my trips
      </Link>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-voyage-100 bg-white p-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{trip.title}</h1>
            <span className={clsx('rounded-full px-2.5 py-1 text-xs font-semibold', statusStyles[trip.status])}>
              {trip.status}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft">
            <MapPin className="h-3.5 w-3.5" />
            {trip.destination?.name}
            {trip.destination?.country ? ` — ${trip.destination.country}` : ''}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {trip.startDate} → {trip.endDate} · {trip.durationDays} day{trip.durationDays === 1 ? '' : 's'}
            {trip.totalBudget != null && <> · Budget ${Number(trip.totalBudget).toLocaleString()}</>}
          </p>
          {trip.notes && <p className="mt-3 max-w-2xl text-sm text-ink-soft">{trip.notes}</p>}
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">Itinerary</h2>
        <div className="flex gap-2">
          {days.length === 0 && (
            <Button onClick={handleGenerate} isLoading={isGenerating}>
              <Sparkles className="h-4 w-4" />
              Generate day-by-day itinerary
            </Button>
          )}
          <Button variant="secondary" onClick={() => setDayModal({ open: true, day: null })}>
            <CalendarPlus className="h-4 w-4" />
            Add a day
          </Button>
        </div>
      </div>

      {days.length === 0 ? (
        <div className="rounded-xl border border-dashed border-voyage-300 bg-voyage-50/40 p-10 text-center">
          <p className="font-display text-lg font-semibold text-ink">No itinerary yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Generate a day for every date of this trip, or add days one at a time.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {days.map((day) => (
            <div key={day.id} className="rounded-xl border border-voyage-100 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sunset-600">
                    Day {day.dayNumber} · {day.date}
                  </p>
                  <h3 className="mt-0.5 font-display text-lg font-semibold text-ink">
                    {day.title || `Day ${day.dayNumber}`}
                  </h3>
                  {day.notes && <p className="mt-1 text-sm text-ink-soft">{day.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDayModal({ open: true, day })}
                    aria-label="Edit day"
                    className="rounded-lg p-2 text-ink-soft hover:bg-voyage-50 hover:text-ink"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDay(day)}
                    aria-label="Delete day"
                    className="rounded-lg p-2 text-ink-soft hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {day.activities.length === 0 ? (
                  <p className="rounded-lg bg-voyage-50/50 px-3 py-2.5 text-sm text-ink-soft">
                    No activities scheduled yet.
                  </p>
                ) : (
                  day.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-voyage-100 px-3.5 py-3"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-ink">{activity.title}</p>
                          <span
                            className={clsx(
                              'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                              activityTypeStyles[activity.activityType]
                            )}
                          >
                            {activity.activityType}
                          </span>
                          {activity.reminderEnabled && (
                            <Bell className="h-3.5 w-3.5 text-sunset-500" aria-label="Reminder enabled" />
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
                          {(activity.startTime || activity.endTime) && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activity.startTime || '—'} – {activity.endTime || '—'}
                            </span>
                          )}
                          {activity.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {activity.location}
                            </span>
                          )}
                          {activity.estimatedCost != null && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {Number(activity.estimatedCost).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {activity.notes && <p className="mt-1.5 text-xs text-ink-soft/80">{activity.notes}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActivityModal({ open: true, dayId: day.id, activity })}
                          aria-label="Edit activity"
                          className="rounded-lg p-1.5 text-ink-soft hover:bg-voyage-50 hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(day, activity)}
                          aria-label="Delete activity"
                          className="rounded-lg p-1.5 text-ink-soft hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setActivityModal({ open: true, dayId: day.id, activity: null })}
                className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-voyage-500 hover:text-voyage-600"
              >
                <Plus className="h-4 w-4" />
                Add activity
              </button>
            </div>
          ))}
        </div>
      )}

      {dayModal.open && (
        <ItineraryDayFormModal
          tripId={tripId}
          day={dayModal.day}
          onClose={() => setDayModal({ open: false, day: null })}
          onSaved={handleDayModalSaved}
        />
      )}

      {activityModal.open && (
        <ActivityFormModal
          tripId={tripId}
          dayId={activityModal.dayId}
          activity={activityModal.activity}
          onClose={() => setActivityModal({ open: false, dayId: null, activity: null })}
          onSaved={handleActivityModalSaved}
        />
      )}
    </AppLayout>
  );
}
