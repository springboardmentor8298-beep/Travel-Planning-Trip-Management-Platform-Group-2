import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [trip, setTrip] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [newItinerary, setNewItinerary] = useState({
    date: '',
    title: '',
    notes: '',
    destinationId: ''
  });
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    fetchTrip();
    fetchDestinations();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);
      fetchItineraries();
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await api.get('/destinations');
      setDestinations(response.data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const fetchItineraries = async () => {
    try {
      const response = await api.get(`/trips/${id}/itineraries`);
      setItineraries(response.data);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    }
  };

  const handleCreateItinerary = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/trips/${id}/itineraries`, newItinerary);
      setShowItineraryModal(false);
      setNewItinerary({ date: '', title: '', notes: '', destinationId: '' });
      fetchItineraries();
    } catch (error) {
      console.error('Error creating itinerary:', error);
    }
  };

  const handleDeleteTrip = async () => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await api.delete(`/trips/${id}`);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting trip:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Trip not found</h2>
          <Link to="/dashboard" className="text-sky-600 font-semibold hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50">
      {/* Navigation */}
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
              <div className="text-right">
                <p className="text-base font-bold text-gray-800">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{user.role}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {user.firstName?.[0]}{user.lastName?.[0]}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Trip Header */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 mb-10">
          {trip.photoUrl && (
            <div className="h-64 overflow-hidden">
              <img
                src={trip.photoUrl}
                alt={trip.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    trip.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                    trip.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    trip.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{trip.name}</h1>
                <p className="text-xl text-gray-600 mb-4">{trip.description}</p>
                <div className="flex items-center space-x-6 text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteTrip}
                  className="px-6 py-3 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                >
                  Delete Trip
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Itineraries Section */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900">Itinerary</h2>
            <button
              onClick={() => setShowItineraryModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Add Day</span>
            </button>
          </div>

          {itineraries.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-sky-50 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-3">No itinerary yet</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Start adding days to your trip itinerary</p>
            </div>
          ) : (
            <div className="space-y-6">
              {itineraries.sort((a, b) => new Date(a.date) - new Date(b.date)).map((itinerary, index) => (
                <div
                  key={itinerary.id}
                  className="p-6 bg-gradient-to-r from-slate-50 to-sky-50 rounded-2xl border border-slate-200 hover:border-sky-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                        <span className="text-2xl font-extrabold text-white">{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="text-lg font-bold text-gray-800">{itinerary.title || `Day ${index + 1}`}</p>
                          {itinerary.destinationName && (
                            <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-sm font-semibold">
                              {itinerary.destinationName}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{new Date(itinerary.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        {itinerary.notes && <p className="text-gray-600">{itinerary.notes}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Itinerary Modal */}
      {showItineraryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Add Itinerary Day</h3>
            <form onSubmit={handleCreateItinerary} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Date *</label>
                <input
                  type="date"
                  value={newItinerary.date}
                  onChange={(e) => setNewItinerary({ ...newItinerary, date: e.target.value })}
                  required
                  min={trip.startDate}
                  max={trip.endDate}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Title</label>
                <input
                  type="text"
                  value={newItinerary.title}
                  onChange={(e) => setNewItinerary({ ...newItinerary, title: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                  placeholder="e.g., Explore the city"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Destination</label>
                <select
                  value={newItinerary.destinationId}
                  onChange={(e) => setNewItinerary({ ...newItinerary, destinationId: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                >
                  <option value="">Select destination</option>
                  {destinations.map((dest) => (
                    <option key={dest.id} value={dest.id}>{dest.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Notes</label>
                <textarea
                  value={newItinerary.notes}
                  onChange={(e) => setNewItinerary({ ...newItinerary, notes: e.target.value })}
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all resize-none"
                  placeholder="Add notes for this day..."
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowItineraryModal(false)}
                  className="flex-1 px-6 py-4 text-lg font-bold text-gray-700 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  Add Day
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetail;
