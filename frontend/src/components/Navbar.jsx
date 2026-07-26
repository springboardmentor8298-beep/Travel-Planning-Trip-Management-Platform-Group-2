import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand-700">
          <span className="inline-block w-8 h-8 rounded-lg bg-brand-600 text-white grid place-items-center">✈</span>
          TripNest
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <Link to="/trips" className="text-slate-600 hover:text-brand-700 text-sm font-medium">
              My Trips
            </Link>
            <Link to="/destinations" className="text-slate-600 hover:text-brand-700 text-sm font-medium">
              Explore
            </Link>
            <Link to="/profile" className="text-slate-600 hover:text-brand-700 text-sm font-medium">
              Profile
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <span className="text-sm text-slate-500 hidden sm:inline">Hi, {user.fullName?.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-brand-700">
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
