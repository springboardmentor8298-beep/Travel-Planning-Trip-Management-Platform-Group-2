import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDate, formatDateRange } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  Map, 
  DollarSign, 
  Users, 
  FileText, 
  BookOpen, 
  Plus, 
  Trash2, 
  Upload, 
  Luggage,
  Calendar,
  Wallet,
  Tag,
  Clock,
  ExternalLink
} from 'lucide-react';

const TripDetails = ({ activeTripId, setActivePage }) => {
  const { 
    trips, 
    addExpense, 
    deleteExpense, 
    addDocument, 
    deleteDocument, 
    updateTrip 
  } = useAppContext();

  // Selected sub-tab
  const [activeTab, setActiveTab] = useState('overview'); // overview, timeline, budget, travelers, documents, notes

  // Modal / Form input states
  const [expenseForm, setExpenseForm] = useState({ title: '', category: 'Transport', amount: '', date: '' });
  const [travelerForm, setTravelerForm] = useState({ name: '', email: '', role: 'Traveler' });
  const [docForm, setDocForm] = useState({ name: '', type: 'Ticket' });
  const [notesText, setNotesText] = useState('');
  const [hasUnsavedNotes, setHasUnsavedNotes] = useState(false);

  // Retrieve current trip from state
  const trip = trips.find(t => t.id === activeTripId);

  if (!trip) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center dark:bg-slate-900 dark:border-slate-800">
        <Luggage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Trip Not Found</h3>
        <p className="text-sm text-slate-400 mt-1">This trip may have been deleted or the link is invalid.</p>
        <button 
          onClick={() => setActivePage('trips')}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
        >
          Back to Trips
        </button>
      </div>
    );
  }

  // Pre-fill notes once loaded
  if (notesText === '' && trip.notes && !hasUnsavedNotes) {
    setNotesText(trip.notes);
  }

  // Statistics calculation
  const totalExp = trip.expenses ? trip.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  const remainingBudget = trip.budget - totalExp;
  const budgetPercentage = Math.min(Math.round((totalExp / trip.budget) * 100), 100);

  // Category Icons helper
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Transport': return 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400';
      case 'Lodging': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400';
      case 'Food': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
      case 'Activities': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
      default: return 'bg-slate-50 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400';
    }
  };

  // Add Expense trigger
  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) return;
    
    addExpense(trip.id, {
      title: expenseForm.title,
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      date: expenseForm.date || new Date().toISOString().split('T')[0]
    });
    setExpenseForm({ title: '', category: 'Transport', amount: '', date: '' });
  };

  // Add Traveler trigger
  const handleAddTravelerSubmit = (e) => {
    e.preventDefault();
    if (!travelerForm.name || !travelerForm.email) return;

    const newTraveler = {
      id: `trav-${Date.now()}`,
      name: travelerForm.name,
      email: travelerForm.email,
      role: travelerForm.role
    };

    const updatedTravelers = [...(trip.travelers || []), newTraveler];
    updateTrip(trip.id, { travelers: updatedTravelers });
    setTravelerForm({ name: '', email: '', role: 'Traveler' });
  };

  // Remove Traveler
  const handleRemoveTraveler = (travId) => {
    const updated = trip.travelers.filter(t => t.id !== travId);
    updateTrip(trip.id, { travelers: updated });
  };

  // Add Document upload
  const handleAddDocSubmit = (e) => {
    e.preventDefault();
    if (!docForm.name) return;

    addDocument(trip.id, {
      name: docForm.name.endsWith('.pdf') ? docForm.name : `${docForm.name}.pdf`,
      type: docForm.type,
      size: `${Math.floor(Math.random() * 800) + 50} KB`
    });
    setDocForm({ name: '', type: 'Ticket' });
  };

  // Save notes
  const handleSaveNotes = () => {
    updateTrip(trip.id, { notes: notesText });
    setHasUnsavedNotes(false);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => setActivePage('trips')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trip Manager</span>
        </button>

        <button
          onClick={() => {
            setActivePage('planner');
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-xs sm:text-sm font-semibold transition-colors dark:bg-indigo-950/40 dark:text-sky-400"
        >
          <Map className="w-4 h-4" />
          <span>Open Day Planner</span>
        </button>
      </div>

      {/* Hero card info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-tight">{trip.title}</h2>
          <p className="text-sm text-slate-450 dark:text-slate-550 mt-1 font-semibold">{trip.destination}</p>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
            <Calendar className="w-4 h-4" />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          </div>
        </div>

        {/* Dynamic Financial Quick Glance */}
        <div className="w-full md:w-72 bg-slate-50 rounded-xl p-4 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5 dark:text-slate-450">
            <span>Expenses: {formatCurrency(totalExp)}</span>
            <span>Budget: {formatCurrency(trip.budget)}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700">
            <div 
              className={`h-2 rounded-full ${budgetPercentage > 90 ? 'bg-rose-500' : 'bg-indigo-650'}`}
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium text-right">
            {remainingBudget >= 0 ? `${formatCurrency(remainingBudget)} remaining` : `${formatCurrency(Math.abs(remainingBudget))} over budget!`}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex overflow-x-auto gap-6 text-sm font-semibold">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'timeline', label: 'Timeline', icon: Clock },
          { id: 'budget', label: 'Budget & Expenses', icon: DollarSign },
          { id: 'travelers', label: 'Travelers', icon: Users },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'notes', label: 'Trip Notes', icon: BookOpen }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3.5 border-b-2 whitespace-nowrap transition-all duration-200 ${
                isActive 
                  ? 'border-indigo-600 text-indigo-600 dark:border-sky-400 dark:text-sky-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tabs content panels */}
      <div className="mt-4">
        
        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Quick Metrics */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-850">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-650 dark:text-sky-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">Remaining Funds</p>
                      <h4 className={`text-base font-extrabold ${remainingBudget < 0 ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
                        {formatCurrency(remainingBudget)}
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-650 dark:text-emerald-450">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">Travelers</p>
                      <h4 className="text-base font-extrabold text-slate-800 dark:text-white">
                        {trip.travelers ? trip.travelers.length : 0} Co-travelers
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Snip */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-850">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3">Important Notes Snapshot</h3>
                {trip.notes ? (
                  <p className="text-sm text-slate-500 dark:text-slate-450 whitespace-pre-line leading-relaxed">
                    {trip.notes}
                  </p>
                ) : (
                  <p className="text-xs text-slate-450 italic">No notes added. Head to the 'Trip Notes' tab to add advice or reminders.</p>
                )}
              </div>
            </div>

            {/* Sidebar info: Key Dates, Documents Count */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-850">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Trip Attachments</h3>
                {trip.documents && trip.documents.length > 0 ? (
                  <div className="space-y-3">
                    {trip.documents.slice(0, 3).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 dark:border-slate-800 last:border-0">
                        <span className="text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{doc.name}</span>
                        <span className="text-xs text-slate-400 font-semibold uppercase">{doc.type}</span>
                      </div>
                    ))}
                    <button 
                      onClick={() => setActiveTab('documents')}
                      className="w-full text-center text-xs text-indigo-650 hover:text-indigo-850 font-bold pt-2 dark:text-sky-400"
                    >
                      View all {trip.documents.length} attachments
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-450 italic text-center py-4">No documents uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE PANEL */}
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white m-0">Daily Schedule</h3>
              <button
                onClick={() => setActivePage('planner')}
                className="text-xs font-bold text-indigo-650 hover:text-indigo-850 dark:text-sky-400"
              >
                Go to Drag & Drop Planner &rarr;
              </button>
            </div>

            {(!trip.itinerary || trip.itinerary.length === 0) ? (
              <div className="text-center py-10">
                <Map className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-semibold">No itinerary days planned yet.</p>
                <button
                  onClick={() => setActivePage('planner')}
                  className="mt-3 text-xs bg-indigo-50 text-indigo-650 font-semibold px-3 py-1.5 rounded-xl hover:bg-indigo-100"
                >
                  Create Itinerary
                </button>
              </div>
            ) : (
              <div className="space-y-8 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                {trip.itinerary.map((dayPlan) => (
                  <div key={dayPlan.day} className="relative pl-10">
                    {/* Day marker node */}
                    <div className="absolute left-1.5 top-1.5 w-6 h-6 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center border-4 border-white dark:border-slate-900 shadow">
                      {dayPlan.day}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-base font-bold text-slate-800 dark:text-white">Day {dayPlan.day}</h4>
                        <span className="text-xs text-slate-400 font-semibold">{formatDate(dayPlan.date)}</span>
                      </div>

                      {(!dayPlan.activities || dayPlan.activities.length === 0) ? (
                        <p className="text-xs text-slate-400 italic">No activities scheduled for this day.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {dayPlan.activities.map((activity) => (
                            <div 
                              key={activity.id} 
                              className="bg-slate-50 p-4 rounded-xl border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800/80 flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-indigo-600 dark:text-sky-400 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {activity.time}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase">
                                    {activity.type}
                                  </span>
                                </div>
                                <h5 className="text-sm font-extrabold text-slate-800 dark:text-white mt-1.5">{activity.title}</h5>
                                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400 leading-normal">{activity.description}</p>
                              </div>
                              {activity.cost > 0 && (
                                <div className="mt-3 text-xs font-bold text-slate-600 dark:text-slate-400 border-t border-slate-200/50 pt-2 dark:border-slate-850">
                                  Cost: {formatCurrency(activity.cost)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BUDGET PANEL */}
        {activeTab === 'budget' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Expenses List */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Logged Expenses</h3>
              
              {(!trip.expenses || trip.expenses.length === 0) ? (
                <p className="text-xs text-slate-450 italic text-center py-8">No expenses logged yet. Fill out the form to add one.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider dark:border-slate-800">
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3 text-right">Amount</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {trip.expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="py-3 font-semibold text-slate-800 dark:text-white">{exp.title}</td>
                          <td className="py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryColor(exp.category)}`}>
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3 text-xs text-slate-400">{formatDate(exp.date)}</td>
                          <td className="py-3 text-right font-bold text-slate-700 dark:text-slate-350">{formatCurrency(exp.amount)}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => deleteExpense(trip.id, exp.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Log New Expense Form */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 h-fit">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Log Expense</h3>
              <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expense Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lunch at Trattoria"
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350"
                  >
                    <option value="Transport">Transport</option>
                    <option value="Lodging">Lodging</option>
                    <option value="Food">Food</option>
                    <option value="Activities">Activities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="50"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</label>
                    <input
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-sm font-semibold shadow transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Expense</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TRAVELERS PANEL */}
        {activeTab === 'travelers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Travelers list */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Group Members</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(trip.travelers || []).map((trav) => (
                  <div 
                    key={trav.id}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-xl dark:bg-slate-800/40 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{trav.name}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          trav.role === 'Organizer' 
                            ? 'bg-indigo-50 text-indigo-755 dark:bg-indigo-950/40 dark:text-sky-400' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {trav.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">{trav.email}</p>
                    </div>

                    {trav.role !== 'Organizer' && (
                      <button
                        onClick={() => handleRemoveTraveler(trav.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Remove Traveler"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Invite Traveler Form */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 h-fit">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Invite Traveler</h3>
              <form onSubmit={handleAddTravelerSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aria Chen"
                    value={travelerForm.name}
                    onChange={(e) => setTravelerForm({...travelerForm, name: e.target.value})}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="aria@company.com"
                    value={travelerForm.email}
                    onChange={(e) => setTravelerForm({...travelerForm, email: e.target.value})}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role</label>
                  <select
                    value={travelerForm.role}
                    onChange={(e) => setTravelerForm({...travelerForm, role: e.target.value})}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350"
                  >
                    <option value="Traveler">Traveler</option>
                    <option value="Organizer">Organizer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white text-sm font-semibold shadow transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Invite Traveler</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DOCUMENTS PANEL */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Documents list */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Uploaded Travel Documents</h3>
              
              {(!trip.documents || trip.documents.length === 0) ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl dark:border-slate-800">
                  <FileText className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                  <p className="text-xs text-slate-450 italic">No files attached to this journey yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trip.documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-xl dark:bg-slate-800/40 dark:border-slate-800 flex items-start justify-between"
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-655 dark:bg-indigo-950/30 dark:text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white truncate max-w-[160px] sm:max-w-[200px]" title={doc.name}>
                            {doc.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-semibold">
                            <span>{doc.size}</span>
                            <span>&bull;</span>
                            <span className="uppercase">{doc.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <button
                          onClick={() => deleteDocument(trip.id, doc.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Mock Document Form */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 h-fit">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Attach Document</h3>
              <form onSubmit={handleAddDocSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flight_Tickets_Jul05"
                    value={docForm.name}
                    onChange={(e) => setDocForm({...docForm, name: e.target.value})}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Type</label>
                  <select
                    value={docForm.type}
                    onChange={(e) => setDocForm({...docForm, type: e.target.value})}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350"
                  >
                    <option value="Ticket">Ticket</option>
                    <option value="Hotel Booking">Hotel Booking</option>
                    <option value="Passport">Passport</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white text-sm font-semibold shadow transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* NOTES PANEL */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Trip Notes</h3>
                <p className="text-xs text-slate-400 mt-0.5">Keep track of flight rules, packing tips, or emergency instructions.</p>
              </div>
              
              {hasUnsavedNotes && (
                <span className="text-xs text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-lg">
                  Unsaved Changes
                </span>
              )}
            </div>

            <textarea
              value={notesText}
              onChange={(e) => {
                setNotesText(e.target.value);
                setHasUnsavedNotes(true);
              }}
              rows="12"
              placeholder="Start drafting travel rules, reservations notes, emergency contacts, local details..."
              className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white leading-relaxed font-mono"
            />

            <div className="flex justify-end gap-3">
              <button
                disabled={!hasUnsavedNotes}
                onClick={() => {
                  setNotesText(trip.notes || '');
                  setHasUnsavedNotes(false);
                }}
                className="px-4 py-2 text-sm border border-slate-200 rounded-xl font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-750 dark:text-slate-400 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Discard
              </button>
              <button
                disabled={!hasUnsavedNotes}
                onClick={handleSaveNotes}
                className="px-4 py-2 text-sm bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl font-semibold shadow disabled:opacity-40 transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default TripDetails;
