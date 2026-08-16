import Sidebar from "./Sidebar";

// Wraps every authenticated page in the sidebar + scrollable content area.
export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
