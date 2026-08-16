import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: "📊" },
  { label: "My Trips", to: "/trips", icon: "🧳" },
  { label: "Itineraries", to: "/trips", icon: "🗓️" },
  { label: "Budget", to: "/trips", icon: "💰" },
  { label: "Destinations", to: "/destinations", icon: "🗺️" },
  { label: "Notifications", to: "/notifications", icon: "🔔" },
  { label: "Groups", to: "/trips", icon: "👥" },
  { label: "Profile", to: "/profile", icon: "👤" },
  { label: "Documents", to: "/trips", icon: "📎" },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = isAdmin
    ? [...NAV_ITEMS, { label: "Admin Panel", to: "/admin", icon: "🛠️" }]
    : NAV_ITEMS;

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-emerald-950 text-emerald-50 flex flex-col">
      <div className="px-5 py-6 flex items-center gap-2 border-b border-emerald-800/60">
        <span className="text-2xl">🌿</span>
        <span className="text-lg font-bold">TripNest</span>
      </div>

      <div className="px-5 py-4 flex items-center gap-3 border-b border-emerald-800/60">
        <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold">
          {user?.fullName?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{user?.fullName || "Traveler"}</div>
          <div className="text-[11px] text-emerald-300 uppercase tracking-wide">
            {user?.roles?.join(", ") || "Traveler"}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-emerald-600 text-white shadow"
                  : "text-emerald-100/80 hover:bg-emerald-900"
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-emerald-800/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-950/50 transition"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
