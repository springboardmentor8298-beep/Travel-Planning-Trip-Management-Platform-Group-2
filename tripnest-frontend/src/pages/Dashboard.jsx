import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.fullName || "Traveler"} 🎒</h1>
      <p className="text-gray-600 mt-2">This is your TripNest dashboard. Trip management coming in Week 3-4.</p>
      <button onClick={handleLogout} className="mt-6 bg-red-600 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  );
}
