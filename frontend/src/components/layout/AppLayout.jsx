import { NavLink, useNavigate } from 'react-router-dom';
import { Plane, LayoutDashboard, Map, Compass, Wallet, Bell, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/trips', label: 'My Trips', icon: Map },
  { to: '/dashboard/destinations', label: 'Destinations', icon: Compass },
  { to: '/dashboard/budgets', label: 'Budgets', icon: Wallet },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell }
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-voyage-100 bg-white md:flex">
        <div className="flex items-center gap-2 px-6 py-6 font-display text-lg font-semibold text-ink">
          <Plane className="h-5 w-5 rotate-45 text-voyage-500" strokeWidth={2.5} />
          TripNest
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-voyage-50 text-voyage-600'
                    : 'text-ink-soft hover:bg-voyage-50/60 hover:text-ink'
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-voyage-100 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sunset-100 font-display text-sm font-semibold text-sunset-600">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{user?.fullName}</p>
              <p className="truncate text-xs text-ink-soft">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-voyage-100 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <Plane className="h-5 w-5 rotate-45 text-voyage-500" strokeWidth={2.5} />
          TripNest
        </div>
        <button onClick={() => setMobileNavOpen((v) => !v)} aria-label="Toggle navigation">
          <Menu className="h-5 w-5 text-ink" />
        </button>
      </div>

      {mobileNavOpen && (
        <nav className="border-b border-voyage-100 bg-white px-3 py-2 md:hidden">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  isActive ? 'bg-voyage-50 text-voyage-600' : 'text-ink-soft'
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" size={18} />
              {label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </nav>
      )}

      <main className="md:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
