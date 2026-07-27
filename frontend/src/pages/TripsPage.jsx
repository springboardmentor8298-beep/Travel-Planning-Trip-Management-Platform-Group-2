import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, CalendarDays, Loader2, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/common/Button';
import TripFormModal from '../components/trips/TripFormModal';
import { tripApi } from '../api/tripApi';

const statusStyles = {
  PLANNING: 'bg-sky-300/30 text-voyage-600',
  UPCOMING: 'bg-sunset-100 text-sunset-600',
  ONGOING: 'bg-voyage-50 text-voyage-600',
  COMPLETED: 'bg-voyage-100 text-voyage-700',
  CANCELLED: 'bg-red-50 text-red-500'
};

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({ open: false, trip: null });

  const loadTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await tripApi.list();
      setTrips(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load your trips');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleDelete = async (trip) => {
    if (!window.confirm(`Delete "${trip.title}"? This can't be undone.`)) return;
    try {
      await tripApi.remove(trip.id);
      toast.success('Trip deleted');
      setTrips((prev) => prev.filter((t) => t.id !== trip.id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete trip');
    }
  };

  const handleSaved = (savedTrip) => {
    setModalState({ open: false, trip: null });
    setTrips((prev) => {
      const exists = prev.some((t) => t.id === savedTrip.id);
      return exists ? prev.map((t) => (t.id === savedTrip.id ? savedTrip : t)) : [savedTrip, ...prev];
    });
  };

  return (
    <AppLayout>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sunset-600">Trip planning</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">My Trips</h1>
        </div>
        <Button onClick={() => setModalState({ open: true, trip: null })}>
          <Plus className="h-4 w-4" />
          New trip
        </Button>
      </header>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-voyage-500" />
        </div>
      ) : trips.length === 0 ? (
        <div className="rounded-xl border border-dashed border-voyage-300 bg-voyage-50/40 p-10 text-center">
          <p className="font-display text-lg font-semibold text-ink">No trips yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Create your first trip to start building a day-wise itinerary.
          </p>
          <Button className="mt-4" onClick={() => setModalState({ open: true, trip: null })}>
            <Plus className="h-4 w-4" />
            Plan a trip
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="flex flex-col rounded-xl border border-voyage-100 bg-white p-5 transition-shadow hover:shadow-ticket"
            >
              <div className="flex items-start justify-between gap-2">
                <Link to={`/dashboard/trips/${trip.id}`} className="min-w-0">
                  <h3 className="truncate font-display text-lg font-semibold text-ink hover:text-voyage-600">
                    {trip.title}
                  </h3>
                </Link>
                <span
                  className={clsx(
                    'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                    statusStyles[trip.status]
                  )}
                >
                  {trip.status}
                </span>
              </div>

              <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft">
                <MapPin className="h-3.5 w-3.5" />
                {trip.destination?.name}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft">
                <CalendarDays className="h-3.5 w-3.5" />
                {trip.startDate} → {trip.endDate} ({trip.durationDays}d)
              </p>

              <p className="mt-3 text-xs text-ink-soft/70">
                {trip.itineraryDayCount > 0
                  ? `${trip.itineraryDayCount} itinerary day${trip.itineraryDayCount === 1 ? '' : 's'} planned`
                  : 'Itinerary not started yet'}
              </p>

              <div className="mt-4 flex items-center gap-2 border-t border-voyage-100 pt-3">
                <Link
                  to={`/dashboard/trips/${trip.id}`}
                  className="flex-1 rounded-lg bg-voyage-50 px-3 py-2 text-center text-sm font-semibold text-voyage-600 hover:bg-voyage-100"
                >
                  Open itinerary
                </Link>
                <button
                  onClick={() => setModalState({ open: true, trip })}
                  aria-label="Edit trip"
                  className="rounded-lg p-2 text-ink-soft hover:bg-voyage-50 hover:text-ink"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(trip)}
                  aria-label="Delete trip"
                  className="rounded-lg p-2 text-ink-soft hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalState.open && (
        <TripFormModal
          trip={modalState.trip}
          onClose={() => setModalState({ open: false, trip: null })}
          onSaved={handleSaved}
        />
      )}
    </AppLayout>
  );
}
