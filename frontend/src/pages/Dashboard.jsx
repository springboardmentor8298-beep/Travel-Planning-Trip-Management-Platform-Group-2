import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('Flights');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tripsRes, destRes, notifUnreadRes] = await Promise.all([
        api.get('/trips'),
        api.get('/destinations'),
        api.get('/notifications/unread-count').catch(() => ({ data: { count: 0 } }))
      ]);
      setTrips(tripsRes.data);
      setDestinations(destRes.data);
      setUnreadCount(notifUnreadRes.data?.count || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { name: 'Overview', icon: '📊', path: '/dashboard' },
    { name: 'Destinations', icon: '🗺️', path: '/destinations' },
    { name: 'Create Trip', icon: '✏️', path: '/trips/create' },
    { name: 'My Trips', icon: '📖', action: 'scroll-trips' },
    { name: 'Rewards', icon: '💜', path: '/dashboard' },
  ];

  const activeNav = (() => {
    const p = location.pathname;
    if (p.startsWith('/destinations')) return 'Destinations';
    if (p.startsWith('/trips/create')) return 'Create Trip';
    if (p.startsWith('/trips/')) return 'My Trips';
    const hit = navItems.find(n => n.path === p);
    return hit ? hit.name : 'Overview';
  })();

  const dealCards = [
    { title: 'Flight Deals', subtitle: 'up to 50% Off', gradient: 'from-purple-500 to-indigo-500', icon: '✈️' },
    { title: 'Instant Cashback', subtitle: 'up to $75', gradient: 'from-cyan-400 to-teal-400', icon: '💰' },
    { title: 'Special Deals', subtitle: 'for Villas & Apartments', gradient: 'from-purple-500 to-fuchsia-500', icon: '🏨' },
  ];

  const searchTabs = [
    { name: 'Flights', icon: '✈️' },
    { name: 'Hotel', icon: '🏨' },
    { name: 'Train', icon: '🚆' },
    { name: 'Villas & Apt', icon: '🏡' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 flex">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-white/95 backdrop-blur-xl border-r border-slate-100 flex flex-col sticky top-0 h-screen shadow-xl">
        {/* Logo */}
        <div className="px-8 py-8 border-b border-slate-50">
          <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
              <span className="text-white text-xl font-black">✈</span>
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">TripNest</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-5 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = activeNav === item.name;
            const handleClick = () => {
              if (item.action === 'scroll-trips') {
                if (location.pathname !== '/dashboard') navigate('/dashboard#mytrips');
                else document.getElementById('mytrips-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else if (item.path) {
                navigate(item.path);
              }
            };
            return (
              <button
                key={item.name}
                onClick={handleClick}
                className={`w-full flex items-center px-5 py-4 rounded-2xl text-left transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-200/80 hover:-translate-y-0.5'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-purple-600'
                }`}
              >
                <span className={`text-xl mr-4 ${isActive ? '' : 'opacity-70'}`}>{item.icon}</span>
                <span className="font-bold tracking-wide">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-5 pb-8">
          <button
            onClick={logout}
            className="w-full flex items-center px-5 py-4 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-red-500 transition-all font-semibold"
          >
            <span className="text-xl mr-4">↪️</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="px-10 py-7 flex items-center justify-between bg-transparent sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">Hello, {user?.firstName} 👋</h1>
            <p className="text-slate-500 font-medium">Welcome back, let's plan your next adventure</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/trips/create"
              className="hidden md:flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-purple-300/60 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <span>✈️</span><span>Create Trip</span>
            </Link>
            <button className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur border border-slate-100 hover:border-purple-200 hover:bg-purple-50 shadow-sm transition-all flex items-center justify-center relative">
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-black flex items-center justify-center shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur border border-slate-100 hover:border-purple-200 hover:bg-purple-50 shadow-sm transition-all flex items-center justify-center">
              <span className="text-lg">💬</span>
            </button>
            <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-3 pl-4 pr-2 py-2 bg-white/90 backdrop-blur border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                <span className="text-white font-black text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-slate-800">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-500 truncate max-w-[140px]">{user?.email}</p>
              </div>
            </button>
          </div>
        </header>

        <div className="px-10 pb-10">
          {/* Hero Search Banner */}
          <div className="relative rounded-[2.5rem] overflow-hidden mb-10 shadow-2xl border border-white/50">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-fuchsia-900">
              <img
                src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?image_size=landscape_16_9&prompt=Stunning%20panoramic%20mountain%20landscape%20sunset%20travel%20adventure%2C%20snow%20peaks%2C%20purple%20and%20indigo%20sky%2C%20river%20valley%2C%20cinematic%20photography%2C%20wanderlust%20vibes"
                alt="Hero"
                className="w-full h-full object-cover mix-blend-overlay opacity-35"
              />
            </div>
            <div className="relative z-10 px-16 pt-16 pb-0 text-center">
              <h2 className="text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl tracking-tight">Got a place in mind?</h2>
              <p className="text-xl md:text-2xl text-white/90 mb-8 font-medium drop-shadow-lg">TripNest - Making travel planning effortless</p>
              
              {/* Search Tabs */}
              <div className="inline-flex mb-0 bg-white/95 backdrop-blur rounded-t-3xl shadow-2xl border-t border-x border-white/50">
                {searchTabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`px-7 py-4 text-sm font-black transition-all rounded-t-2xl ${
                      activeTab === tab.name
                        ? 'text-purple-700 bg-gradient-to-b from-white via-white to-purple-50/50 -mt-0.5'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>{tab.name}
                  </button>
                ))}
              </div>
              
              {/* Search Form */}
              <div className="bg-white/95 backdrop-blur rounded-[0_2rem_2rem_2rem] p-8 shadow-2xl -mt-1 mx-auto max-w-6xl border-b border-x border-white/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1 text-left p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus-within:border-purple-400 transition-all hover:bg-slate-100">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1 block">From</label>
                    <select className="w-full bg-transparent text-slate-800 font-bold text-lg outline-none cursor-pointer">
                      <option>Mumbai, UP</option>
                      <option>Delhi, DL</option>
                      <option>Bengaluru, KA</option>
                      <option>Kolkata, WB</option>
                    </select>
                  </div>
                  <div className="md:col-span-1 text-left p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus-within:border-purple-400 transition-all hover:bg-slate-100">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1 block">To</label>
                    <select className="w-full bg-transparent text-slate-800 font-bold text-lg outline-none cursor-pointer">
                      <option>Darjeeling, DP</option>
                      <option>Jaipur, RJ</option>
                      <option>Goa, GA</option>
                      <option>Agra, UP</option>
                      <option>Leh, LA</option>
                    </select>
                  </div>
                  <div className="md:col-span-1 text-left p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus-within:border-purple-400 transition-all hover:bg-slate-100">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1 block">Passenger, Class</label>
                    <select className="w-full bg-transparent text-slate-800 font-bold text-lg outline-none cursor-pointer">
                      <option>2 Adults, First Class</option>
                      <option>1 Adult, Economy</option>
                      <option>4 Adults, Business</option>
                    </select>
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <Link
                      to="/destinations"
                      className="w-full flex items-center justify-center p-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl shadow-purple-300/60 hover:shadow-2xl hover:shadow-purple-400/70 hover:-translate-y-1 transition-all duration-300 font-black text-lg"
                    >
                      🔍 Search
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-12"></div>
          </div>

          {/* Deal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {dealCards.map((deal) => (
              <div
                key={deal.title}
                className={`relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br ${deal.gradient} text-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-white/20`}
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10"></div>
                <div className="absolute right-8 top-4 text-8xl opacity-20">{deal.icon}</div>
                <h3 className="text-2xl font-black mb-1 drop-shadow-lg tracking-tight">{deal.title}</h3>
                <p className="text-white/90 font-semibold text-lg mb-8 drop-shadow">{deal.subtitle}</p>
                <button className="px-7 py-3 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-xl text-sm font-black transition-all shadow-xl hover:shadow-emerald-300/70 hover:-translate-y-0.5">
                  Grab it →
                </button>
              </div>
            ))}
          </div>

          {/* Popular Destinations / Stays */}
          <div className="mb-14">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <span className="text-white text-xl">🏡</span>
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Popular Destinations</h3>
              </div>
              <div className="flex space-x-3">
                <Link
                  to="/trips/create"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-purple-300/60 hover:shadow-xl hover:-translate-y-0.5 transition-all hidden sm:inline-flex items-center"
                >
                  ✈️ Create Trip
                </Link>
                <Link
                  to="/destinations"
                  className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black shadow-sm hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all"
                >
                  View All →
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-purple-600 shadow-lg"></div>
              </div>
            ) : destinations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl opacity-40">🏖️</span>
                </div>
                <h4 className="text-2xl font-black text-slate-700 mb-3">No destinations loaded yet</h4>
                <p className="text-slate-500 font-medium">
                  If backend server isn't running, start it with <code className="bg-slate-100 px-3 py-1 rounded-lg text-purple-700 font-mono text-sm font-bold">cd backend ; mvn spring-boot:run</code>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {destinations.slice(0, 5).map((dest, i) => (
                  <div
                    key={dest.id}
                    className="group bg-white rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 hover:shadow-2xl hover:shadow-purple-200/50 hover:-translate-y-3 transition-all duration-500"
                  >
                    <Link to={`/destinations/${dest.id}`} className="block">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={dest.photoUrl}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://picsum.photos/500/500'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-5 right-5 flex space-x-2">
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            className="w-10 h-10 bg-white/95 backdrop-blur rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-xl border border-white/50"
                          >
                            <span className="text-slate-400 hover:text-red-500 transition-colors text-sm font-bold">♡</span>
                          </button>
                        </div>
                      </div>
                    </Link>
                    <div className="p-6">
                      <Link to={`/destinations/${dest.id}`} className="block">
                        <h4 className="text-xl font-black text-slate-800 mb-3 group-hover:text-purple-700 transition-colors truncate tracking-tight">
                          {dest.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-4">
                          <span className="text-purple-500">📍</span>
                          <span className="font-semibold truncate">{dest.city}, {dest.country}</span>
                        </div>
                      </Link>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, starIdx) => (
                                <span key={starIdx} className={starIdx < 4 ? 'text-amber-400 text-sm drop-shadow-sm' : 'text-slate-200 text-sm'}>★</span>
                              ))}
                            </div>
                            <span className="text-sm font-black text-slate-700">4.{(i % 8) + 1}</span>
                          </div>
                        </div>
                        <Link
                          to="/trips/create"
                          state={{ destinationId: dest.id, destinationName: dest.name, photoUrl: dest.photoUrl }}
                          className="w-full flex items-center justify-center p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-purple-300/50 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                          ✈️ Create Trip
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Trips */}
          <div id="mytrips-section">
            {trips.length > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-11 h-11 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-200">
                    <span className="text-white text-xl">✈️</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">My Trips</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trips.map((trip) => (
                    <Link
                      key={trip.id}
                      to={`/trips/${trip.id}`}
                      className="group bg-white rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 hover:shadow-2xl hover:shadow-sky-200/40 hover:-translate-y-2 transition-all duration-500"
                    >
                      {trip.photoUrl && (
                        <div className="h-52 overflow-hidden">
                          <img
                            src={trip.photoUrl}
                            alt={trip.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                      )}
                      <div className="p-7">
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(trip.status)}`}>
                            {trip.status}
                          </span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-sky-700 transition-colors truncate tracking-tight">{trip.name}</h4>
                        {trip.description && <p className="text-slate-600 mb-5 line-clamp-2 text-sm leading-relaxed">{trip.description}</p>}
                        <div className="flex items-center text-sm font-semibold text-slate-500 pt-4 border-t border-slate-100">
                          <span className="mr-2 text-sky-500">📅</span>
                          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
