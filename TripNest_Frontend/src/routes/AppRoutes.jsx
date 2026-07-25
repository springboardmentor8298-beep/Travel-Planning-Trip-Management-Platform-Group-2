import { Routes, Route } from "react-router-dom";

import AuthPage from "../pages/Auth/AuthPage";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

<Route
    path="/dashboard"
    element={
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    }
/>

export default function AppRoutes() {

    return (

        <Routes>

            <Route
                path="/"
                element={<AuthPage />}
            />

            <Route
                path="/dashboard"
                element={<Dashboard />}
            />

        </Routes>

    );

}