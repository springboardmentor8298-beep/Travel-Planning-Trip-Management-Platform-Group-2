import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import Itinerary from "./pages/Itinerary";
import Destinations from "./pages/Destinations";
import Activity from "./pages/Activity";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/activities" element={<Activity />} />
        <Route path="*" element={
          <div className="page">
            <h1>Page Not Found</h1>
            <Link to="/dashboard">Go to Dashboard</Link>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
