import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TripCreate from './pages/TripCreate';
import TripDetail from './pages/TripDetail';
import DestinationList from './pages/DestinationList';
import DestinationDetail from './pages/DestinationDetail';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/destinations" element={<DestinationList />} />
      <Route path="/destinations/:id" element={<DestinationDetail />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/trips/create" element={<TripCreate />} />
      <Route path="/trips/:id" element={<TripDetail />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
