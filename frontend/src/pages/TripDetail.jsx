import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const EXPENSE_CATEGORIES = ['Accommodation', 'Transportation', 'Food', 'Activities', 'Other'];

const COLLABORATORS_SEED = [
  { id: 1, name: 'Jane Traveler', email: 'traveler@tripnest.com', role: 'Owner', avatar: 'JT', color: 'from-purple-500 to-indigo-600' },
  { id: 2, name: 'John Doe', email: 'john@example.com', role: 'Editor', avatar: 'JD', color: 'from-sky-500 to-cyan-600' },
  { id: 3, name: 'Alice Smith', email: 'alice@example.com', role: 'Viewer', avatar: 'AS', color: 'from-emerald-500 to-teal-600' },
];

const DOCUMENTS_SEED = [
  { id: 1, name: 'Flight_Booking_Confirmation.pdf', type: 'PDF', size: '245 KB', uploadedBy: 'Jane Traveler', uploadedAt: '2024-01-15' },
  { id: 2, name: 'Hotel_Reservation.pdf', type: 'PDF', size: '180 KB', uploadedBy: 'Jane Traveler', uploadedAt: '2024-01-16' },
  { id: 3, name: 'Travel_Insurance.jpg', type: 'Image', size: '1.2 MB', uploadedBy: 'John Doe', uploadedAt: '2024-01-17' },
];

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  const [budget, setBudget] = useState(null);
  const [budgetForm, setBudgetForm] = useState({ accommodation: '', transportation: '', food: '', activities: '', other: '', currency: 'USD' });
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetMsg, setBudgetMsg] = useState('');

  const [expenses, setExpenses] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: 'Food', description: '', amount: '', currency: 'USD', expenseDate: new Date().toISOString().split('T')[0], isPaid: true });
  const [expenseLoading, setExpenseLoading] = useState(false);

  const [collaborators, setCollaborators] = useState(COLLABORATORS_SEED);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');
  const [inviteMsg, setInviteMsg] = useState('');

  const [documents, setDocuments] = useState(DOCUMENTS_SEED);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetchTrip();
    fetchBudget();
    fetchExpenses();
    fetchNotifications();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudget = async () => {
    try {
      const response = await api.get(`/budgets/trip/${id}`);
      setBudget(response.data);
      if (response.data) {
        setBudgetForm({
          accommodation: response.data.accommodation || '',
          transportation: response.data.transportation || '',
          food: response.data.food || '',
          activities: response.data.activities || '',
          other: response.data.other || '',
          currency: response.data.currency || 'USD'
        });
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await api.get(`/expenses/trip/${id}`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const [notifRes, unreadRes] = await Promise.all([
        api.get('/notifications').catch(() => ({ data: [] })),
        api.get('/notifications/unread-count').catch(() => ({ data: { count: 0 } }))
      ]);
      setNotifications(notifRes.data || []);
      setUnread(unreadRes.data?.count || 0);
    } catch (e) { /* ignore */ }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setBudgetLoading(true);
    setBudgetMsg('');
    try {
      const payload = {
        tripId: Number(id),
        accommodation: budgetForm.accommodation ? Number(budgetForm.accommodation) : 0,
        transportation: budgetForm.transportation ? Number(budgetForm.transportation) : 0,
        food: budgetForm.food ? Number(budgetForm.food) : 0,
        activities: budgetForm.activities ? Number(budgetForm.activities) : 0,
        other: budgetForm.other ? Number(budgetForm.other) : 0,
        currency: budgetForm.currency
      };
      const response = await api.post('/budgets', payload);
      setBudget(response.data);
      setBudgetMsg('Budget saved successfully!');
    } catch (error) {
      console.error('Error saving budget:', error);
      setBudgetMsg('Failed to save budget: ' + (error.response?.data?.message || error.message));
    } finally {
      setBudgetLoading(false);
      setTimeout(() => setBudgetMsg(''), 4000);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setExpenseLoading(true);
    try {
      const payload = {
        tripId: Number(id),
        budgetId: budget?.id || null,
        category: expenseForm.category,
        description: expenseForm.description || `${expenseForm.category} expense`,
        amount: Number(expenseForm.amount),
        currency: expenseForm.currency,
        expenseDate: expenseForm.expenseDate,
        isPaid: expenseForm.isPaid
      };
      await api.post('/expenses', payload);
      setShowExpenseModal(false);
      setExpenseForm({ category: 'Food', description: '', amount: '', currency: 'USD', expenseDate: new Date().toISOString().split('T')[0], isPaid: true });
      fetchExpenses();
      fetchBudget();

      try {
        await api.post('/notifications/user/1', {
          type: 'EXPENSE',
          title: 'New Expense Added',
          message: `$${payload.amount} ${payload.currency} - ${payload.category}: ${payload.description}`,
          tripId: Number(id)
        }).catch(() => {});
      } catch (e) { /* ignore */ }
      fetchNotifications();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense: ' + (error.response?.data?.message || error.message));
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      fetchExpenses();
      fetchBudget();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteMsg('');
    try {
      const newCollab = {
        id: Date.now(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        avatar: inviteEmail.substring(0, 2).toUpperCase(),
        color: 'from-pink-500 to-rose-600'
      };
      setCollaborators([...collaborators, newCollab]);

      try {
        await api.post('/notifications/user/1', {
          type: 'COLLABORATION',
          title: 'New Collaborator Invited',
          message: `${inviteEmail} was invited as ${inviteRole}`,
          tripId: Number(id)
        }).catch(() => {});
      } catch (e) { /* ignore */ }
      fetchNotifications();

      setInviteMsg(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail('');
      setTimeout(() => setInviteMsg(''), 4000);
    } catch (error) {
      setInviteMsg('Failed to send invitation.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newDoc = {
        id: Date.now(),
        name: file.name,
        type: file.type.includes('image') ? 'Image' : file.name.endsWith('.pdf') ? 'PDF' : 'File',
        size: (file.size / 1024).toFixed(0) + ' KB',
        uploadedBy: `${user?.firstName} ${user?.lastName}`,
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      setDocuments([...documents, newDoc]);
      setUploadMsg(`"${file.name}" uploaded successfully!`);

      try {
        await api.post('/notifications/user/1', {
          type: 'DOCUMENT',
          title: 'Document Uploaded',
          message: `${file.name} was uploaded to the trip`,
          tripId: Number(id)
        }).catch(() => {});
      } catch (e) { /* ignore */ }
      fetchNotifications();
    } catch (error) {
      setUploadMsg('Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
      setTimeout(() => setUploadMsg(''), 4000);
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

  const getTotalSpent = () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const getSpentByCategory = (cat) => expenses.filter(e => e.category === cat).reduce((sum, e) => sum + (e.amount || 0), 0);

  const getBudgetPct = (cat) => {
    const budgetCat = cat === 'Total' ? budget?.totalAmount : budget?.[cat.toLowerCase()];
    const spent = cat === 'Total' ? getTotalSpent() : getSpentByCategory(cat);
    if (!budgetCat || budgetCat === 0) return 0;
    return Math.min(100, Math.round((spent / budgetCat) * 100));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
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
          <Link to="/dashboard" className="text-sky-600 font-semibold hover:underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'budget', label: 'Budget & Expenses', icon: '💰' },
    { id: 'collaborators', label: 'Collaboration', icon: '👥' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

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
              <Link to="/destinations" className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200">🗺️ Destinations</Link>
              <Link to="/dashboard" className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200">📊 Dashboard</Link>
              <button
                onClick={handleDeleteTrip}
                className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
              >
                🗑️ Delete Trip
              </button>
              <div className="text-right">
                <p className="text-base font-bold text-gray-800">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{user.role}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <button onClick={logout} className="px-5 py-2 text-sm font-semibold text-gray-700 bg-slate-100 rounded-xl hover:bg-slate-200">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 mb-8">
          {(trip.destinationPhotoUrl || trip.photoUrl) && (
            <div className="h-64 overflow-hidden relative">
              <img src={trip.destinationPhotoUrl || trip.photoUrl} alt={trip.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </div>
          )}
          <div className="p-8">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(trip.status)}`}>
                    {trip.status?.charAt(0).toUpperCase() + trip.status?.slice(1)}
                  </span>
                  {trip.destinationName && (
                    <span className="px-4 py-2 rounded-full text-sm font-bold bg-sky-100 text-sky-800 flex items-center">
                      📍 {trip.destinationName}
                      {trip.destinationLocation && <span className="ml-2 opacity-75">({trip.destinationLocation})</span>}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{trip.name || trip.title}</h1>
                {trip.description && <p className="text-xl text-gray-600 mb-4">{trip.description}</p>}
                <div className="flex flex-wrap items-center gap-6 text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
                  </div>
                  {budget && (
                    <div className="flex items-center">
                      <span className="mr-2">💰</span>
                      <span className="font-bold">Budget: {budget.currency} {Number(budget.totalAmount).toLocaleString()}</span>
                      <span className="mx-2 text-slate-300">|</span>
                      <span className={getTotalSpent() > budget.totalAmount ? 'font-bold text-red-600' : 'font-bold text-emerald-600'}>
                        Spent: {budget.currency} {getTotalSpent().toLocaleString()} ({getBudgetPct('Total')}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1 -mb-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`px-5 py-3 rounded-t-2xl font-bold text-sm transition-all ${
                    activeSection === s.id
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg -mb-0.5'
                      : 'text-slate-500 hover:text-sky-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="mr-2">{s.icon}</span>{s.label}
                  {s.id === 'notifications' && unread > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">{unread > 9 ? '9+' : unread}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">📌</span>Trip Summary
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-5 bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl">
                    <p className="text-sm font-bold text-slate-500 uppercase mb-1">Destination</p>
                    <p className="text-xl font-bold text-slate-800">{trip.destinationName || 'Not set'}</p>
                    <p className="text-sm text-slate-500">{trip.destinationLocation || ''}</p>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                    <p className="text-sm font-bold text-slate-500 uppercase mb-1">Duration</p>
                    <p className="text-xl font-bold text-slate-800">
                      {Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                    </p>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl">
                    <p className="text-sm font-bold text-slate-500 uppercase mb-1">Total Expenses</p>
                    <p className="text-xl font-bold text-slate-800">{expenses.length}</p>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                    <p className="text-sm font-bold text-slate-500 uppercase mb-1">Collaborators</p>
                    <p className="text-xl font-bold text-slate-800">{collaborators.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-extrabold text-gray-900 flex items-center">
                    <span className="mr-3">📝</span>Recent Expenses
                  </h3>
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="px-5 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
                  >
                    ➕ Add Expense
                  </button>
                </div>
                {expenses.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="text-5xl mb-4 opacity-40">💸</div>
                    <p className="text-slate-600 font-semibold mb-2">No expenses yet</p>
                    <p className="text-slate-500 text-sm">Start tracking your trip spending by adding your first expense</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.slice(0, 5).map((exp) => (
                      <div key={exp.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${
                            exp.category === 'Accommodation' ? 'bg-indigo-100 text-indigo-700' :
                            exp.category === 'Transportation' ? 'bg-sky-100 text-sky-700' :
                            exp.category === 'Food' ? 'bg-amber-100 text-amber-700' :
                            exp.category === 'Activities' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {exp.category?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{exp.description}</p>
                            <p className="text-sm text-slate-500">
                              {exp.category} • {new Date(exp.expenseDate).toLocaleDateString()}
                              {exp.isPaid && <span className="ml-2 text-emerald-600">✓ Paid</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-xl font-black text-slate-800">{exp.currency} {Number(exp.amount).toLocaleString()}</span>
                          <button onClick={() => handleDeleteExpense(exp.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">👥</span>Your Team
                </h3>
                <div className="space-y-4">
                  {collaborators.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all">
                      <div className="flex items-center space-x-3">
                        <div className={`w-11 h-11 bg-gradient-to-br ${c.color} rounded-xl flex items-center justify-center shadow-md`}>
                          <span className="text-white font-black text-sm">{c.avatar}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setActiveSection('collaborators')}
                    className="w-full text-center py-3 text-sky-600 font-bold bg-sky-50 rounded-2xl hover:bg-sky-100 transition-all text-sm"
                  >
                    Manage all collaborators →
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-sky-600 rounded-3xl p-8 shadow-2xl text-white">
                <h3 className="text-2xl font-extrabold mb-3">💡 Milestone 3 Features</h3>
                <ul className="space-y-3 mb-6 text-white/90 text-sm">
                  <li className="flex items-start"><span className="mr-2">✅</span>Budget Management (Categories)</li>
                  <li className="flex items-start"><span className="mr-2">✅</span>Expense Tracking (Add/Delete)</li>
                  <li className="flex items-start"><span className="mr-2">✅</span>Group Collaboration (Invite/Manage)</li>
                  <li className="flex items-start"><span className="mr-2">✅</span>Real-time Notifications</li>
                  <li className="flex items-start"><span className="mr-2">✅</span>Document Upload System</li>
                </ul>
                <p className="text-xs text-white/70">Navigate through the tabs above to explore each feature.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'budget' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2 flex items-center">
                <span className="mr-3">🎯</span>Set Budget
              </h3>
              <p className="text-slate-500 mb-6">Define your trip budget by category. Totals will calculate automatically.</p>
              <form onSubmit={handleSaveBudget} className="space-y-5">
                {['Accommodation', 'Transportation', 'Food', 'Activities', 'Other'].map((cat) => (
                  <div key={cat}>
                    <label className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                      <span>{cat}</span>
                      {budget && (
                        <span className={getBudgetPct(cat) >= 100 ? 'text-red-600' : 'text-slate-500'}>
                          Spent: {budget.currency} {getSpentByCategory(cat).toLocaleString()} ({getBudgetPct(cat)}%)
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={`Enter ${cat.toLowerCase()} budget`}
                      value={budgetForm[cat.toLowerCase()]}
                      onChange={(e) => setBudgetForm({ ...budgetForm, [cat.toLowerCase()]: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                    />
                    {budget && Number(budgetForm[cat.toLowerCase()]) > 0 && (
                      <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            getBudgetPct(cat) >= 100 ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                            getBudgetPct(cat) >= 80 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                            'bg-gradient-to-r from-emerald-500 to-teal-600'
                          }`}
                          style={{ width: `${getBudgetPct(cat)}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Currency</label>
                  <select
                    value={budgetForm.currency}
                    onChange={(e) => setBudgetForm({ ...budgetForm, currency: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                  >
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                    <option value="GBP">GBP — British Pound (£)</option>
                    <option value="INR">INR — Indian Rupee (₹)</option>
                    <option value="JPY">JPY — Japanese Yen (¥)</option>
                    <option value="AUD">AUD — Australian Dollar (A$)</option>
                  </select>
                </div>

                {budgetMsg && (
                  <div className={`p-4 rounded-xl ${budgetMsg.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'} font-semibold text-sm`}>
                    {budgetMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={budgetLoading}
                  className="w-full py-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50"
                >
                  {budgetLoading ? 'Saving...' : '💾 Save Budget'}
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-extrabold text-gray-900 flex items-center">
                    <span className="mr-3">💸</span>Expenses ({expenses.length})
                  </h3>
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
                  >
                    ➕ Add
                  </button>
                </div>

                {!budget && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
                    💡 <strong>Tip:</strong> Set a budget first to track spending against category limits.
                  </div>
                )}

                {budget && (
                  <div className="mb-8 p-6 bg-gradient-to-br from-slate-50 to-sky-50 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-sm font-bold text-slate-500 uppercase">Total Usage</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {budget.currency} {getTotalSpent().toLocaleString()} of {budget.currency} {Number(budget.totalAmount).toLocaleString()}
                        </p>
                      </div>
                      <p className={`text-3xl font-black ${getBudgetPct('Total') >= 100 ? 'text-red-600' : getBudgetPct('Total') >= 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {getBudgetPct('Total')}%
                      </p>
                    </div>
                    <div className="h-4 bg-white rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          getBudgetPct('Total') >= 100 ? 'bg-gradient-to-r from-red-500 via-rose-500 to-pink-600' :
                          getBudgetPct('Total') >= 80 ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500' :
                          'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
                        }`}
                        style={{ width: `${getBudgetPct('Total')}%` }}
                      />
                    </div>
                    {getBudgetPct('Total') >= 100 && (
                      <p className="mt-3 text-sm font-bold text-red-600">⚠️ Over budget by {budget.currency} {(getTotalSpent() - Number(budget.totalAmount)).toLocaleString()}</p>
                    )}
                  </div>
                )}

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {expenses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4 opacity-40">💰</div>
                      <p className="text-slate-600 font-semibold">No expenses yet</p>
                      <p className="text-slate-500 text-sm mt-1">Click "Add" above to start tracking</p>
                    </div>
                  ) : (
                    expenses.map((exp) => (
                      <div key={exp.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:shadow-md transition-all">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center font-black ${
                            exp.category === 'Accommodation' ? 'bg-indigo-100 text-indigo-700' :
                            exp.category === 'Transportation' ? 'bg-sky-100 text-sky-700' :
                            exp.category === 'Food' ? 'bg-amber-100 text-amber-700' :
                            exp.category === 'Activities' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {exp.category?.[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{exp.description}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                              <span className="px-2 py-0.5 bg-white rounded-full font-semibold">{exp.category}</span>
                              <span>{new Date(exp.expenseDate).toLocaleDateString()}</span>
                              {exp.isPaid && <span className="text-emerald-600 font-bold">✓ PAID</span>}
                              {!exp.isPaid && <span className="text-amber-600 font-bold">⏳ UNPAID</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                          <span className="text-lg font-black text-slate-800 whitespace-nowrap">
                            {exp.currency} {Number(exp.amount).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                            title="Delete expense"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {expenses.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-center">
                    <p className="font-bold text-slate-600">Total Spent</p>
                    <p className="text-2xl font-black text-slate-800">
                      {budget?.currency || 'USD'} {getTotalSpent().toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'collaborators' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2 flex items-center">
                <span className="mr-3">📨</span>Invite Collaborator
              </h3>
              <p className="text-slate-500 mb-6">Invite others to plan this trip together.</p>
              <form onSubmit={handleInvite} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                  >
                    <option value="Owner">Owner — Full access & permissions</option>
                    <option value="Editor">Editor — Can edit trip & add expenses</option>
                    <option value="Viewer">Viewer — Can only view trip details</option>
                  </select>
                </div>
                {inviteMsg && (
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-sm">
                    ✅ {inviteMsg}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-500 via-indigo-600 to-sky-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  📧 Send Invitation
                </button>
              </form>

              <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                <h4 className="font-black text-purple-900 mb-3">🔄 Collaboration Workflow</h4>
                <ol className="space-y-2 text-sm text-purple-800/80">
                  <li className="flex"><span className="mr-2 font-black">1.</span>Invite members via email</li>
                  <li className="flex"><span className="mr-2 font-black">2.</span>Assign roles (Owner/Editor/Viewer)</li>
                  <li className="flex"><span className="mr-2 font-black">3.</span>Share expenses and itineraries</li>
                  <li className="flex"><span className="mr-2 font-black">4.</span>Real-time notifications for updates</li>
                  <li className="flex"><span className="mr-2 font-black">5.</span>Upload & share trip documents</li>
                </ol>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">👥</span>Team Members ({collaborators.length})
              </h3>
              <div className="space-y-4">
                {collaborators.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${c.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-black">{c.avatar}</span>
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-lg">{c.name}</p>
                        <p className="text-sm text-slate-500">{c.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide ${
                        c.role === 'Owner' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md' :
                        c.role === 'Editor' ? 'bg-sky-100 text-sky-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {c.role}
                      </span>
                      {c.role !== 'Owner' && (
                        <button
                          onClick={() => setCollaborators(collaborators.filter(x => x.id !== c.id))}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                          title="Remove collaborator"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2 flex items-center">
                <span className="mr-3">☁️</span>Upload Documents
              </h3>
              <p className="text-slate-500 mb-6">Share and organize trip documents (bookings, tickets, insurance, etc.)</p>

              <label className={`border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all block ${uploading ? 'bg-sky-50 border-sky-300' : 'bg-slate-50 border-slate-300 hover:bg-sky-50 hover:border-sky-400'}`}>
                <input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                <div className={`w-20 h-20 mx-auto mb-5 rounded-3xl flex items-center justify-center ${uploading ? 'bg-sky-100 animate-pulse' : 'bg-gradient-to-br from-sky-100 to-indigo-100'}`}>
                  {uploading ? (
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent"></div>
                  ) : (
                    <svg className="w-10 h-10 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                  )}
                </div>
                <p className="font-black text-slate-800 text-lg mb-1">
                  {uploading ? 'Uploading your file...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-slate-500 text-sm">PDFs, Images, Tickets, Confirmations — Max 25MB per file</p>
              </label>

              {uploadMsg && (
                <div className={`mt-6 p-4 rounded-2xl ${uploadMsg.includes('successfully') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'} font-semibold text-sm`}>
                  ✅ {uploadMsg}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">📁</span>Trip Documents ({documents.length})
              </h3>
              <div className="space-y-3">
                {documents.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4 opacity-40">📄</div>
                    <p className="text-slate-600 font-semibold">No documents yet</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 hover:shadow-md transition-all group">
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                          doc.type === 'PDF' ? 'bg-gradient-to-br from-red-100 to-rose-200 text-red-700' :
                          doc.type === 'Image' ? 'bg-gradient-to-br from-sky-100 to-cyan-200 text-sky-700' :
                          'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700'
                        }`}>
                          <span className="font-black text-xs">{doc.type}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 truncate max-w-[250px]">{doc.name}</p>
                          <p className="text-xs text-slate-500">
                            {doc.size} • Added {doc.uploadedAt} by {doc.uploadedBy}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-sky-600 hover:bg-sky-100 rounded-xl transition-all" title="View">👁️</button>
                        <button className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all" title="Download">⬇️</button>
                        <button
                          onClick={() => setDocuments(documents.filter(d => d.id !== doc.id))}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                          title="Delete"
                        >🗑️</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-extrabold text-gray-900 flex items-center">
                <span className="mr-3">🔔</span>Trip Notifications
                {unread > 0 && <span className="ml-3 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-black">{unread} unread</span>}
              </h3>
              {unread > 0 && (
                <button
                  onClick={async () => {
                    try { await api.put('/notifications/read-all'); fetchNotifications(); } catch (e) { /* ignore */ }
                  }}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-700 transition-all text-sm"
                >
                  ✓ Mark all as read
                </button>
              )}
            </div>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="text-6xl mb-4 opacity-40">🔕</div>
                  <p className="text-slate-600 font-semibold text-lg mb-1">All caught up!</p>
                  <p className="text-slate-500">You'll see notifications here as you interact with this trip.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start space-x-4 p-5 rounded-2xl transition-all ${
                      !n.isRead ? 'bg-gradient-to-r from-sky-50 to-indigo-50 border-2 border-sky-200 shadow-md' : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
                      n.type === 'EXPENSE' ? 'bg-amber-100' :
                      n.type === 'COLLABORATION' ? 'bg-purple-100' :
                      n.type === 'DOCUMENT' ? 'bg-sky-100' :
                      n.type === 'BUDGET' ? 'bg-emerald-100' :
                      'bg-slate-200'
                    }`}>
                      {n.type === 'EXPENSE' && '💸'}
                      {n.type === 'COLLABORATION' && '👥'}
                      {n.type === 'DOCUMENT' && '📄'}
                      {n.type === 'BUDGET' && '💰'}
                      {(!n.type || n.type === 'INFO') && 'ℹ️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-black text-slate-800">{n.title}</p>
                        {!n.isRead && <span className="w-3 h-3 bg-sky-500 rounded-full flex-shrink-0 ml-3 mt-1.5"></span>}
                      </div>
                      <p className="text-slate-600 text-sm">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-extrabold text-gray-900">➕ Add New Expense</h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all"
              >✕</button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Category *</label>
                <div className="grid grid-cols-3 gap-3">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setExpenseForm({ ...expenseForm, category: cat })}
                      className={`p-4 rounded-2xl font-bold text-sm transition-all border-2 ${
                        expenseForm.category === cat
                          ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white border-transparent shadow-lg scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                      }`}
                    >
                      {cat === 'Accommodation' && '🏨 '}
                      {cat === 'Transportation' && '🚗 '}
                      {cat === 'Food' && '🍽️ '}
                      {cat === 'Activities' && '🎯 '}
                      {cat === 'Other' && '📦 '}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder={`e.g., ${expenseForm.category} at...`}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Amount *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all text-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Currency</label>
                  <select
                    value={expenseForm.currency}
                    onChange={(e) => setExpenseForm({ ...expenseForm, currency: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="AUD">AUD (A$)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={expenseForm.expenseDate}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                    min={trip?.startDate}
                    max={trip?.endDate}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                  <select
                    value={expenseForm.isPaid ? 'paid' : 'unpaid'}
                    onChange={(e) => setExpenseForm({ ...expenseForm, isPaid: e.target.value === 'paid' })}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                  >
                    <option value="paid">✅ Paid</option>
                    <option value="unpaid">⏳ Unpaid</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-4 text-lg font-bold text-gray-700 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expenseLoading}
                  className="flex-1 py-4 text-lg font-black text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {expenseLoading ? 'Adding...' : '💾 Add Expense'}
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
