import { Map, Wallet, Users, ArrowUpRight } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';

const statCards = [
  { label: 'Trips planned', value: '0', icon: Map, hint: 'Trip planning arrives in Milestone 2' },
  { label: 'Budget tracked', value: '$0', icon: Wallet, hint: 'Budgets & expenses arrive in Milestone 3' },
  { label: 'Group members', value: '0', icon: Users, hint: 'Group collaboration arrives in Milestone 4' }
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0];

  return (
    <AppLayout>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sunset-600">Overview</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Welcome back, {firstName || 'traveler'}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          Your account is set up. Trip planning, itineraries, and budgets unlock in the next
          milestones — this dashboard will fill in as each module ships.
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

      <section className="mt-8 rounded-xl border border-dashed border-voyage-300 bg-voyage-50/50 p-8 text-center">
        <p className="font-display text-lg font-semibold text-ink">Trip planning is on the way</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          Milestone 1 covers your account, security, and this dashboard shell. Day-wise itineraries,
          budgets, and group trips are built next.
        </p>
      </section>
    </AppLayout>
  );
}
