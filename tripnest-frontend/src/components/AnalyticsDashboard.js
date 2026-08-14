import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import analyticsService from '../services/analytics.service';
import Navbar from './Navbar';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AnalyticsDashboard = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const textColor = isDark ? '#cbd5e1' : '#334155';
  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getUserAnalytics();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
      setError('Unable to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-root">
        <Navbar />
        <div className="page-content">
          <div className="loading-spinner">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-root">
        <Navbar />
        <div className="page-content">
          <div className="alert alert-error">{error || 'No data found'}</div>
        </div>
      </div>
    );
  }

  // 1. Doughnut Chart Data (Category Expenses)
  const categoryLabels = Object.keys(data.categoryExpenses || {});
  const categoryValues = Object.values(data.categoryExpenses || {});

  const categoryChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['No Expenses Recorded'],
    datasets: [
      {
        label: 'Expenses (₹)',
        data: categoryValues.length > 0 ? categoryValues : [1],
        backgroundColor: [
          '#1e3a8a',
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 2. Bar Chart Data (Trip Budget vs Actual Spent)
  const tripTitles = (data.tripComparisons || []).map((t) => t.tripTitle);
  const tripBudgets = (data.tripComparisons || []).map((t) => t.budget);
  const tripSpents = (data.tripComparisons || []).map((t) => t.totalSpent);

  const budgetVsSpentData = {
    labels: tripTitles,
    datasets: [
      {
        label: 'Allocated Budget (₹)',
        data: tripBudgets,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
      {
        label: 'Total Spent (₹)',
        data: tripSpents,
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
    ],
  };

  // 3. Line Chart Data (Monthly Expenditure Trends)
  const monthLabels = Object.keys(data.monthlyExpenses || {});
  const monthValues = Object.values(data.monthlyExpenses || {});

  const monthlyTrendData = {
    labels: monthLabels.length > 0 ? monthLabels : ['Current Month'],
    datasets: [
      {
        label: 'Monthly Spending (₹)',
        data: monthValues.length > 0 ? monthValues : [0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">📊 Travel & Financial Analytics</h1>
            <p className="page-subtitle">Visual insight into your trip budgets, expenses, and travel patterns.</p>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="stats-row" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div style={{fontSize:'1.5rem',marginBottom:'0.375rem'}}>🗺️</div>
            <div className="stat-number">{data.totalTrips}</div>
            <div className="stat-label">Total Trips Planned</div>
          </div>
          <div className="stat-card">
            <div style={{fontSize:'1.5rem',marginBottom:'0.375rem'}}>💰</div>
            <div className="stat-number" style={{fontSize:'1.5rem'}}>₹{data.totalBudgetAllocated.toLocaleString()}</div>
            <div className="stat-label">Total Budget Allocated</div>
          </div>
          <div className="stat-card">
            <div style={{fontSize:'1.5rem',marginBottom:'0.375rem'}}>📊</div>
            <div className="stat-number" style={{ fontSize:'1.5rem', color: data.totalSpentAllTrips > data.totalBudgetAllocated ? 'var(--accent-danger)' : 'var(--accent)' }}>
              ₹{data.totalSpentAllTrips.toLocaleString()}
            </div>
            <div className="stat-label">Total Spent</div>
          </div>
          <div className="stat-card">
            <div style={{fontSize:'1.5rem',marginBottom:'0.375rem'}}>🌍</div>
            <div className="stat-number">{Object.keys(data.topDestinations || {}).length}</div>
            <div className="stat-label">Unique Destinations</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
          {/* Chart 1: Category Expenses */}
          <div className="section-card">
            <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>🏷️ Spending by Category</h3>
            <div style={{ maxHeight: '300px', display: 'flex', justifyContent: 'center' }}>
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: textColor, font: { family: 'Inter', size: 12 } }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Chart 2: Budget vs Spent per Trip */}
          <div className="section-card">
            <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>⚖️ Budget vs Actual Spent per Trip</h3>
            <div style={{ height: '300px' }}>
              <Bar
                data={budgetVsSpentData}
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

          {/* Chart 3: Monthly Spending Trend */}
          <div className="section-card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>📈 Monthly Expenditure Trend</h3>
            <div style={{ height: '280px' }}>
              <Line
                data={monthlyTrendData}
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
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

