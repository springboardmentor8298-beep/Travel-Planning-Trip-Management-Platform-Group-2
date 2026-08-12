import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CurrencyContext } from '../context/CurrencyContext';
import { TripMap } from '../components/TripMap';
import {
  Calendar, MapPin, IndianRupee, Users, FileText, MessageSquare, Clock, Plus,
  Trash2, Upload, Download, AlertTriangle, ArrowLeft, Send, CheckCircle, Tag,
  CreditCard, CheckCheck, RefreshCw, Layers, Edit
} from 'lucide-react';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export const TripDetail = () => {
  const { user } = useContext(AuthContext);
  const { formatAmount, currencySymbol } = useContext(CurrencyContext);
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [loading, setLoading] = useState(true);

  // Sub-modules state
  const [activities, setActivities] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [settlements, setSettlements] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [members, setMembers] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Modals & Inputs
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [docCategory, setDocCategory] = useState('Ticket');
  const [actDay, setActDay] = useState(1);
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actCategory, setActCategory] = useState('Sightseeing');
  const [actPlace, setActPlace] = useState('');
  const [actCost, setActCost] = useState('');

  // Expense Form State
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Food');
  const [expPaidBy, setExpPaidBy] = useState('Organizer');

  // Settlement Form State
  const [settlePayer, setSettlePayer] = useState('');
  const [settlePayee, setSettlePayee] = useState('');
  const [settleAmount, setSettleAmount] = useState('');
  const [settleMethod, setSettleMethod] = useState('UPI / GPay');
  const [settleNotes, setSettleNotes] = useState('');

  // Trip Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editDestination, setEditDestination] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editStatus, setEditStatus] = useState('PLANNED');
  const [editNotes, setEditNotes] = useState('');

  // Discussion & Member Form State
  const [newMessage, setNewMessage] = useState('');
  const [inviteInput, setInviteInput] = useState('');

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  useEffect(() => {
    if (trip) {
      if (activeTab === 'itinerary') fetchActivities();
      if (activeTab === 'expenses') fetchExpenses();
      if (activeTab === 'collaboration') {
        fetchDiscussions();
        fetchMembers();
      }
      if (activeTab === 'documents') fetchDocuments();
    }
  }, [trip, activeTab]);

  const fetchTripDetails = async () => {
    try {
      const res = await api.get(`/trips/${id}`);
      setTrip(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get(`/trips/${id}/activities`);
      setActivities(res.data);
    } catch (e) {}
  };

  const fetchExpenses = async () => {
    try {
      const res = await api.get(`/trips/${id}/expenses`);
      setExpenses(res.data);
      const sumRes = await api.get(`/trips/${id}/expenses/summary`);
      setExpenseSummary(sumRes.data);
      const setRes = await api.get(`/trips/${id}/expenses/settlements`);
      setSettlements(setRes.data);
    } catch (e) {}
  };

  const fetchDiscussions = async () => {
    try {
      const res = await api.get(`/trips/${id}/group/discussions`);
      setDiscussions(res.data);
    } catch (e) {}
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/trips/${id}/group/members`);
      setMembers(res.data);
    } catch (e) {}
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/trips/${id}/documents`);
      setDocuments(res.data);
    } catch (e) {}
  };

  // Edit Trip Handlers
  const handleOpenEditModal = () => {
    setEditTitle(trip?.title || '');
    setEditDestination(trip?.destination || '');
    setEditStartDate(trip?.startDate || '');
    setEditEndDate(trip?.endDate || '');
    setEditBudget(trip?.totalBudget || trip?.budget || '');
    setEditStatus(trip?.status || 'PLANNED');
    setEditNotes(trip?.notes || '');
    setShowEditModal(true);
  };

  const handleUpdateTrip = async (e) => {
    e.preventDefault();
    if (!editBudget || parseFloat(editBudget) <= 0) {
      alert("Target budget is required!");
      return;
    }
    try {
      await api.put(`/trips/${id}`, {
        ...trip,
        title: editTitle,
        destination: editDestination,
        startDate: editStartDate,
        endDate: editEndDate,
        totalBudget: parseFloat(editBudget),
        budget: parseFloat(editBudget),
        status: editStatus,
        notes: editNotes
      });
      setShowEditModal(false);
      fetchTripDetails();
      window.dispatchEvent(new Event('trip_updated'));
      alert('Trip details updated successfully!');
    } catch (err) {
      alert('Failed to update trip details');
    }
  };

  // Activity Handlers
  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/trips/${id}/activities`, {
        dayNumber: parseInt(actDay),
        title: actTitle,
        description: actDesc,
        category: actCategory,
        placeName: actPlace,
        cost: parseFloat(actCost || 0),
      });
      setShowActivityModal(false);
      setActTitle('');
      setActDesc('');
      setActPlace('');
      setActCost('');
      fetchActivities();
    } catch (e) {
      alert('Failed to add activity');
    }
  };

  const handleDeleteActivity = async (actId) => {
    try {
      await api.delete(`/trips/${id}/activities/${actId}`);
      fetchActivities();
    } catch (e) {}
  };

  // Expense Handlers
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/trips/${id}/expenses`, {
        title: expTitle,
        amount: parseFloat(expAmount || 0),
        category: expCategory,
        paidBy: expPaidBy,
      });
      setShowExpenseModal(false);
      setExpTitle('');
      setExpAmount('');
      fetchExpenses();
      fetchTripDetails();
    } catch (e) {
      alert('Failed to add expense');
    }
  };

  const handleDeleteExpense = async (expId) => {
    try {
      await api.delete(`/trips/${id}/expenses/${expId}`);
      fetchExpenses();
      fetchTripDetails();
    } catch (e) {}
  };

  // Payment Settlement Handlers
  const handleOpenSettleModal = (personName, defaultAmount) => {
    setSettlePayer(personName);
    setSettlePayee(user?.fullName || "Trip Organizer");
    setSettleAmount(Math.abs(defaultAmount || 0).toFixed(2));
    setSettleMethod("UPI / GPay");
    setSettleNotes("Settlement Payment");
    setShowSettleModal(true);
  };

  const handleRecordSettlement = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/trips/${id}/expenses/settle`, {
        payerName: settlePayer,
        payeeName: settlePayee,
        amount: parseFloat(settleAmount || 0),
        paymentMethod: settleMethod,
        notes: settleNotes
      });
      setShowSettleModal(false);
      fetchExpenses();
    } catch (e) {
      alert("Failed to log settlement payment.");
    }
  };

  const handleUndoSettlement = async (settleId) => {
    if (window.confirm("Are you sure you want to undo this settlement payment?")) {
      try {
        await api.delete(`/trips/${id}/expenses/settle/${settleId}`);
        fetchExpenses();
      } catch (e) {}
    }
  };

  // Group Handlers
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await api.post(`/trips/${id}/group/discussions`, {
        message: newMessage,
        senderName: user?.fullName || user?.username || (user?.email ? user.email.split('@')[0] : 'Traveler')
      });
      setNewMessage('');
      fetchDiscussions();
    } catch (e) {}
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    const targetEmail = inviteInput.trim().toLowerCase();
    if (!targetEmail) return;

    if (user?.email && targetEmail === user.email.toLowerCase()) {
      alert("You cannot send a trip invitation to yourself!");
      return;
    }

    try {
      const res = await api.post(`/trips/${id}/share`, { usernameOrEmail: inviteInput });
      alert(res.data?.message || `Invitation sent successfully to ${inviteInput}!`);
      setShowInviteModal(false);
      setInviteInput('');
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to send invitation. Please verify that '${inviteInput}' is registered on TripNest.`);
    }
  };

  // Document Handlers
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', docCategory);
    formData.append('title', selectedFile.name);

    try {
      await api.post(`/trips/${id}/documents/upload`, formData);
      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'File upload failed. Please try a smaller file.');
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await api.delete(`/trips/${id}/documents/${docId}`);
      fetchDocuments();
    } catch (e) {}
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Loading trip details...</div>;
  if (!trip) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--danger)' }}>Trip not found</div>;

  // Chart Data preparation
  const pieData = expenseSummary ? {
    labels: Object.keys(expenseSummary.categoryBreakdown || {}),
    datasets: [
      {
        data: Object.values(expenseSummary.categoryBreakdown || {}),
        backgroundColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
        borderWidth: 0,
      },
    ],
  } : null;

  const handleExportExpenseReport = () => {
    if (expenses.length === 0) {
      alert("No recorded expenses found to export.");
      return;
    }
    const headers = ["Title", "Category", "Date", "Amount", "Paid By"];
    const rows = expenses.map(e => [
      `"${e.title || 'Expense'}"`,
      `"${e.category || 'Miscellaneous'}"`,
      `"${e.date || ''}"`,
      `"${e.amount || 0}"`,
      `"${e.paidBy || 'You'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expense_Report_${(trip?.title || 'Trip').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Navigation */}
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Main Header Banner */}
      <div className="glass-panel" style={{ padding: 32, marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span className={`badge badge-${(trip.status || 'planned').toLowerCase()}`} style={{ marginBottom: 12 }}>
              {trip.status || 'PLANNED'}
            </span>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>{trip.title}</h1>
            <div style={{ display: 'flex', gap: 20, marginTop: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 600 }}>
                <MapPin size={18} color="var(--primary-accent)" /> {trip.destination}
              </span>
              {trip.startDate && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={18} /> {trip.startDate} - {trip.endDate || 'Ongoing'}
                </span>
              )}
            </div>
            {trip.notes && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 12, fontStyle: 'italic' }}>
                "{trip.notes}"
              </p>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px 24px', borderRadius: 16, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TARGET BUDGET</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                {formatAmount(trip.totalBudget || trip.budget || 0)}
              </div>
            </div>
            <button
              onClick={handleOpenEditModal}
              className="btn btn-secondary"
              style={{ marginTop: 12, fontSize: '0.82rem', padding: '6px 14px', gap: 6 }}
            >
              <Edit size={14} /> Edit Trip Details
            </button>
          </div>
        </div>
      </div>

      {/* Primary Sub-System Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-color)', marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'itinerary', label: 'Day-Wise Itinerary', icon: Calendar },
          { id: 'expenses', label: 'Payment & Expense Management', icon: IndianRupee },
          { id: 'collaboration', label: 'Group & Chat', icon: MessageSquare },
          { id: 'documents', label: 'Document Vault', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: isActive ? 'var(--primary-accent)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderBottom: isActive ? '3px solid var(--primary-accent)' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={18} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ITINERARY PLANNER */}
      {activeTab === 'itinerary' && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <TripMap query={trip?.destination || "Goa, India"} height="260px" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3>Day-by-Day Activity Schedule</h3>
            <button onClick={() => setShowActivityModal(true)} className="btn btn-primary">
              <Plus size={18} /> Add Activity
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="glass-panel" style={{ padding: 48, textAlign: 'center' }}>
              <Calendar size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
              <h4>No activities scheduled</h4>
              <p style={{ color: 'var(--text-muted)', margin: '8px 0 16px' }}>Add sightseeing, dining, or hotel bookings to your daily itinerary.</p>
              <button onClick={() => setShowActivityModal(true)} className="btn btn-secondary">
                <Plus size={16} /> Schedule Activity
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activities.map((act) => (
                <div key={act.id} className="glass-panel" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      background: 'var(--primary-gradient)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}>
                      Day {act.dayNumber}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{act.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                        {act.placeName && <span><MapPin size={14} /> {act.placeName} • </span>}
                        <Tag size={14} /> {act.category || 'Sightseeing'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {act.cost > 0 && (
                      <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                        {formatAmount(act.cost)}
                      </span>
                    )}
                    <button onClick={() => handleDeleteActivity(act.id)} className="btn btn-secondary" style={{ padding: 8, color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAYMENT & EXPENSE MANAGEMENT */}
      {activeTab === 'expenses' && (
        <div>
          {/* Budget Alert Banner if Over Budget */}
          {expenseSummary?.overBudget && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid var(--danger)',
              padding: '16px 20px',
              borderRadius: 12,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#f87171'
            }}>
              <AlertTriangle size={24} />
              <div>
                <strong>Over Budget Warning!</strong> Total spent ({formatAmount(expenseSummary.totalSpent)}) has exceeded your target budget limit of {formatAmount(expenseSummary.totalBudget)}.
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3>Budget Summary</h3>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Budget:</span>
                  <span style={{ fontWeight: 700 }}>{formatAmount(expenseSummary?.totalBudget || trip?.totalBudget || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Spent:</span>
                  <span style={{ fontWeight: 700, color: expenseSummary?.overBudget ? 'var(--danger)' : 'var(--success)' }}>
                    {formatAmount(expenseSummary?.totalSpent || 0)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Remaining:</span>
                  <span style={{ fontWeight: 700 }}>{formatAmount(expenseSummary?.remainingBudget || 0)}</span>
                </div>
              </div>
            </div>

            {/* Category Chart */}
            <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ marginBottom: 16, width: '100%' }}>Category Breakdown</h3>
              {pieData && Object.keys(expenseSummary?.categoryBreakdown || {}).length > 0 ? (
                <div style={{ width: 220, height: 220 }}>
                  <Pie data={pieData} options={{ plugins: { legend: { display: false } } }} />
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', padding: 40 }}>No expense breakdown data yet.</p>
              )}
            </div>
          </div>

          {/* Group Expense Splitting & Settlement Management Card */}
          <div className="glass-panel" style={{ padding: 24, marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Group Expense Splitting & Payment Tracking</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
                  Per Person Equal Share: <strong style={{ color: 'var(--primary-accent)' }}>{formatAmount(settlements?.perPersonShare || 0)}</strong> ({settlements?.memberCount || 1} Traveler(s))
                </p>
              </div>
            </div>

            {/* Member Balances */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {(settlements?.balances || []).map((b, i) => (
                <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>{b.person}</div>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: 'var(--primary-accent)', fontWeight: 700 }}>
                        {b.role || (i === 0 ? 'Organizer' : 'Co-Traveler')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div>Total Paid: <strong style={{ color: '#fff' }}>{formatAmount(b.totalPaid || 0)}</strong></div>
                      <div>Equal Share: <strong>{formatAmount(b.share || 0)}</strong></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>NET BALANCE</div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: b.netBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {b.netBalance >= 0 ? `+${formatAmount(b.netBalance)}` : formatAmount(b.netBalance)}
                      </div>
                    </div>

                    {b.netBalance < 0 && (
                      <button
                        onClick={() => handleOpenSettleModal(b.person, b.netBalance)}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#10b981', borderColor: '#10b981' }}
                      >
                        <CreditCard size={14} /> Settle Up
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Settlements History Log */}
            {settlements?.settlementsHistory && settlements.settlementsHistory.length > 0 && (
              <div style={{ marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 12 }}>Payment Settlement History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {settlements.settlementsHistory.map((s) => (
                    <div key={s.id} style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-accent)' }}>{s.payerName}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}> paid </span>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{s.payeeName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginLeft: 8 }}>({s.paymentMethod || 'UPI / Cash'})</span>
                        {s.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.notes}</div>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 800, color: 'var(--success)' }}>{formatAmount(s.amount)}</span>
                        <button onClick={() => handleUndoSettlement(s.id)} className="btn btn-secondary" style={{ padding: 4, color: 'var(--danger)' }} title="Undo Settlement">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3>Recorded Expenses</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleExportExpenseReport} className="btn btn-secondary">
                <Download size={16} /> Export Report (CSV)
              </button>
              <button onClick={() => setShowExpenseModal(true)} className="btn btn-primary">
                <Plus size={18} /> Record Expense
              </button>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="glass-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              No expenses recorded for this trip.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {expenses.map((exp) => (
                <div key={exp.id} className="glass-panel" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 700 }}>{exp.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Category: {exp.category} • Paid By: <strong style={{ color: 'var(--primary-accent)' }}>{exp.paidBy || 'Organizer'}</strong> • Date: {exp.date}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{formatAmount(exp.amount)}</span>
                    <button onClick={() => handleDeleteExpense(exp.id)} className="btn btn-secondary" style={{ padding: 6, color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GROUP COLLABORATION & DISCUSSIONS */}
      {activeTab === 'collaboration' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
          {/* Discussion Message Board */}
          <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', height: 500 }}>
            <h3 style={{ marginBottom: 16 }}>Group Discussion Board</h3>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 8 }}>
              {discussions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>
                  No messages yet. Start the group conversation!
                </p>
              ) : (
                discussions.map((msg) => (
                  <div key={msg.id} style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-accent)' }}>{msg.senderName}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#f3f4f6' }}>{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Type a group message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 18px' }}>
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Members Panel */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4>Members</h4>
              <button onClick={() => setShowInviteModal(true)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                <Plus size={14} /> Invite
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {members.map((m) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                    {m.fullName?.charAt(0) || m.username?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.fullName || m.username}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.roleInTrip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENT VAULT */}
      {activeTab === 'documents' && (
        <div>
          <div className="glass-panel" style={{ padding: 24, marginBottom: 28 }}>
            <h3>Upload Travel Document</h3>
            <form onSubmit={handleFileUpload} style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <select className="form-select" style={{ maxWidth: 200 }} value={docCategory} onChange={(e) => setDocCategory(e.target.value)}>
                <option value="Ticket">🎫 Flight / Train Ticket</option>
                <option value="Hotel Booking">🏨 Hotel Booking</option>
                <option value="Passport/Visa">🛂 Passport / Visa</option>
                <option value="Travel Photo">📸 Travel Photo</option>
                <option value="General Document">📄 General Document</option>
              </select>
              <input
                type="file"
                className="form-input"
                style={{ padding: 8, flex: 1, minWidth: 220 }}
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <button type="submit" className="btn btn-primary" disabled={!selectedFile}>
                <Upload size={18} /> Upload File
              </button>
            </form>
          </div>

          <h3>Saved Documents & Tickets</h3>
          {documents.length === 0 ? (
            <div className="glass-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', marginTop: 16 }}>
              No travel documents uploaded for this trip yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
              {documents.map((doc) => (
                <div key={doc.id} className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <FileText size={30} color="var(--primary-accent)" />
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'rgba(99,102,241,0.15)',
                        color: 'var(--primary-accent)',
                        fontSize: '0.7rem',
                        fontWeight: 800
                      }}>
                        {doc.type || ((doc.title || doc.fileName || 'file.pdf').split('.').pop() || 'file').toUpperCase()}
                      </span>
                    </div>
                    <h4 style={{ fontWeight: 800, fontSize: '0.98rem', wordBreak: 'break-all', color: 'var(--text-main)' }}>
                      {doc.title || doc.fileName || 'Travel_Document.pdf'}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Uploaded by: {doc.uploadedBy || 'User'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                    <a
                      href={`http://localhost:8080${doc.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <Download size={14} /> Download
                    </a>
                    <button onClick={() => handleDeleteDocument(doc.id)} className="btn btn-secondary" style={{ padding: 6, color: 'var(--danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Trip Details Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: 520 }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 20 }}>Edit Trip Details</h3>
            <form onSubmit={handleUpdateTrip}>
              <div className="form-group">
                <label className="form-label">Trip Title *</label>
                <input type="text" className="form-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Destination *</label>
                <input type="text" className="form-input" value={editDestination} onChange={(e) => setEditDestination(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Target Budget ({currencySymbol}) *</label>
                  <input type="number" min="1" step="0.01" className="form-input" value={editBudget} onChange={(e) => setEditBudget(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Trip Status</label>
                  <select className="form-select" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    <option value="PLANNED">PLANNED (Upcoming)</option>
                    <option value="ACTIVE">ACTIVE (Ongoing)</option>
                    <option value="COMPLETED">COMPLETED (Past Trip)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description / Notes</label>
                <textarea className="form-textarea" value={editNotes} onChange={(e) => setEditNotes(e.target.value)}></textarea>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Update Trip Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Creation Modal */}
      {showActivityModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h3>Schedule Activity</h3>
            <form onSubmit={handleAddActivity} style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Day Number</label>
                <input type="number" min="1" className="form-input" value={actDay} onChange={(e) => setActDay(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Activity Title</label>
                <input type="text" className="form-input" placeholder="e.g. Visit Eiffel Tower" value={actTitle} onChange={(e) => setActTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={actCategory} onChange={(e) => setActCategory(e.target.value)}>
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Dining">Dining</option>
                  <option value="Adventure Activities">Adventure Activities</option>
                  <option value="Shopping">Shopping</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Place Name / Location</label>
                <input type="text" className="form-input" placeholder="e.g. Champ de Mars, Paris" value={actPlace} onChange={(e) => setActPlace(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Cost (₹)</label>
                <input type="number" className="form-input" placeholder="0" value={actCost} onChange={(e) => setActCost(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" onClick={() => setShowActivityModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h3>Record Expense</h3>
            <form onSubmit={handleAddExpense} style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Expense Title</label>
                <input type="text" className="form-input" placeholder="e.g. Flight Tickets" value={expTitle} onChange={(e) => setExpTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" step="0.01" className="form-input" placeholder="150.00" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
                  <option value="Transportation">Transportation</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Food">Food</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Paid By</label>
                <select className="form-select" value={expPaidBy} onChange={(e) => setExpPaidBy(e.target.value)}>
                  {(settlements?.balances || []).map((b, idx) => (
                    <option key={idx} value={b.person}>{b.person}</option>
                  ))}
                  {(!settlements?.balances || settlements.balances.length === 0) && (
                    <option value="Trip Organizer">Trip Organizer</option>
                  )}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" onClick={() => setShowExpenseModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Record Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Up Payment Modal */}
      {showSettleModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: 460 }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 16 }}>Record Settlement Payment</h3>
            <form onSubmit={handleRecordSettlement}>
              <div className="form-group">
                <label className="form-label">Payer (Who is Paying)</label>
                <input type="text" className="form-input" value={settlePayer} onChange={(e) => setSettlePayer(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Payee (Receiving Payment)</label>
                <input type="text" className="form-input" value={settlePayee} onChange={(e) => setSettlePayee(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Settlement Amount ({currencySymbol})</label>
                <input type="number" step="0.01" className="form-input" value={settleAmount} onChange={(e) => setSettleAmount(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-select" value={settleMethod} onChange={(e) => setSettleMethod(e.target.value)}>
                  <option value="UPI / GPay / PhonePe">📱 UPI / GPay / PhonePe</option>
                  <option value="Cash">💵 Cash</option>
                  <option value="Credit / Debit Card">💳 Credit / Debit Card</option>
                  <option value="Bank Transfer">🏦 Bank Transfer</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input type="text" className="form-input" placeholder="e.g. Settled dinner share via GPay" value={settleNotes} onChange={(e) => setSettleNotes(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" onClick={() => setShowSettleModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }}>Log Settlement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: 440 }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 16 }}>Invite Traveler</h3>
            <form onSubmit={handleInviteUser}>
              <div className="form-group">
                <label className="form-label">Username or Email</label>
                <input type="text" className="form-input" placeholder="Enter username or email address" value={inviteInput} onChange={(e) => setInviteInput(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
