import {
  BarChart3,
  Bell,
  Compass,
  FileText,
  MapPinned,
  ReceiptText,
  Route,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

const dashboardModules = [
  { id: 1, title: "My profile", icon: UserRound, description: "Preferences, travel history and account settings", path: "/profile", status: "Available", accent: "coral" },
  { id: 2, title: "Trip management", icon: MapPinned, description: "Create, organize and share every journey", path: "/trips", status: "Available", accent: "teal" },
  { id: 3, title: "Itinerary planner", icon: Route, description: "Build a clear day-by-day travel schedule", path: "/trips", status: "Available", accent: "blue" },
  { id: 4, title: "Budget planner", icon: WalletCards, description: "Set limits and keep travel costs on track", path: "/budget", status: "Available", accent: "gold" },
  { id: 5, title: "Expense tracker", icon: ReceiptText, description: "Record and categorize shared spending", path: "/expenses", status: "Available", accent: "rose" },
  { id: 6, title: "Travel groups", icon: UsersRound, description: "Invite companions and plan together", path: "/groups", status: "Available", accent: "violet" },
  { id: 7, title: "Discover", icon: Compass, description: "Explore destinations, guides and weather", path: "/destinations", status: "Available", accent: "green" },
  { id: 8, title: "Documents", icon: FileText, description: "Keep tickets and bookings in one place", path: "/documents", status: "Available", accent: "slate" },
  { id: 9, title: "Notifications", icon: Bell, description: "Manage reminders, alerts and invitations", path: "/dashboard", status: "Available", accent: "orange" },
  { id: 10, title: "Reports", icon: BarChart3, description: "Review travel, budget and platform insights", path: "/reports", status: "Planned", accent: "indigo" },
];

export default dashboardModules;
