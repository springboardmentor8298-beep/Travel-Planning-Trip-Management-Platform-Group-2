import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const TripCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [formData, setFormData] = useState({
    name: location.state?.destinationName ? `${location.state.destinationName} Trip` : '',
    title: location.state?.destinationName ? `${location.state.destinationName} Trip` : '',
    description: location.state?.destinationName ? `Planning my trip to ${location.state.destinationName}.` : '',
    startDate: '',
    endDate: '',
    photoUrl: location.state?.photoUrl || '',
    status: 'planning',
    destinationId: location.state?.destinationId || ''
  });
  const [loading, setLoading] = useState(false);
  const [destLoading, setDestLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await api.get('/destinations');
      setDestinations(response.data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setDestLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      const payload = { ...formData };
      if (!payload.destinationId) {
        delete payload.destinationId;
      } else {
        payload.destinationId = Number(payload.destinationId);
      }
      const response = await api.post('/trips', payload);
      setSuccessMsg(`Trip "${response.data.name || response.data.title}" created successfully!`);
      setTimeout(() => {
        navigate(`/trips/${response.data.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to create trip: ' + (error.response?.data?.message || error.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.name === 'destinationId' ? e.target.value : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: val
    });

    if (e.target.name === 'destinationId' && e.target.value) {
      const dest = destinations.find(d => d.id === Number(e.target.value));
      if (dest) {
        setFormData(prev => ({
          ...prev,
          destinationId: e.target.value,
          photoUrl: prev.photoUrl || dest.photoUrl,
          name: prev.name || `${dest.name} Trip`,
          title: prev.title || `${dest.name} Trip`
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">TripNest</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/destinations"
                className="px-5 py-3 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 hover:shadow-md transition-all"
              >
                🗺️ Destinations
              </Link>
              <Link
                to="/dashboard"
                className="px-5 py-3 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 hover:shadow-md transition-all"
              >
                ← Dashboard
              </Link>
              <div className="text-right">
                <p className="text-base font-bold text-gray-800">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{user?.role}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-slate-100 rounded-xl hover:bg-slate-200 hover:shadow-md transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Create New Trip</h1>
            <p className="text-xl text-gray-600">Plan your next adventure</p>
          </div>

          {successMsg && (
            <div className="mb-8 p-5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <p className="text-emerald-800 font-bold text-lg">{successMsg}</p>
                <p className="text-emerald-600 text-sm">Redirecting to trip details...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Trip Title *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                placeholder="e.g., Summer Vacation 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Destination *</label>
              <select
                name="destinationId"
                value={formData.destinationId}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
              >
                <option value="">{destLoading ? 'Loading destinations...' : 'Select a destination'}</option>
                {destinations.map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.name} — {dest.city}, {dest.country}
                  </option>
                ))}
              </select>
              {!destLoading && destinations.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">No destinations loaded. Please check backend connection.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all resize-none"
                placeholder="Tell us about your trip..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Photo URL</label>
              <input
                type="url"
                name="photoUrl"
                value={formData.photoUrl}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
              >
                <option value="planning">Planning</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-8 py-4 text-lg font-bold text-gray-700 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : '✈️ Create Trip'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TripCreate;
