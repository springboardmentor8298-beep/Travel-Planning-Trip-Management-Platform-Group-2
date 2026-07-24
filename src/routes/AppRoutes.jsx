import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Trips from "../pages/Trips";
import TripDetails from "../pages/TripDetails";
import Destinations from "../pages/Destinations";
import DestinationDetails from "../pages/DestinationDetails";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import Finance from "../pages/Finance";
import Groups from "../pages/Groups";
import Documents from "../pages/Documents";

function ProtectedRoute({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
        <Route path="/trips/:tripId" element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />
        <Route path="/destinations" element={<ProtectedRoute><Destinations /></ProtectedRoute>} />
        <Route path="/destinations/:id" element={<ProtectedRoute><DestinationDetails /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
