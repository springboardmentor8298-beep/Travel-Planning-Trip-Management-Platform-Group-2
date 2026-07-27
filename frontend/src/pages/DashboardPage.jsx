import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, Wallet, Users, ArrowUpRight, CalendarDays } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { tripApi } from '../api/tripApi';

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0];
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    tripApi
      .list()
      .then(({ data }) => setTrips(data.data))
      .catch(() => setTrips([]))
      .finally(() => setIsLoading(false));
  }, []);

  const upcoming = trips
    .filter((t) => t.status === 'PLANNING' || t.status === 'UPCOMING' || t.status === 'ONGOING')
    .slice(0, 3);

  const statCards = [
    { label: 'Trips planned', value: isLoading ? '—' : String(trips.length), icon: Map, hint: 'Across all statuses' },
    { label: 'Budget tracked', value: '$0', icon: Wallet, hint: 'Budgets & expenses arrive in Milestone 3' },
    { label: 'Group members', value: '0', icon: Users, hint: 'Group collaboration arrives in Milestone 3' }
  ];

  return (
    <AppLayout>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sunset-600">Overview</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Welcome back, {firstName || 'traveler'}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          Plan trips, build day-wise itineraries, and schedule activities. Budgets and group
          collaboration unlock in the next milestone.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, hint }) => (
          <div
            key={label}
            className="rounded-xl border border-voyage-100 bg-white p-5 transition-shadow hover:shadow-ticket"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-voyage-50 text-voyage-600">
                <Icon className="h-[18px] w-[18px]" size={18} />
              </span>
              <ArrowUpRight className="h-4 w-4 text-ink-soft/40" />
            </div>
            <p className="mt-4 font-display text-2xl font-semibold text-ink">{value}</p>
            <p className="text-sm font-medium text-ink-soft">{label}</p>
            <p className="mt-3 text-xs text-ink-soft/70">{hint}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Upcoming trips</h2>
          <Link to="/dashboard/trips" className="text-sm font-semibold text-voyage-500 hover:underline">
            View all
          </Link>
        </div>

        {!isLoading && upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-voyage-300 bg-voyage-50/40 p-8 text-center">
            <p className="font-display text-lg font-semibold text-ink">Plan your first trip</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
              Pick a destination, set your dates, and start building a day-wise itinerary.
            </p>
            <Link
              to="/dashboard/trips"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-voyage-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-voyage-600"
            >
              Plan a trip
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {upcoming.map((trip) => (
              <Link
                key={trip.id}
                to={`/dashboard/trips/${trip.id}`}
                className="rounded-xl border border-voyage-100 bg-white p-5 transition-shadow hover:shadow-ticket"
              >
                <h3 className="truncate font-display text-base font-semibold text-ink">{trip.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{trip.destination?.name}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-ink-soft/70">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {trip.startDate} → {trip.endDate}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
