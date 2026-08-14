import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import adminService from '../services/admin.service';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUser, setUpdatingUser] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [ovRes, usRes] = await Promise.all([
        adminService.getOverview(),
        adminService.getUsers()
      ]);
      setOverview(ovRes.data);
      setUsers(usRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin dashboard. Please ensure you have Administrator privileges.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingUser(userId);
      setActionMsg('');
      const res = await adminService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? res.data : u));
      setActionMsg(`Role updated to ${newRole} successfully!`);
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error('Role update error:', err);
      setError(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setUpdatingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p>Loading platform administration portal...</p>
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-8 shadow-2xl">
            <span className="text-4xl block mb-3">🔒</span>
            <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
            <p className="text-rose-300 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const roleChartData = {
    labels: overview?.userRoleDistribution ? Object.keys(overview.userRoleDistribution) : [],
    datasets: [
      {
        data: overview?.userRoleDistribution ? Object.values(overview.userRoleDistribution) : [],
        backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
        borderColor: '#0f172a',
        borderWidth: 2,
      },
    ],
  };

  const destChartData = {
    labels: overview?.destinationPopularity ? Object.keys(overview.destinationPopularity).slice(0, 6) : [],
    datasets: [
      {
        label: 'Trips Planned',
        data: overview?.destinationPopularity ? Object.values(overview.destinationPopularity).slice(0, 6) : [],
        backgroundColor: '#06b6d4',
        borderRadius: 8,
      },
    ],
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                Admin Console
              </span>
            </div>
            <h1 className="text-3xl font-black text-white mt-1">Platform Analytics & Management</h1>
            <p className="text-slate-400 text-sm mt-0.5">Real-time statistics across all users, trips, and destinations.</p>
          </div>

          <button
            onClick={fetchData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors border border-slate-700"
          >
            🔄 Refresh Data
          </button>
        </div>

        {actionMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-sm font-medium">
            {actionMsg}
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Travelers</span>
            <span className="text-3xl font-black text-white mt-1 block">{overview?.totalUsers || 0}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Trips</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">{overview?.totalTrips || 0}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-semibold uppercase text-slate-400">Curated Destinations</span>
            <span className="text-3xl font-black text-cyan-400 mt-1 block">{overview?.totalDestinations || 0}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-semibold uppercase text-slate-400">Expense Volume</span>
            <span className="text-2xl font-black text-purple-400 mt-1 block">₹{overview?.totalPlatformExpenseVolume?.toLocaleString() || '0'}</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span>👥</span> User Role Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={roleChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span>📍</span> Top Booked Destinations
            </h3>
            <div className="h-64">
              <Bar data={destChartData} options={{ maintainAspectRatio: false, scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } } }} />
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🛡️</span> User Directory & Role Assignment ({users.length})
            </h3>
            <input
              type="text"
              placeholder="Search user by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Trips</th>
                  <th className="py-3 px-4">Current Roles</th>
                  <th className="py-3 px-4">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-white">
                      {u.fullName} <span className="text-xs text-slate-500">(@{u.username})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{u.email}</td>
                    <td className="py-3 px-4 text-slate-400">{u.phone || '—'}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{u.tripsCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r, i) => (
                          <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            r.includes('ADMIN') ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            r.includes('AGENT') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {r.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={updatingUser === u.id}
                        defaultValue=""
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      >
                        <option value="" disabled>Change Role...</option>
                        <option value="ROLE_TRAVELER">Traveler</option>
                        <option value="ROLE_AGENT">Agent</option>
                        <option value="ROLE_ADMIN">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
