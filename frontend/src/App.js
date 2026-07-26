import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import OAuthRedirect from "./pages/OAuthRedirect";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Destinations from "./pages/Destinations";
import Trips from "./pages/Trips";
import TripForm from "./pages/TripForm";
import TripDetail from "./pages/TripDetail";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth2/redirect" element={<OAuthRedirect />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips"
            element={
              <PrivateRoute>
                <Trips />
              </PrivateRoute>
            }
          />
          <Route
            path="/destinations"
            element={
              <PrivateRoute>
                <Destinations />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips/new"
            element={
              <PrivateRoute>
                <TripForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <PrivateRoute>
                <TripDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips/:id/edit"
            element={
              <PrivateRoute>
                <TripForm />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
