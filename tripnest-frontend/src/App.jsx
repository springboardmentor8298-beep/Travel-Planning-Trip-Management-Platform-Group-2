import ProtectedRoute from "./components/ProtectedRoute";

import { Routes, Route } from "react-router-dom";

import { Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";

import CreateTrip from "./pages/CreateTrip";

import TripDetails from "./pages/TripDetails";

import EditTrip from "./pages/EditTrip";

import MyTrips from "./pages/MyTrips";

function App() {

    return (
      <Routes>
        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route path="/my-trips" element={<MyTrips />} />

        <Route
          path="/create-trip"
          element={
            <ProtectedRoute>
              <CreateTrip />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-trip/:id"
          element={
            <ProtectedRoute>
              <EditTrip />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trip/:id"
          element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />

      </Routes>
    );

}

export default App;