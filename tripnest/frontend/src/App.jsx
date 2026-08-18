import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";
import Destinations from "./pages/Destinations";
import Profile from "./pages/Profile";
import Itineraries from "./pages/Itineraries";
import DestinationDetails from "./pages/DestinationDetails";
import Collaboration from "./pages/Collaboration";
import Notifications from "./pages/Notifications";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/trips" element={<PrivateRoute><Trips /></PrivateRoute>} />
          <Route path="/trips/new" element={<PrivateRoute><Trips /></PrivateRoute>} />
          <Route path="/trips/:id" element={<PrivateRoute><TripDetail /></PrivateRoute>} />
          <Route path="/destinations" element={<PrivateRoute><Destinations /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route
  path="/trips/:id/collaboration"
  element={
    <PrivateRoute>
      <Collaboration />
    </PrivateRoute>
  }
/>
<Route
  path="/notifications"
  element={
    <PrivateRoute>
      <Notifications />
    </PrivateRoute>
  }

/>
<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

<Route
  path="/reset-password"
  element={<ResetPassword />}
/>

          <Route
  path="/destinations/:id"
  element={
    <PrivateRoute>
      <DestinationDetails />
    </PrivateRoute>
  }
/>
        <Route
  path="/itineraries"
  element={
    <PrivateRoute>
      <Itineraries />
    </PrivateRoute>
  }
/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;