import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import MyTripsPage from "./components/MyTripsPage";
import TripDetailsPage from "./components/TripDetailsPage";
import TripPlan from "./components/TripPlan";
import DestinationsPage from "./components/DestinationsPage";
import DestinationDetails from "./components/DestinationDetails";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-trips"
                    element={
                        <ProtectedRoute>
                            <MyTripsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/trip/:id"
                    element={
                        <ProtectedRoute>
                            <TripDetailsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/plan-trip"
                    element={
                        <ProtectedRoute>
                            <TripPlan />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/destinations"
                    element={
                        <ProtectedRoute>
                            <DestinationsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/destination/:name"
                    element={
                        <ProtectedRoute>
                            <DestinationDetails />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;