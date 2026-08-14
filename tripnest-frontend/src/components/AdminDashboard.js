import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import adminService from '../services/admin.service';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  Users,
  RefreshCw,
  PieChart,
  BarChart3,
  CheckCircle,
  Search
} from 'lucide-react';
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
  const { isDark } = useTheme();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUser, setUpdatingUser] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  const textColor = isDark ? '#cbd5e1' : '#334155';
  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

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
      <div className="page-root">
        <Navbar />
        <div className="page-content" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{
            display: 'inline-block',
            width: '40px', height: '40px',
            border: '3px solid rgba(16,185,129,0.2)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '1rem',
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading platform administration portal...</p>
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="page-root">
        <Navbar />
        <div className="page-content" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
          <div className="section-card" style={{ padding: '3rem 2rem' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔒</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Access Denied</h3>
            <p style={{ color: 'var(--accent-danger)', fontSize: '0.9rem' }}>{error}</p>
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
        borderColor: isDark ? '#0d1b2e' : '#ffffff',
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
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-root">
      <Navbar />

      <div className="page-content">
        {/* Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <span className="badge badge-cancelled" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Shield size={12} />
                <span>Admin Console</span>
              </span>
            </div>
            <h1 className="page-title" style={{ fontSize: '1.875rem' }}>Platform Analytics & Management</h1>
            <p className="page-subtitle">Real-time statistics across all users, trips, and destinations.</p>
          </div>

          <button
            onClick={fetchData}
            className="btn btn-outline btn-auto"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={14} />
            <span>Refresh Data</span>
          </button>
        </div>

        {actionMsg && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="stats-row" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>👥</div>
            <div className="stat-number">{overview?.totalUsers || 0}</div>
            <div className="stat-label">Total Travelers</div>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>🗺️</div>
            <div className="stat-number" style={{ color: 'var(--accent)' }}>{overview?.totalTrips || 0}</div>
            <div className="stat-label">Total Trips</div>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>📍</div>
            <div className="stat-number" style={{ color: 'var(--accent-info)' }}>{overview?.totalDestinations || 0}</div>
            <div className="stat-label">Curated Destinations</div>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>💰</div>
            <div className="stat-number" style={{ color: 'var(--accent-2)', fontSize: '1.75rem' }}>
              ₹{overview?.totalPlatformExpenseVolume?.toLocaleString() || '0'}
            </div>
            <div className="stat-label">Expense Volume</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="section-card">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <PieChart size={18} style={{ color: 'var(--accent)' }} />
              <span>User Role Distribution</span>
            </h3>
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut
                data={roleChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: textColor, font: { family: 'Inter', size: 12 } }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="section-card">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <BarChart3 size={18} style={{ color: 'var(--accent-info)' }} />
              <span>Top Booked Destinations</span>
            </h3>
            <div style={{ height: '260px' }}>
              <Bar
                data={destChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: textColor, font: { family: 'Inter', size: 12 } }
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: textColor, font: { family: 'Inter' } },
                      grid: { color: gridColor }
                    },
                    y: {
                      ticks: { color: textColor, font: { family: 'Inter' } },
                      grid: { color: gridColor }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="section-card">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--accent)' }} />
              <span>User Directory & Role Assignment ({users.length})</span>
            </h3>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search user by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', padding: '0.5rem 0.75rem 0.5rem 2.25rem' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Trips</th>
                  <th>Current Roles</th>
                  <th>Assign Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {u.fullName || u.username}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.phone || '—'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{u.tripsCount || 0}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {u.roles?.map((r, i) => {
                          const badgeCls = r.includes('ADMIN')
                            ? 'badge-cancelled'
                            : r.includes('AGENT')
                            ? 'badge-ongoing'
                            : 'badge-completed';
                          return (
                            <span key={i} className={`badge ${badgeCls}`} style={{ fontSize: '0.7rem' }}>
                              {r.replace('ROLE_', '')}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <select
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={updatingUser === u.id}
                        defaultValue=""
                        className="form-input form-select"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', width: 'auto', minWidth: '130px' }}
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
